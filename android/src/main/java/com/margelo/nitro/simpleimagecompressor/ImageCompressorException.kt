package com.margelo.nitro.simpleimagecompressor

sealed class ImageCompressorException(val code: Int, message: String): Exception("[$code] $message") {
  class CannotReadResource : ImageCompressorException(1, "Cannot read source file")
  class CannotReadDimensions : ImageCompressorException(2, "Failed to read image dimensions")
  class CannotCreateDest : ImageCompressorException(3, "Cannot create destination file")
  class WriteFailed : ImageCompressorException(4, "Failed to write image to disk")
  class InvalidSourceUri : ImageCompressorException(5, "Source URI must be a local file path")
  class FileNotFound : ImageCompressorException(6, "File does not exist at the specified path")
  class DecodingFailed: ImageCompressorException(7, "Downsampling failed")
  class InvalidParameters : ImageCompressorException(8, "Invalid target parameters")
}
