package com.margelo.nitro.simpleimagecompressor

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Build
import androidx.core.graphics.scale
import java.io.File
import java.io.FileOutputStream
import java.util.UUID
import kotlin.math.min

object SimpleCompressorService {
  fun compress(
    sourceUri: String,
    quality: Double,
    maxWidth: Int? = null,
    maxHeight: Int? = null,
    format: OutputCompressedFormat
  ): CompressedResult {
    //  Validation
    isValidParameters(quality, maxWidth, maxHeight)
    val filePath = resolveFilePath(sourceUri)
    //  Read source
    val sourceOptions = decodeBounds(filePath)
    val (height: Int, width: Int) = sourceOptions.run { outHeight to outWidth }
    val inSampleSize: Int = if (maxWidth != null || maxHeight != null) calculateInSampleSize(
      width,
      height,
      maxWidth ?: width,
      maxHeight ?: height
    ) else 1
    val source = decodeSampledBitmap(filePath, inSampleSize)
    val (targetWidth: Int, targetHeight: Int) = calculateTargetDimension(
      width,
      height,
      maxWidth,
      maxHeight
    )

    val scaled = scaleBitmap(source, targetWidth, targetHeight)
    val qualityInt = (quality * 100).toInt().coerceIn(0, 100)
    val compressFormat = resolveCompressFormat(format)
    val extension = resolveFileExtension(format)
    val cacheDir = File(System.getProperty("java.io.tmpdir") ?: "/tmp")
    val resultFile = compressToFile(scaled, compressFormat, extension, qualityInt, cacheDir)

    return CompressedResult(uri = "file://${resultFile.absolutePath}")
  }

  //  Validation
  private fun isValidParameters(quality: Double, maxWidth: Int?, maxHeight: Int?) {
    if (quality !in 0.0..1.0)
      throw ImageCompressorException.InvalidParameters()

    if ((maxWidth != null && maxWidth <= 0) || (maxHeight != null && maxHeight <= 0))
      throw ImageCompressorException.InvalidParameters()
  }

  private fun resolveFilePath(uri: String): String {
    val cleanUri = uri.removePrefix("file://")

    if (cleanUri.isEmpty()) throw ImageCompressorException.InvalidSourceUri()

    val file = File(cleanUri)
    if (!file.exists())
      throw ImageCompressorException.FileNotFound()

    if(!file.canRead())
      throw ImageCompressorException.CannotReadResource()

    return file.absolutePath
  }

  //  Two-pass decoding
  // 1. Decode bounds
  private fun decodeBounds(filePath: String): BitmapFactory.Options {
    val opts = BitmapFactory.Options().apply {
      inJustDecodeBounds = true
    }
    BitmapFactory.decodeFile(filePath, opts)

    if (opts.outWidth == -1 || opts.outHeight == -1) {
      throw ImageCompressorException.CannotReadDimensions()
    }
    return opts
  }

  private fun calculateInSampleSize(
    outWidth: Int,
    outHeight: Int,
    reqWidth: Int,
    reqHeight: Int
  ): Int {
    var inSampleSize = 1
    if (outWidth > reqWidth || outHeight > reqHeight) {
      val halfHeight = outHeight / 2
      val halfwidth = outWidth / 2

      while (halfHeight / inSampleSize >= reqHeight && halfwidth / inSampleSize >= reqWidth)
        inSampleSize *= 2
    }

    return inSampleSize
  }

  // 2. Subsampling
  private fun decodeSampledBitmap(filePath: String, inSampleSize: Int): Bitmap {
    val opts = BitmapFactory.Options().apply {
      inJustDecodeBounds = false
    }

    return BitmapFactory.decodeFile(filePath, opts)
      ?: throw ImageCompressorException.DecodingFailed()
  }

  /**
   * Calculates the target sizes for downsampling, preserving the original aspect ratio.
   *
   * @param width The original width of the image in pixels
   * @param height The original height of the image in pixels
   * @param maxHeight An optional limit for the image width
   * @param maxWidth An optional limit for the image height
   * @return Pair of target width and height
   */
  private fun calculateTargetDimension(
    width: Int,
    height: Int,
    maxWidth: Int?,
    maxHeight: Int?
  ): Pair<Int, Int> {
    var scale = 1.0

    if (maxWidth != null && maxHeight != null)
      scale = min(maxWidth.toDouble() / width, maxHeight.toDouble() / height)
    else if (maxWidth != null)
      scale = maxWidth.toDouble() / width
    else if (maxHeight != null)
      scale = maxHeight.toDouble() / height

    if (scale >= 1.0) return width to height
    return (width * scale).toInt() to (height * scale).toInt()
  }

  private fun scaleBitmap(source: Bitmap, targetWidth: Int, targetHeight: Int): Bitmap {
    if (source.width == targetWidth && source.height == targetHeight) return source

    val scaled = source.scale(targetWidth, targetHeight)
    if (scaled !== source) {
      source.recycle()
    }
    return scaled
  }

  private fun resolveCompressFormat(format: OutputCompressedFormat): Bitmap.CompressFormat {
    return when (format) {
      OutputCompressedFormat.PNG -> Bitmap.CompressFormat.PNG
      OutputCompressedFormat.WEBP -> {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
          Bitmap.CompressFormat.WEBP_LOSSY // API: 30
        } else {
          @Suppress("DEPRECATION")
          Bitmap.CompressFormat.WEBP // API < 30
        }
      }

      else -> Bitmap.CompressFormat.JPEG
    }
  }

  private fun resolveFileExtension(format: OutputCompressedFormat): String {
    return when (format) {
      OutputCompressedFormat.PNG -> ".png"
      OutputCompressedFormat.WEBP -> ".webp"
      OutputCompressedFormat.JPG,
      OutputCompressedFormat.JPEG -> ".jpg"
    }
  }

  private fun compressToFile(
    bitMap: Bitmap,
    compressFormat: Bitmap.CompressFormat,
    extension: String,
    quality: Int,
    cacheDir: File
  ): File {

    val outputFile = File(cacheDir, "${UUID.randomUUID()}${extension}")


    val fos = try {
      FileOutputStream(outputFile)
    } catch (e: Exception) {
      throw ImageCompressorException.CannotCreateDest()
    }

    fos.use {
      val success = bitMap.compress(compressFormat, quality, it)
      if(!success) throw ImageCompressorException.WriteFailed()
    }
    return outputFile
  }
}
