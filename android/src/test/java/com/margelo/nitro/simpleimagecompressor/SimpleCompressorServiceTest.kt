package com.margelo.nitro.simpleimagecompressor

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.os.Build
import androidx.exifinterface.media.ExifInterface
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import java.io.File
import java.io.FileOutputStream
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [Build.VERSION_CODES.O_MR1])
@org.robolectric.annotation.GraphicsMode(org.robolectric.annotation.GraphicsMode.Mode.NATIVE)
class SimpleCompressorServiceTest {
  private val fakeUrl = "file:///fake/path.jpg"

  private fun readImageFile(uri: String): Pair<File, BitmapFactory.Options> {
    val resultFile = File(uri.removePrefix("file://"))

    val resultOptions = BitmapFactory.Options().apply { inJustDecodeBounds = true }
    BitmapFactory.decodeFile(resultFile.absolutePath, resultOptions)
    return resultFile to resultOptions
  }

  // helper to generate test image
  private fun createTestImageFile(width: Int, height: Int): File {
    val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
    bitmap.eraseColor(Color.RED)
    val tmpFile = File.createTempFile("test_img", ".jpg")

    FileOutputStream(tmpFile).use { fos -> bitmap.compress(Bitmap.CompressFormat.JPEG, 100, fos) }
    return tmpFile
  }

  @Test
  fun `test invalid quality greater than one parameter throws exception`() {
    assertFailsWith<ImageCompressorException.InvalidParameters> {
      SimpleCompressorService.compress(
        sourceUri = "file:///fake/path.jpg",
        quality = 1.5, // > 1.0
        maxWidth = null,
        maxHeight = null,
        format = OutputCompressedFormat.JPEG
      )
    }
  }

  @Test
  fun `test invalid quality less than zero parameter throws exception`() {
    assertFailsWith<ImageCompressorException.InvalidParameters> {
      SimpleCompressorService.compress(
        sourceUri = "file:///fake/path.jpg",
        quality = -0.1, // < 0.0
        maxWidth = null,
        maxHeight = null,
        format = OutputCompressedFormat.JPEG
      )
    }
  }

  @Test
  fun `test invalid maxWidth parameter throws exception`() {
    assertFailsWith<ImageCompressorException.InvalidParameters> {
      SimpleCompressorService.compress(
        sourceUri = "file:///fake/path.jpg",
        quality = 0.1,
        maxWidth = -100,
        maxHeight = null,
        format = OutputCompressedFormat.JPEG
      )
    }
  }

  @Test
  fun `test invalid maxHeight parameter throws exception`() {
    assertFailsWith<ImageCompressorException.InvalidParameters> {
      SimpleCompressorService.compress(
        sourceUri = fakeUrl,
        quality = 0.1,
        maxWidth = null,
        maxHeight = -100,
        format = OutputCompressedFormat.JPEG
      )
    }
  }

  @Test
  fun `test file not found throws exception`() {
    assertFailsWith<ImageCompressorException.FileNotFound> {
      SimpleCompressorService.compress(
        sourceUri = fakeUrl,
        quality = 0.1,
        format = OutputCompressedFormat.JPEG
      )
    }
  }

  @Suppress("DEPRECATION")
  @Test
  fun `test compress CannotReadDimensions when file is not an image`() {
    val cacheDir = File(System.getProperty("java.io.tmpdir") ?: "/tmp")
    val fakeImageFile = File(cacheDir, "fake_image.jpg")
    fakeImageFile.writeText("Not an actual image data structure")
    org.robolectric.shadows.ShadowBitmapFactory.provideWidthAndHeightHints(
      fakeImageFile.absolutePath,
      -1,
      -1
    )
    assertFailsWith<ImageCompressorException.CannotReadDimensions> {
      SimpleCompressorService.compress(
        sourceUri = "file://${fakeImageFile.absolutePath}",
        quality = 0.1,
        format = OutputCompressedFormat.JPEG
      )
    }
    fakeImageFile.delete()
  }

  @Test
  fun `test compress without resize image`() {
    val testFile = createTestImageFile(4000, 3000)
    val result = SimpleCompressorService.compress(
      sourceUri = "file://${testFile.absolutePath}",
      quality = 0.5,
      format = OutputCompressedFormat.JPEG
    )

    val (resultFile, resultOptions) = readImageFile(result.uri)
    assertEquals(4000, resultOptions.outWidth)
    assertEquals(3000, resultOptions.outHeight)

    val originalSize = testFile.length()
    val compressedSize = resultFile.length()

    assert(compressedSize > 0) { "Compressed file should not be empty" }
    assert(originalSize > compressedSize)
    testFile.delete()
  }

  @Test
  fun `test compress resizes image correctly when maxWidth is set`() {
    val testFile = createTestImageFile(4000, 3000)
    val result = SimpleCompressorService.compress(
      sourceUri = "file://${testFile.absolutePath}",
      quality = 0.8,
      maxWidth = 1000,
      maxHeight = null,
      format = OutputCompressedFormat.JPEG
    )
    val resultOptions = readImageFile(result.uri).second
    assertEquals(1000, resultOptions.outWidth)
    assertEquals(750, resultOptions.outHeight)
    testFile.delete()
  }

