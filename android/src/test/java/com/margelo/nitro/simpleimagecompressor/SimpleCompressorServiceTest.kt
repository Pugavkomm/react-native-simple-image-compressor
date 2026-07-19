package com.margelo.nitro.simpleimagecompressor

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.net.Uri
import android.os.Build
import androidx.exifinterface.media.ExifInterface
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
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
  private val context = RuntimeEnvironment.getApplication()

  private fun readImageFile(uri: String): Pair<File, BitmapFactory.Options> {
    val path = uri.removePrefix("file://")
    val resultFile = File(if (path.startsWith("/")) path else "/$path")
    val resultOptions = BitmapFactory.Options().apply { inJustDecodeBounds = true }
    BitmapFactory.decodeFile(resultFile.absolutePath, resultOptions)
    return resultFile to resultOptions
  }

  // helper to generate test image with file:// URI (used by most tests)
  private fun createTestImageFile(width: Int, height: Int): String {
    val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
    bitmap.eraseColor(Color.RED)
    val tmpFile = File.createTempFile("test_img", ".jpg")
    FileOutputStream(tmpFile).use { fos -> bitmap.compress(Bitmap.CompressFormat.JPEG, 100, fos) }
    return "file://${tmpFile.absolutePath}"
  }

  @Test
  fun `test invalid quality greater than one parameter throws exception`() {
    assertFailsWith<ImageCompressorException.InvalidParameters> {
      SimpleCompressorService.compress(
        context = context,
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
        context = context,
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
        context = context,
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
        context = context,
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
        context = context,
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
        context = context,
        sourceUri = "file://${fakeImageFile.absolutePath}",
        quality = 0.1,
        format = OutputCompressedFormat.JPEG
      )
    }
    fakeImageFile.delete()
  }

  @Test
  fun `test compress without resize image`() {
    val testFileUri = createTestImageFile(4000, 3000)
    val result = SimpleCompressorService.compress(
      context = context,
      sourceUri = testFileUri,
      quality = 0.5,
      format = OutputCompressedFormat.JPEG,
      enablePhysicalRotation = true,
    )

    val (resultFile, resultOptions) = readImageFile(result.uri)
    assertEquals(4000, resultOptions.outWidth)
    assertEquals(3000, resultOptions.outHeight)

    assertEquals(4000.0, result.width)
    assertEquals(3000.0, result.height)

    val originalSize = File(testFileUri.removePrefix("file://")).length()
    val compressedSize = resultFile.length()

    assert(compressedSize > 0) { "Compressed file should not be empty" }
    assert(originalSize > compressedSize)
    File(testFileUri.removePrefix("file://")).delete()
  }

  @Test
  fun `test compress resizes image correctly when maxWidth is set`() {
    val testFile = createTestImageFile(4000, 3000)
    val result = SimpleCompressorService.compress(
      context = context,
      sourceUri = testFile,
      quality = 0.8,
      maxWidth = 1000,
      maxHeight = null,
      format = OutputCompressedFormat.JPEG
    )
    val resultOptions = readImageFile(result.uri).second
    assertEquals(1000, resultOptions.outWidth)
    assertEquals(750, resultOptions.outHeight)

    assertEquals(1000.0, result.width)
    assertEquals(750.0, result.height)
    File(testFile.removePrefix("file://")).delete()
  }

  @Test
  fun `test compress resizes image correctly when maxHeight is set`() {
    val testFile = createTestImageFile(4000, 3000)
    val result = SimpleCompressorService.compress(
      context = context,
      sourceUri = testFile,
      quality = 0.8,
      maxHeight = 1500,
      format = OutputCompressedFormat.JPEG
    )

    val resultOptions = readImageFile(result.uri).second
    assertEquals(2000, resultOptions.outWidth)
    assertEquals(1500, resultOptions.outHeight)

    assertEquals(2000.0, result.width)
    assertEquals(1500.0, result.height)
    File(testFile.removePrefix("file://")).delete()
  }

  @Test
  fun `test compress resizes image correctly when maxHeight and maxWidth are set`() {
    val testFile = createTestImageFile(4000, 3000)
    val result = SimpleCompressorService.compress(
      context = context,
      sourceUri = testFile,
      quality = 0.8,
      maxWidth = 1000,
      maxHeight = 1000,
      format = OutputCompressedFormat.JPEG
    )

    val resultOptions = readImageFile(result.uri).second
    assertEquals(1000, resultOptions.outWidth)
    assertEquals(750, resultOptions.outHeight)
    File(testFile.removePrefix("file://")).delete()
  }


  @Test
  fun `compress returns correct file extensions and mime types`() {
    val testFile = createTestImageFile(100, 100)

    val pngResult = SimpleCompressorService.compress(
      context = context,
      sourceUri = testFile,
      quality = 1.0,
      format = OutputCompressedFormat.PNG
    )

    assert(pngResult.uri.endsWith(".png")) { "Expected URI to end with .png" }

    val (pngFile, pngOptions) = readImageFile(pngResult.uri)
    assertEquals("image/png", pngOptions.outMimeType)


    val webpResult = SimpleCompressorService.compress(
      context = context,
      sourceUri = testFile,
      quality = 1.0,
      format = OutputCompressedFormat.WEBP
    )

    assert(webpResult.uri.endsWith(".webp")) { "Expected URI to end with .webp" }

    val (webpFile, webpOptions) = readImageFile(webpResult.uri)
    assertEquals("image/webp", webpOptions.outMimeType)


    File(testFile.removePrefix("file://")).delete()
    pngFile.delete()
    webpFile.delete()
  }

  @Test
  fun `test compress preserves EXIF metadata for JPEG`() {
    val testFile = createTestImageFile(100, 100)

    val path = testFile.removePrefix("file://")
    val originalExif = ExifInterface(path)
    originalExif.setAttribute(ExifInterface.TAG_MAKE, "TestCameraBrand")
    originalExif.setAttribute(ExifInterface.TAG_MODEL, "TestCameraModel")
    originalExif.setAttribute(ExifInterface.TAG_DATETIME, "2023:10:25 12:00:00")
    originalExif.saveAttributes()

    val result = SimpleCompressorService.compress(
      context = context,
      sourceUri = testFile,
      quality = 0.8,
      format = OutputCompressedFormat.JPEG
    )

    val compressedFilePath = result.uri.removePrefix("file://")
    val compressedExif = ExifInterface(compressedFilePath)

    assertEquals("TestCameraBrand", compressedExif.getAttribute(ExifInterface.TAG_MAKE))
    assertEquals("TestCameraModel", compressedExif.getAttribute(ExifInterface.TAG_MODEL))
    assertEquals("2023:10:25 12:00:00", compressedExif.getAttribute(ExifInterface.TAG_DATETIME))

    File(testFile.removePrefix("file://")).delete()
    File(compressedFilePath).delete()
  }

  @Test
  fun `test compress applies EXIF orientation and swaps dimensions`() {
    val testFile = createTestImageFile(4000, 2000)

    val path = testFile.removePrefix("file://")
    val originalExif = ExifInterface(path)
    originalExif.setAttribute(
      ExifInterface.TAG_ORIENTATION,
      ExifInterface.ORIENTATION_ROTATE_90.toString()
    )
    originalExif.saveAttributes()

    val result = SimpleCompressorService.compress(
      context = context,
      sourceUri = testFile,
      quality = 0.8,
      maxWidth = 500,
      maxHeight = 1000,
      format = OutputCompressedFormat.JPEG,
      enablePhysicalRotation = true
    )

    val (resultFile, resultOptions) = readImageFile(result.uri)

    assertEquals(500, resultOptions.outWidth)
    assertEquals(1000, resultOptions.outHeight)

    assertEquals(500.0, result.width)
    assertEquals(1000.0, result.height)

    // Check EEXIF
    val compressedExif = ExifInterface(resultFile.absolutePath)
    val finalOrientation = compressedExif.getAttributeInt(
      ExifInterface.TAG_ORIENTATION,
      ExifInterface.ORIENTATION_NORMAL
    )

    assert(finalOrientation == ExifInterface.ORIENTATION_UNDEFINED || finalOrientation == ExifInterface.ORIENTATION_NORMAL)

    File(testFile.removePrefix("file://")).delete()
    resultFile.delete()
  }

  @Test
  fun `test compress does not apply EXIF orientation and preserves it`() {
    val testFile = createTestImageFile(4000, 2000)

    val path = testFile.removePrefix("file://")
    val originalExif = ExifInterface(path)
    originalExif.setAttribute(
      ExifInterface.TAG_ORIENTATION,
      ExifInterface.ORIENTATION_ROTATE_90.toString()
    )
    originalExif.saveAttributes()

    val result = SimpleCompressorService.compress(
      context = context,
      sourceUri = testFile,
      quality = 0.8,
      maxWidth = 500,
      maxHeight = 1000,
      format = OutputCompressedFormat.JPEG,
      enablePhysicalRotation = false
    )

    val (resultFile, resultOptions) = readImageFile(result.uri)


    assertEquals(1000, resultOptions.outWidth)
    assertEquals(500, resultOptions.outHeight)

    assertEquals(1000.0, result.width)
    assertEquals(500.0, result.height)

    val compressedExif = ExifInterface(resultFile.absolutePath)
    val finalOrientation = compressedExif.getAttributeInt(
      ExifInterface.TAG_ORIENTATION,
      ExifInterface.ORIENTATION_NORMAL
    )

    assertEquals(ExifInterface.ORIENTATION_ROTATE_90, finalOrientation)

    File(testFile.removePrefix("file://")).delete()
    resultFile.delete()
  }

  class TestImageProvider : android.content.ContentProvider() {
    private val fileMap = mutableMapOf<String, File>()

    fun registerFile(id: String, file: File) {
      fileMap[id] = file
    }

    override fun onCreate(): Boolean = true
    override fun query(
      uri: Uri,
      projection: Array<out String>?,
      selection: String?,
      selectionArgs: Array<out String>?,
      sortOrder: String?
    ): android.database.Cursor? = null

    override fun getType(uri: Uri): String? = "image/jpeg"
    override fun insert(uri: Uri, values: android.content.ContentValues?): Uri? = null
    override fun delete(
      uri: Uri,
      selection: String?,
      selectionArgs: Array<out String>?
    ): Int = 0

    override fun update(
      uri: Uri,
      values: android.content.ContentValues?,
      selection: String?,
      selectionArgs: Array<out String>?
    ): Int = 0

    override fun openFile(uri: Uri, mode: String): android.os.ParcelFileDescriptor? {
      val id = uri.lastPathSegment ?: return null
      val file = fileMap[id] ?: return null
      return android.os.ParcelFileDescriptor.open(
        file,
        android.os.ParcelFileDescriptor.MODE_READ_ONLY
      )
    }
  }

  private lateinit var testProvider: TestImageProvider

  @org.junit.Before
  fun setup() {
    val info = android.content.pm.ProviderInfo().apply { authority = "test_images" }
    testProvider =
      org.robolectric.Robolectric.buildContentProvider(TestImageProvider::class.java).create(info)
        .get()
  }

  //  openStream Method:
  // 1. content resolver branch
  // 2. file input stream
  @Test
  fun `test openStream routes to ContentResolver for content URI`() {
    val bitmap = Bitmap.createBitmap(100, 100, Bitmap.Config.ARGB_8888)
    bitmap.eraseColor(Color.RED)
    val tmpFile = File.createTempFile("test_content", ".jpg")
    FileOutputStream(tmpFile).use { bitmap.compress(Bitmap.CompressFormat.JPEG, 100, it) }

    // URI with abstract ID — cannot be read as a file path.
    val contentUri = "content://test_images/img_001"
    testProvider.registerFile("img_001", tmpFile)

    val result = SimpleCompressorService.compress(
      context = context,
      sourceUri = contentUri,
      quality = 0.5,
      format = OutputCompressedFormat.JPEG,
    )

    assert(result.width > 0) { "Compression through ContentResolver should succeed" }
    assert(result.height > 0)
    tmpFile.delete()
  }

  @Test
  fun `test openStream routes to FileInputStream for file URI`() {
    val tmpFile = File.createTempFile("test_file_uri", ".jpg")
    val bitmap = Bitmap.createBitmap(100, 100, Bitmap.Config.ARGB_8888)
    FileOutputStream(tmpFile).use { bitmap.compress(Bitmap.CompressFormat.JPEG, 100, it) }

    val fileUriString = "file://${tmpFile.absolutePath}"

    val result = SimpleCompressorService.compress(
      context = context,
      sourceUri = fileUriString,
      quality = 0.5,
      format = OutputCompressedFormat.JPEG
    )

    assert(result.width > 0)
    tmpFile.delete()
  }

  @Test
  fun `test openStream routes to ContentResolver for android_resource URI`() {
    val bitmap = Bitmap.createBitmap(100, 100, Bitmap.Config.ARGB_8888)
    bitmap.eraseColor(Color.RED)
    val baos = java.io.ByteArrayOutputStream()
    bitmap.compress(Bitmap.CompressFormat.JPEG, 100, baos)
    val jpegBytes = baos.toByteArray()

    val resourceUri = Uri.parse("android.resource://com.margelo.nitro.simpleimagecompressor/drawable/test_img")

    // ShadowContentResolver only stores one InputStream instance per URI.
    // We create a stream that resets itself when closed, so it can be reused
    // across decodeBounds, getRotation, and decodeSampledBitmap.
    class ReusableByteArrayInputStream(buf: ByteArray) : java.io.ByteArrayInputStream(buf) {
      override fun close() {
        super.close()
        reset()
      }
    }

    val shadowResolver = org.robolectric.Shadows.shadowOf(context.contentResolver)
    shadowResolver.registerInputStream(resourceUri, ReusableByteArrayInputStream(jpegBytes))

    val result = SimpleCompressorService.compress(
      context = context,
      sourceUri = resourceUri.toString(),
      quality = 0.5,
      format = OutputCompressedFormat.JPEG
    )

    assert(result.width > 0) { "Compression through ContentResolver for android.resource should succeed" }
  }

}
