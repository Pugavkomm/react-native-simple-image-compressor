import Foundation
import ImageIO
import UniformTypeIdentifiers

struct ImageCompressorService {

  private static let domainName = "ImageCompressor"

  private static let readOptions: CFDictionary =
    [
      kCGImageSourceShouldCache: false
    ] as CFDictionary

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

  private static func getFormatDetails(for format: String) -> (
    extension: String, utType: CFString
  ) {
    switch format.lowercased() {
    case "png":
      return (".png", UTType.png.identifier as CFString)
    case "webp":
      print(
        "⚠️ [Warning] WebP encoding is not supported natively by iOS ImageIO. Falling back to JPEG."
      )
      return (".jpg", UTType.jpeg.identifier as CFString)
    default:
      return (".jpg", UTType.jpeg.identifier as CFString)
    }
  }

  private static func isFileUrl(sourceUrl: URL) throws {
    guard sourceUrl.isFileURL else {
      throw NSError(
        domain: domainName,
        code: 5,
        userInfo: [
          NSLocalizedDescriptionKey:
            "Source URL must be a local file path (file://)"
        ]
      )
    }
  }

  private static func isFileExists(sourceUrl: URL) throws {
    guard FileManager.default.fileExists(atPath: sourceUrl.path) else {
      throw NSError(
        domain: domainName,
        code: 6,
        userInfo: [
          NSLocalizedDescriptionKey:
            "File does not exist at path: \(sourceUrl.path)"
        ]
      )
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
      let width = properties[kCGImagePropertyPixelWidth] as? Int,
      let height = properties[kCGImagePropertyPixelHeight] as? Int
    else {
      return nil
    }
    return (width, height)
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
  private static func calculateTargetDimension(
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

  /// Compresses a local image by downsampling it to target dimensions and saving it with the specified quality and format
  ///
  /// - Parameters:
  ///   - sourceUrl: The local file URL (`file://`) of the source image.
  ///   - quality: The compression quality, ranging from `0.0` (maximum compression) to `1.0` (maximum quality).
  ///   - maxWidth: An optional maximum width boundary. If `nil`, the width is not constrained.
  ///   - maxHeight: An optional maximum height boundary. If `nil`, the height is not constrained.
  ///   - format: The target image format (e.g., "jpg", "png").
  /// - Returns: The local file URL of the compressed image stored in the temporary directory.
  /// - Throws: An `NSError` if file validation, reading, downsampling, or writing to disk fails.
  static func compress(
    sourceUrl: URL,
    quality: Double,
    maxWidth: Int?,
    maxHeight: Int?,
    format: String
  ) throws -> URL {

    // Validation
    try isFileUrl(sourceUrl: sourceUrl)
    try isFileExists(sourceUrl: sourceUrl)

    // Read source
    guard
      let source = CGImageSourceCreateWithURL(sourceUrl as CFURL, readOptions)
    else {
      throw NSError(
        domain: domainName,
        code: 1,
        userInfo: [NSLocalizedDescriptionKey: "Cannot read source file"]
      )
    }

    // Down sampling
    guard let dimensions = getImageDimensions(from: source) else {
      throw NSError(
        domain: domainName,
        // TODO: Other code
        code: 2,
        userInfo: [NSLocalizedDescriptionKey: "Failed to read image dimensions"]
      )
    }

    let maxDimension = calculateTargetDimension(
      width: dimensions.width,
      height: dimensions.height,
      maxWidth: maxWidth,
      maxHeight: maxHeight
    )

    let downsampleOptions = createDownSampleOptions(maxDimension: maxDimension)
    guard
      let downsampleImage = CGImageSourceCreateThumbnailAtIndex(
        source,
        0,
        downsampleOptions
      )
    else {
      throw NSError(
        domain: domainName,
        code: 2,
        userInfo: [NSLocalizedDescriptionKey: "Downsampling failed"]
      )
    }

    // Prepare destination
    let formatDetails = getFormatDetails(for: format)
    let uniqueFileName = UUID().uuidString + formatDetails.extension
    let destinationUrl = URL(fileURLWithPath: NSTemporaryDirectory())
      .appendingPathComponent(uniqueFileName)
    guard
      let destination = CGImageDestinationCreateWithURL(
        destinationUrl as CFURL,
        formatDetails.utType,
        1,
        nil
      )
    else {
      throw NSError(
        domain: domainName,
        code: 3,
        userInfo: [NSLocalizedDescriptionKey: "Cannot create destination file"]
      )
    }
    let destinationOptions = createDestinationOptions(quality: quality)

    // Write
    CGImageDestinationAddImage(destination, downsampleImage, destinationOptions)
    guard CGImageDestinationFinalize(destination) else {
      throw NSError(
        domain: domainName,
        code: 4,
        userInfo: [NSLocalizedDescriptionKey: "Failed to write image to disk"]
      )
    }

    return destinationUrl
  }
}
