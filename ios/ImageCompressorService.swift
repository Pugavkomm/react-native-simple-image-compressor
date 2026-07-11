import Foundation
import ImageIO
import UniformTypeIdentifiers

enum ImageFormat {
  case jpg
  case png
  case webp
  case webpLossless
}

enum ImageCompressorError: Int, LocalizedError, CustomNSError {
  case cannotReadSource = 1
  case cannotReadDimensions = 2
  case cannotCreateDestination = 3
  case writeFailed = 4
  case invalidSourceUrl = 5
  case fileDoesNotExist = 6
  case downsamplingFailed = 7
  case invalidTargetParameter = 8

  static var errorDomain: String {
    return "ImageCompressor"
  }

  var errorCode: Int {
    return self.rawValue
  }

  var errorUserInfo: [String: Any] {
    return [NSLocalizedDescriptionKey: errorDescription ?? "Unknown error"]
  }

  var errorDescription: String? {
    switch self {
    case .cannotReadSource: return "Cannot read source file"
    case .cannotReadDimensions: return "Failed to read image dimensions"
    case .cannotCreateDestination: return "Cannot create destination file"
    case .writeFailed: return "Failed to write image to disk"
    case .invalidSourceUrl:
      return "Source URL must be a local file path (file://)"
    case .fileDoesNotExist: return "File does not exist at the specified path"
    case .downsamplingFailed: return "Downsampling failed"
    case .invalidTargetParameter: return "Invalide target parameters"
    }
  }
}

struct ImageCompressorService {

  // MARK: - Constants
  private static let domainName = "ImageCompressor"

  private static let readOptions: CFDictionary =
    [
      kCGImageSourceShouldCache: false
    ] as CFDictionary

  // MARK: - API
  /// Compresses a local image by downsampling it to target dimensions and saving it with the specified quality and format
  ///
  /// - Parameters:
  ///   - sourceUrl: The local file URL (`file://`) of the source image.
  ///   - quality: The compression quality, ranging from `0.0` (maximum compression) to `1.0` (maximum quality).
  ///   - maxWidth: An optional maximum width boundary. If `nil`, the width is not constrained.
  ///   - maxHeight: An optional maximum height boundary. If `nil`, the height is not constrained.
  ///   - imageFormat: The target image format.
  /// - Returns: The local file URL of the compressed image stored in the temporary directory.
  /// - Throws: An `Error` if file validation, reading, downsampling, or writing to disk fails.
  static func compress(
    sourceUrl: URL,
    quality: Double,
    maxWidth: Int?,
    maxHeight: Int?,
    imageFormat: ImageFormat
  ) throws -> URL {

    // Validation
    try isValidParameters(
      quality: quality,
      maxWidth: maxWidth,
      maxHeight: maxHeight
    )
    try isFileUrl(sourceUrl: sourceUrl)
    try isFileExists(sourceUrl: sourceUrl)

    // Read source
    let source = try readSource(sourceUrl: sourceUrl)

    // Down sampling
    guard let dimensions = getImageDimensions(from: source) else {
      throw ImageCompressorError.cannotReadDimensions
    }
    let maxDimension = calculateTargetDimension(
      width: dimensions.width,
      height: dimensions.height,
      maxWidth: maxWidth,
      maxHeight: maxHeight
    )

    let downSampleImage = try downSampling(
      from: source,
      maxDimension: maxDimension
    )

    let formatDetails = getFormatDetails(for: imageFormat)
    let uniqueFileName = UUID().uuidString + formatDetails.extension
    let destinationUrl = URL(fileURLWithPath: NSTemporaryDirectory())
      .appendingPathComponent(uniqueFileName)

    switch imageFormat {
    case .webp, .webpLossless:
      #if canImport(libwebp)
        let mode: WebPCompressionMode =
          (imageFormat == .webpLossless)
          ? .lossless
          : .lossy(quality: quality)
        let webPData = try encodeToWebp(cgImage: downSampleImage, mode: mode)
        try webPData.write(to: destinationUrl)
      #else
        print(
          "⚠️⚠️⚠️ [Warning] WebP encoding is not supported natively by iOS ImageIO. Falling back to JPEG."
        )
        try writeWithImageIO(
          image: downSampleImage,
          to: destinationUrl,
          utType: formatDetails.utType,
          quality: quality
        )
      #endif
    default:
      try writeWithImageIO(
        image: downSampleImage,
        to: destinationUrl,
        utType: formatDetails.utType,
        quality: quality
      )
    }

    return destinationUrl
  }

  private static func writeWithImageIO(
    image: CGImage,
    to url: URL,
    utType: CFString,
    quality: Double
  ) throws {
    guard
      let destination = CGImageDestinationCreateWithURL(
        url as CFURL,
        utType,
        1,
        nil
      )
    else {
      throw ImageCompressorError.cannotCreateDestination
    }
    let destinationOptions = createDestinationOptions(quality: quality)
    CGImageDestinationAddImage(destination, image, destinationOptions)
    guard CGImageDestinationFinalize(destination) else {
      throw ImageCompressorError.writeFailed
    }
  }

