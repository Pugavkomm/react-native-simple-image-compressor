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

  static func compress(
    sourceUrl: URL,
    quality: Double,
    maxWidth: Int,
    maxHeight: Int,
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
    let maxDimension = max(maxWidth, maxHeight)
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
