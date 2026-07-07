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

      let formatStr: String
      switch options.format {
      case .png:
        formatStr = "png"
      case .webp:
        formatStr = "webp"
      default:
        formatStr = "jpg"
      }

      let compressedUrl = try ImageCompressorService.compress(
        sourceUrl: sourceUrl,
        quality: quality,
        maxWidth: maxWidth,
        maxHeight: maxHeight,
        format: formatStr
      )
      return CompressedResult(uri: compressedUrl.absoluteString)
    }
  }
}