  /// Calculates the target maximum pixel size for downsampling, preserving the original aspect ratio.
  ///
  /// This method determines the appropriate size for image's longest side so that the scaled image
  /// fits within the provided width and height boundaries.
  ///
  /// - Parameters:
  ///   - width: The original width of the image in pixels.
  ///   - height: The original height of the image in pixels.
  ///   - maxWidth: An optional limit for the image width.
  ///   - maxHeight: An optional limit for the image height
  /// - Returns: The target pixel size for the longest side of the image.
  static func calculateTargetDimension(
    width: Int,
    height: Int,
    maxWidth: Int?,
    maxHeight: Int?
  ) -> Int {

    let originalMax = max(width, height)

    var scale = 1.0

    if let maxWidth = maxWidth, let maxHeight = maxHeight {
      scale = min(
        Double(maxWidth) / Double(width),
        Double(maxHeight) / Double(height)
      )
    } else if let maxWidth = maxWidth {
      scale = Double(maxWidth) / Double(width)
    } else if let maxHeight = maxHeight {
      scale = Double(maxHeight) / Double(height)
    }

    let maxDimension =
      scale < 1.0 ? Int(Double(originalMax) * scale) : originalMax

    return maxDimension
  }

  // MARK: - Validators

  private static func isFileUrl(sourceUrl: URL) throws {
    guard sourceUrl.isFileURL else {
      throw ImageCompressorError.invalidSourceUrl
    }
  }

  private static func isFileExists(sourceUrl: URL) throws {
    guard FileManager.default.fileExists(atPath: sourceUrl.path) else {
      throw ImageCompressorError.fileDoesNotExist
    }
  }

  private static func isValidParameters(
    quality: Double,
    maxWidth: Int?,
    maxHeight: Int?
  ) throws {
    guard quality >= 0.0 && quality <= 1.0 else {
      throw ImageCompressorError.invalidTargetParameter
    }

    if let width = maxWidth {
      guard width > 0 else {
        throw ImageCompressorError.invalidTargetParameter
      }
    }

    if let height = maxHeight {
      guard height > 0 else {
        throw ImageCompressorError.invalidTargetParameter
      }
    }
  }

  // MARK: - Processing Helpers

  private static func createDestinationOptions(quality: Double) -> CFDictionary
  {
    return [
      kCGImageDestinationLossyCompressionQuality as String: quality
    ] as CFDictionary
  }

  private static func createDownSampleOptions(maxDimension: Int) -> CFDictionary
  {
    return [
      kCGImageSourceCreateThumbnailFromImageAlways: true,
      kCGImageSourceShouldCacheImmediately: true,
      kCGImageSourceCreateThumbnailWithTransform: true,  // TODO: external parameter
      kCGImageSourceThumbnailMaxPixelSize: maxDimension,
    ] as CFDictionary
  }

  static func getFormatDetails(for format: ImageFormat) -> (
    extension: String, utType: CFString
  ) {
    switch format {
    case .png:
      return (".png", UTType.png.identifier as CFString)
    case .webp, .webpLossless:
      #if canImport(libwebp)
        return (".webp", UTType.webP.identifier as CFString)
      #else
        return (".jpg", UTType.jpeg.identifier as CFString)
      #endif
    default:
      return (".jpg", UTType.jpeg.identifier as CFString)
    }
  }

  /// Returns the pixel dimensions (width and height) of the image from its source properties.
  /// - Parameter source: The `CGImageSource` of the image to read.
  /// - Returns: A tuple containing the `width` and `height` in pixels, or `nil` if the dimensions could not be read.
  private static func getImageDimensions(from source: CGImageSource) -> (
    width: Int, height: Int
  )? {
    guard
      let properties = CGImageSourceCopyPropertiesAtIndex(source, 0, nil)
        as? [CFString: Any],
      var width = properties[kCGImagePropertyPixelWidth] as? Int,
      var height = properties[kCGImagePropertyPixelHeight] as? Int
    else {
      return nil
    }

    if let orientation = properties[kCGImagePropertyOrientation] as? Int {
      if orientation >= 5 && orientation <= 8 {
        let temp = width
        width = height
        height = temp
      }
    }

    return (width, height)
  }

  private static func readSource(sourceUrl: URL) throws -> CGImageSource {
    guard
      let source = CGImageSourceCreateWithURL(sourceUrl as CFURL, readOptions)
    else {
      throw ImageCompressorError.cannotReadSource
    }
    return source
  }

  private static func downSampling(
    from source: CGImageSource,
    maxDimension: Int
  ) throws -> CGImage {
    let downsampleOptions = createDownSampleOptions(maxDimension: maxDimension)
    guard
      let downsampleImage = CGImageSourceCreateThumbnailAtIndex(
        source,
        0,
        downsampleOptions
      )
    else {
      throw ImageCompressorError.downsamplingFailed
    }
    return downsampleImage
  }

}
