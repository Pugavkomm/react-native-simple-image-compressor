package com.margelo.nitro.simpleimagecompressor

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.os.Build
import androidx.exifinterface.media.ExifInterface
import java.io.File
import java.io.FileOutputStream
import java.util.UUID
import kotlin.math.min

object SimpleCompressorService {

  private val EXIF_TAGS_TO_COPY = arrayOf(
    // Datetime
    ExifInterface.TAG_DATETIME,
    ExifInterface.TAG_DATETIME_ORIGINAL,
    ExifInterface.TAG_DATETIME_DIGITIZED,
    ExifInterface.TAG_SUBSEC_TIME,
    ExifInterface.TAG_SUBSEC_TIME_ORIGINAL,
    ExifInterface.TAG_SUBSEC_TIME_DIGITIZED,

    // Camera information
    ExifInterface.TAG_MAKE,
    ExifInterface.TAG_MODEL,
    ExifInterface.TAG_LENS_MAKE,
    ExifInterface.TAG_LENS_MODEL,

    // Shooting parameters
    ExifInterface.TAG_F_NUMBER,
    ExifInterface.TAG_PHOTOGRAPHIC_SENSITIVITY,
    ExifInterface.TAG_EXPOSURE_TIME,
    ExifInterface.TAG_FOCAL_LENGTH,
    ExifInterface.TAG_FLASH,
    ExifInterface.TAG_WHITE_BALANCE,
    ExifInterface.TAG_COLOR_SPACE,

    // GPS
    ExifInterface.TAG_GPS_LATITUDE,
    ExifInterface.TAG_GPS_LATITUDE_REF,
    ExifInterface.TAG_GPS_LONGITUDE,
    ExifInterface.TAG_GPS_LONGITUDE_REF,
    ExifInterface.TAG_GPS_ALTITUDE,
    ExifInterface.TAG_GPS_ALTITUDE_REF,
    ExifInterface.TAG_GPS_TIMESTAMP,
    ExifInterface.TAG_GPS_DATESTAMP,
    ExifInterface.TAG_GPS_PROCESSING_METHOD
  )

  fun compress(
    sourceUri: String,
    quality: Double,
    maxWidth: Int? = null,
    maxHeight: Int? = null,
    format: OutputCompressedFormat,
    enablePhysicalRotation: Boolean = false,
  ): CompressedResult {
    //  Validation
    isValidParameters(quality, maxWidth, maxHeight)
    val filePath = resolveFilePath(sourceUri)
    //  Read source
    val sourceOptions = decodeBounds(filePath)
    var (height: Int, width: Int) = sourceOptions.run { outHeight to outWidth }
    val actualRotationDeg = getRotationDegrees(filePath)

    if (actualRotationDeg == 90 || actualRotationDeg == 270) {
      val temp = width
      width = height
      height = temp
    }

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

    val rotationToApply = if (enablePhysicalRotation) actualRotationDeg else 0
    var physicalTargetWidth = targetWidth
    var physicalTargetHeight = targetHeight

    if (!enablePhysicalRotation && (actualRotationDeg == 90 || actualRotationDeg == 270)) {
      physicalTargetWidth = targetHeight
      physicalTargetHeight = targetWidth
    }

    val transformed =
      scaleAndRotateBitmap(source, physicalTargetWidth, physicalTargetHeight, rotationToApply)
    val qualityInt = resolveQuality(quality, format)
    val compressFormat = resolveCompressFormat(format)
    val extension = resolveFileExtension(format)
    val cacheDir = File(System.getProperty("java.io.tmpdir") ?: "/tmp")
    val resultFile = compressToFile(transformed, compressFormat, extension, qualityInt, cacheDir)
    if (format == OutputCompressedFormat.JPEG || format == OutputCompressedFormat.JPG) {
      copyExifMetadata(filePath, resultFile.absolutePath, !enablePhysicalRotation)
    }

    return CompressedResult(
      uri = "file://${resultFile.absolutePath}",
      width = physicalTargetWidth.toDouble(),
      height = physicalTargetHeight.toDouble()
    )
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

    if (!file.canRead())
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
      this.inSampleSize = inSampleSize
    }

