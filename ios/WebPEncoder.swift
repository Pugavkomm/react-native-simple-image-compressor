import Foundation

// R + G + B + A
private let bytestPerPixel = 4

#if canImport(libwebp)
  import libwebp

  enum WebPCompressionMode {
    case lossy(quality: Double)
    case lossless
  }

  /// Encodes a CoreGraphics image into WebP format using `libwebp`.
  ///
  /// This function extracts raw`RGBA` pixel data from the provided `CGImage` by drawing it into a
  /// temprorary `CGContext`.
  ///
  /// If the `quality` is exactly `1.0`, it perfroms lossless compression; otherwise, it performs lossy
  /// compression.
  ///
  /// - Parameters:
  ///   - cgImage: The source image to be compressed.
  ///   - mode: The compression mode. Use `.lossless` for mathematically perfect pixel
  ///    preservation or `lossy(quality:)` for a smaller file size (where quality ranges from `0.0` to
  ///    `1.0`).
  /// - Throws: An `NSError` if the `libwebp` encoder fails to process the image.
  /// - Returns: A `Data` object if the `libwebp` encoder fails to process the image.
  func encodeToWebp(cgImage: CGImage, mode: WebPCompressionMode) throws -> Data {
    let width = cgImage.width
    let height = cgImage.height
    let bytesPerRow = bytestPerPixel * width
    let totalBytes = bytesPerRow * height

    let pixelBuffer = UnsafeMutablePointer<UInt8>.allocate(capacity: totalBytes)
    pixelBuffer.initialize(repeating: 0, count: totalBytes)

    defer {
      pixelBuffer.deinitialize(count: totalBytes)
      pixelBuffer.deallocate()
    }

    let ctx = CGContext(
      data: pixelBuffer,
      width: width,
      height: height,
      bitsPerComponent: 8,
      bytesPerRow: bytesPerRow,
      space: CGColorSpaceCreateDeviceRGB(),
      bitmapInfo: CGBitmapInfo.byteOrder32Big.rawValue
        | CGImageAlphaInfo.premultipliedLast.rawValue
    )
    ctx?
      .draw(
        cgImage,
        in: CGRect(x: 0, y: 0, width: width, height: height),
      )

    var outpuBuffer: UnsafeMutablePointer<UInt8>? = nil
    var outputSize = 0

    switch mode {
    case .lossless:
      outputSize = WebPEncodeLosslessRGBA(
        pixelBuffer,
        Int32(width),
        Int32(height),
        Int32(bytesPerRow),
        &outpuBuffer
      )
    case .lossy(let quality):
      outputSize = WebPEncodeRGBA(
        pixelBuffer,
        Int32(width),
        Int32(height),
        Int32(bytesPerRow),
        Float(quality * 100.0),
        &outpuBuffer
      )
    }

    guard outputSize > 0, let finalBuffer = outpuBuffer else {
      throw NSError(domain: "WebPError", code: 1, userInfo: nil)
    }

    defer {
      WebPFree(finalBuffer)
    }
    return Data(bytes: finalBuffer, count: Int(outputSize))

  }
#endif
