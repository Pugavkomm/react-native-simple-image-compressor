import Foundation
import NitroModules

class SimpleImageCompressor: HybridSimpleImageCompressorSpec {
  var memorySize: Int { return 0 }

  public func compressImage(uri: String, options: CompressOptions) throws
    -> Promise<CompressedResult>
  {
    return Promise.async {
      let cleanUri = uri.replacingOccurrences(of: "file://", with: "")

      guard !cleanUri.isEmpty else {
        throw NSError(
          domain: "SimpleImageCompressor",
          code: 100,
          userInfo: [
            NSLocalizedDescriptionKey: "Invalid URI format: path is empty"
          ]
        )
      }

      let sourceUrl: URL
      if #available(iOS 16.0, *) {
        sourceUrl = URL(filePath: cleanUri)
      } else {
        sourceUrl = URL(fileURLWithPath: cleanUri)
      }

      let quality = options.quality
      let maxWidth = options.maxWidth.map { Int($0) }
      let maxHeight = options.maxHeight.map { Int($0) }

      let imageFormat: ImageFormat
      switch options.format {
      case .png:
        imageFormat = .png
      case .webp:
        imageFormat = .webp
      case .webpLossless:
        imageFormat = .webpLossless
      default:
        imageFormat = .jpg
      }

      let compressedResult = try ImageCompressorService.compress(
        sourceUrl: sourceUrl,
        quality: quality,
        maxWidth: maxWidth,
        maxHeight: maxHeight,
        imageFormat: imageFormat,
        enablePhysicalRotation: options.enablePhysicalRotation ?? false
      )

      let outputImageFormat: OutputCompressedFormat
      switch compressedResult.format {
      case .png:
        outputImageFormat = .png
      case .jpg:
        outputImageFormat = .jpg
      case .webp:
        outputImageFormat = .webp
      case .webpLossless:
        outputImageFormat = .webpLossless
      }

      return CompressedResult(
        uri: compressedResult.uri.absoluteString,
        width: Double(compressedResult.width),
        height: Double(compressedResult.height),
        format: outputImageFormat,
        fileSize: Double(compressedResult.fileSize)
      )
    }
  }
}
