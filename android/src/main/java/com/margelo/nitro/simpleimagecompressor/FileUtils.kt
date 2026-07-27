package com.margelo.nitro.simpleimagecompressor

import android.content.Context
import android.content.res.AssetFileDescriptor
import android.net.Uri
import android.provider.OpenableColumns
import android.util.Log
import androidx.core.net.toUri
import java.io.File


/**
 * Converts the file [Uri] to string
 *
 * @param uri: The [Uri] of the file.
 * @return The string file path.
 */
fun getFilePath(uri: Uri): String {
  return uri.path ?: uri.toString().removePrefix("file://")
}

/**
 * Converts a string file path or URI into a valid Android [Uri]
 *
 * If the provided string is a raw file path (e.g., `"/path/to/file"`),
 * this function automatically prepends the `"file://"` scheme.
 *
 * If it already contains a valid scheme (like `"file://"`, `"content://"`, or
 * `"android.resource://"`), it remains unchanged.
 *
 * ### Example usage:
 * ```kotlin
 * // Raw file path
 * getCleanUri("/storage/emulated/0/image.jpg")
 * // Returns: Uri for "file:///storage/emulated/0/image.jpg"
 *
 * // Content URI
 * getCleanUri("content://media/external/images/media/1")
 * // Returns: Uri for "content://media/external/images/media/1"
 * ```
 *
 *
 * @param uriString: The file path or URI represented as a string.
 * @return A parsed [Uri] object ready to be used with Android APIs.
 */
fun getCleanUri(uriString: String): Uri {
  val cleanUri =
    if (
      !uriString.startsWith("file://")
      && !uriString.startsWith("content://")
      && !uriString.startsWith("android.resource://")
    ) "file://${uriString}"
    else uriString
  return cleanUri.toUri()
}


/**
 * Retrieves the file size in bytes form a given [Uri]
 *
 * This function supports `"content://"`, `"android.resource://"`,
 * and standard `"file://"` schemes.
 *
 * @param context The application context used to resolve content URIs.
 * @param uri The [Uri] of the file.
 * @return The file size in bytes, or 0 if it cannot be determined.
 * @throws ImageCompressorException.CannotReadResource if an error occurs while
 * reading the file.
 */
fun fetchFileSizeByUri(context: Context, uri: Uri): Long {
  try {
    if (uri.scheme == "content" || uri.scheme == "android.resource") {
      try {
        context.contentResolver.openAssetFileDescriptor(uri, "r")?.use { fd ->
          val length = fd.length
          if (length != AssetFileDescriptor.UNKNOWN_LENGTH) {
            return length
          }
        }
      } catch (e: Exception) {
        Log.w("FileUtils", "Failed to fetch file size for URI via openAssetFileDescriptor: $uri", e)
      }

      if (uri.scheme == "content") {
        context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
          val sizeIndex = cursor.getColumnIndex(OpenableColumns.SIZE)
          if (sizeIndex != -1 && cursor.moveToFirst()) {
            return cursor.getLong(sizeIndex)
          }
        }
      }
    } else {
      val path = getFilePath(uri)
      return File(path).length()
    }
  } catch (e: Exception) {
    Log.e("FileUtils", "Failed to fetch file size for URI: $uri", e)
  }

  return 0
}