  @Test
  fun `test compress resizes image correctly when maxHeight is set`() {
    val testFile = createTestImageFile(4000, 3000)
    val result = SimpleCompressorService.compress(
      sourceUri = "file://${testFile.absolutePath}",
      quality = 0.8,
      maxHeight = 1500,
      format = OutputCompressedFormat.JPEG
    )

    val resultOptions = readImageFile(result.uri).second
    assertEquals(2000, resultOptions.outWidth)
    assertEquals(1500, resultOptions.outHeight)
    testFile.delete()
  }

  @Test
  fun `test compress resizes image correctly when maxHeight and maxWidth are set`() {
    val testFile = createTestImageFile(4000, 3000)
    val result = SimpleCompressorService.compress(
      sourceUri = "file://${testFile.absolutePath}",
      quality = 0.8,
      maxWidth = 1000,
      maxHeight = 1000,
      format = OutputCompressedFormat.JPEG
    )

    val resultOptions = readImageFile(result.uri).second
    assertEquals(1000, resultOptions.outWidth)
    assertEquals(750, resultOptions.outHeight)
    testFile.delete()
  }


  @Test
  fun `compress returns correct file extensions and mime types`() {
    val testFile = createTestImageFile(100, 100)

    val pngResult = SimpleCompressorService.compress(
      sourceUri = "file://${testFile.absolutePath}",
      quality = 1.0,
      format = OutputCompressedFormat.PNG // Просим PNG
    )

    assert(pngResult.uri.endsWith(".png")) { "Expected URI to end with .png" }

    val (pngFile, pngOptions) = readImageFile(pngResult.uri)
    assertEquals("image/png", pngOptions.outMimeType)


    val webpResult = SimpleCompressorService.compress(
      sourceUri = "file://${testFile.absolutePath}",
      quality = 1.0,
      format = OutputCompressedFormat.WEBP // Просим WEBP
    )

    assert(webpResult.uri.endsWith(".webp")) { "Expected URI to end with .webp" }

    val (webpFile, webpOptions) = readImageFile(webpResult.uri)
    assertEquals("image/webp", webpOptions.outMimeType)


    testFile.delete()
    pngFile.delete()
    webpFile.delete()
  }

  @Test
  fun `test compress preserves EXIF metadata for JPEG`() {
    val testFile = createTestImageFile(100, 100)

    val originalExif = ExifInterface(testFile.absolutePath)
    originalExif.setAttribute(ExifInterface.TAG_MAKE, "TestCameraBrand")
    originalExif.setAttribute(ExifInterface.TAG_MODEL, "TestCameraModel")
    originalExif.setAttribute(ExifInterface.TAG_DATETIME, "2023:10:25 12:00:00")
    originalExif.saveAttributes()

    val result = SimpleCompressorService.compress(
      sourceUri = "file://${testFile.absolutePath}",
      quality = 0.8,
      format = OutputCompressedFormat.JPEG
    )

    val compressedFilePath = result.uri.removePrefix("file://")
    val compressedExif = ExifInterface(compressedFilePath)

    assertEquals("TestCameraBrand", compressedExif.getAttribute(ExifInterface.TAG_MAKE))
    assertEquals("TestCameraModel", compressedExif.getAttribute(ExifInterface.TAG_MODEL))
    assertEquals("2023:10:25 12:00:00", compressedExif.getAttribute(ExifInterface.TAG_DATETIME))

    testFile.delete()
    File(compressedFilePath).delete()
  }

  @Test
  fun `test compress applies EXIF orientation and swaps dimensions`() {
    val testFile = createTestImageFile(4000, 2000)

    val originalExif = ExifInterface(testFile.absolutePath)
    originalExif.setAttribute(
      ExifInterface.TAG_ORIENTATION,
      ExifInterface.ORIENTATION_ROTATE_90.toString()
    )
    originalExif.saveAttributes()

    val result = SimpleCompressorService.compress(
      sourceUri = "file://${testFile.absolutePath}",
      quality = 0.8,
      maxWidth = 500,
      maxHeight = 1000,
      format = OutputCompressedFormat.JPEG
    )

    val (resultFile, resultOptions) = readImageFile(result.uri)

    assertEquals(500, resultOptions.outWidth)
    assertEquals(1000, resultOptions.outHeight)

    // Check EEXIF
    val compressedExif = ExifInterface(resultFile.absolutePath)
    val finalOrientation = compressedExif.getAttributeInt(
      ExifInterface.TAG_ORIENTATION,
      ExifInterface.ORIENTATION_NORMAL
    )

    assert(finalOrientation == ExifInterface.ORIENTATION_UNDEFINED || finalOrientation == ExifInterface.ORIENTATION_NORMAL)

    testFile.delete()
    resultFile.delete()
  }
}
