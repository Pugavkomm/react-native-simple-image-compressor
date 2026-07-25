import Foundation
import NitroModules

class SimpleImageCompressor: HybridSimpleImageCompressorSpec {
  func getFileSize(uri: String) throws -> NitroModules.Promise<Double> {
    return Promise.async {
      let sourceUrl = try FileUtils.getCleanUri(uriString: uri)
      let size = try FileUtils.fetchFileSize(fileUrl: sourceUrl)
      return Double(size)
    }
  }

  var memorySize: Int { return 0 }

  public func compressImage(uri: String, options: CompressOptions) throws
    -> Promise<CompressedResult>
  {
    return Promise.async {

      let sourceUrl = try FileUtils.getCleanUri(uriString: uri)

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
        fileSize: Double(compressedResult.fileSize),
        originalFileSize: Double(compressedResult.originalFileSize)
      )
    }
  }
}