    return BitmapFactory.decodeFile(filePath, opts)
      ?: throw ImageCompressorException.DecodingFailed()
  }

  private fun getRotationDegrees(filePath: String): Int {
    val exif = ExifInterface(filePath)
    return when (exif.getAttributeInt(
      ExifInterface.TAG_ORIENTATION,
      ExifInterface.ORIENTATION_NORMAL
    )) {
      ExifInterface.ORIENTATION_ROTATE_90 -> 90
      ExifInterface.ORIENTATION_ROTATE_180 -> 180
      ExifInterface.ORIENTATION_ROTATE_270 -> 270
      else -> 0
    }
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

  private fun scaleAndRotateBitmap(
    source: Bitmap,
    targetWidth: Int,
    targetHeight: Int,
    rotationDeg: Int
  ): Bitmap {

    val matrix = Matrix()

    // Rotation is taken into account for correct scaling.
    val destPhysicalWidth =
      if (rotationDeg == 90 || rotationDeg == 270) targetHeight else targetWidth
    val destPhysicalHeight =
      if (rotationDeg == 90 || rotationDeg == 270) targetWidth else targetHeight

    if (source.width != destPhysicalWidth || source.height != destPhysicalHeight) {
      val scaleX = destPhysicalWidth.toFloat() / source.width
      val scaleY = destPhysicalHeight.toFloat() / source.height
      matrix.postScale(scaleX, scaleY)
    }

    if (rotationDeg != 0) {
      matrix.postRotate(rotationDeg.toFloat())
    }

    if (matrix.isIdentity) return source

    val transformed = Bitmap.createBitmap(
      source,
      0, 0,
      source.width, source.height,
      matrix,
      true
    )

    if (transformed !== source) {
      source.recycle()
    }
    return transformed
  }

  private fun resolveQuality(quality: Double, format: OutputCompressedFormat): Int {
    // Force quality to 100 to 100 for WEBP_LOSSLESS on older Android versions (API < 30)
    if (format == OutputCompressedFormat.WEBP_LOSSLESS && Build.VERSION.SDK_INT < Build.VERSION_CODES.R)
      return 100
    return (quality * 100).toInt().coerceIn(0, 100)
  }

  private fun resolveCompressFormat(format: OutputCompressedFormat): Bitmap.CompressFormat {
    return when (format) {
      OutputCompressedFormat.PNG -> Bitmap.CompressFormat.PNG
      OutputCompressedFormat.WEBP -> {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) { // API >= 30
          Bitmap.CompressFormat.WEBP_LOSSY
        } else {
          @Suppress("DEPRECATION")
          Bitmap.CompressFormat.WEBP
        }
      }

      OutputCompressedFormat.WEBP_LOSSLESS -> {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
          Bitmap.CompressFormat.WEBP_LOSSLESS
        } else {
          @Suppress("DEPRECATION")
          Bitmap.CompressFormat.WEBP
        }
      }

      else -> Bitmap.CompressFormat.JPEG
    }
  }

  private fun resolveFileExtension(format: OutputCompressedFormat): String {
    return when (format) {
      OutputCompressedFormat.PNG -> ".png"
      OutputCompressedFormat.WEBP, OutputCompressedFormat.WEBP_LOSSLESS -> ".webp"
      OutputCompressedFormat.JPG, OutputCompressedFormat.JPEG -> ".jpg"
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
    } catch (_: Exception) {
      throw ImageCompressorException.CannotCreateDest()
    }

    fos.use {
      val success = bitMap.compress(compressFormat, quality, it)
      if (!success) throw ImageCompressorException.WriteFailed()
    }
    return outputFile
  }

  private fun copyExifMetadata(
    originalPath: String,
    compressedPath: String,
    includeOrientation: Boolean
  ) {
    try {
      val oldExif = ExifInterface(originalPath)
      val newExif = ExifInterface(compressedPath)

      var hasChanges = false

      val tagsToCopy = if (includeOrientation) {
        EXIF_TAGS_TO_COPY + ExifInterface.TAG_ORIENTATION
      } else {
        EXIF_TAGS_TO_COPY
      }
      for (tag in tagsToCopy) {
        val value = oldExif.getAttribute(tag)
        if (value != null) {
          newExif.setAttribute(tag, value)
          hasChanges = true
        }
      }



      if (hasChanges) {
        newExif.saveAttributes()
      }
    } catch (e: Exception) {
      e.printStackTrace()
    }
  }
}
