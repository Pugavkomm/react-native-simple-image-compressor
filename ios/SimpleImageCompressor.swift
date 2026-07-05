import Foundation
import NitroModules

class SimpleImageCompressor: HybridSimpleImageCompressorSpec {
  var memorySize: Int { return 0 }

  public func compressImage(uri: String, options: CompressOptions) throws
    -> Promise<String>
  {
    return Promise.async {
      guard let sourceUrl = URL(string: uri) else {
        throw NSError(
          domain: "SimpleImageCompressor",
          code: 100,
          userInfo: [NSLocalizedDescriptionKey: "Invalid URI format"]
        )
      }

      let quality = options.quality
      let maxWidth = Int(options.maxWidth ?? 1924)
      let maxHeight = Int(options.maxHeight ?? 1080)

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
      return compressedUrl.absoluteString
    }
  }
}
