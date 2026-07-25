package com.margelo.nitro.simpleimagecompressor

import android.net.Uri
import android.os.Build
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.annotation.Config
import java.io.File
import kotlin.test.Test
import kotlin.test.assertEquals

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [Build.VERSION_CODES.O_MR1])
class FileUtilsTest {

  //  getCleanUri

  @Test
  fun `getCleanUri with valid URI returns unchanged Uri`() {
    val expectedFilePath = "/storage/emulated/0/image.jpg"
    val uriString = "file://$expectedFilePath"
    val result = getCleanUri(uriString)

    assertEquals("file", result.scheme)
    assertEquals(expectedFilePath, result.path)
  }

  @Test
  fun `getCleanUri with raw path prepends file scheme`() {
    val path = "/storage/emulated/0/image.jpg"
    val result = getCleanUri(path)

    assertEquals("file", result.scheme)
    assertEquals(path, result.path)
  }

  @Test
  fun `getCleanUri with content URI returns unchanged Uri`() {
    val uriString = "content://media/external/image/media/1"
    val result = getCleanUri(uriString)

    assertEquals("content", result.scheme)
    assertEquals(uriString, result.toString())
  }

  @Test
  fun `getCleanUri with word file in path does not break`() {
    val path = "/storage/file://folder/image.jpg"
    val result = getCleanUri(path)

    assertEquals("file", result.scheme)
    assertEquals(path, result.path)
  }


  //  fetchFileSizeByUri

  @Test
  fun `fetchFileSizeByUri with existing file URI returns correct size`() {
    val context = RuntimeEnvironment.getApplication()
    val tempFile = File.createTempFile("test_size", ".txt")
    val testData = "Hello, World!" // 13 bytes
    tempFile.writeText(testData)

    val uri = getCleanUri(tempFile.absolutePath)

    val size = fetchFileSizeByUri(context, uri)

    assertEquals(13L, size)

    tempFile.delete()
  }

  @Test
  fun `fetchFileSizeByUri with non-existing file URI returns zero size`() {
    val context = RuntimeEnvironment.getApplication()
    val fakeUri = Uri.parse("file:///fake/path/image.jpg")

    val size = fetchFileSizeByUri(context, fakeUri)

    assertEquals(0, size)
  }

}
