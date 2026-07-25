import Foundation

enum FileUtils {
  /// Converts a string file path or URI into a valid URL
  ///
  /// If the provided string contains a `"file://"` prefix, it will be safely
  /// removed before generating the URL.
  ///
  /// - Parameter uriString: The file path or URI represented as a string.
  /// - Returns: A parsed URL object ready to be used.
  /// - Throws: `ImageCompressorError.invalidSourceUrl` if the provided string
  /// is empty.
  static func getCleanUri(uriString: String) throws -> URL {
    var cleanUri = uriString.trimmingCharacters(in: .whitespacesAndNewlines)
    if cleanUri.hasPrefix("file://") {
      cleanUri = String(cleanUri.dropFirst("file://".count))
    }

    guard !cleanUri.isEmpty else {
      throw ImageCompressorError.invalidSourceUrl
    }

    if #available(iOS 16.0, *) {
      return URL(filePath: cleanUri)
    } else {
      return URL(fileURLWithPath: cleanUri)
    }
  }

  /// Retrieves the file size in bytes from a given URL
  ///
  /// - Parameter fileUrl: The file URL of the file.
  /// - Returns: The file size in bytes, or 0 if it cannot be determined
  static func fetchFileSize(fileUrl: URL) -> Int {
    let resourceValues = try? fileUrl.resourceValues(forKeys: [.fileSizeKey])
    return resourceValues?.fileSize ?? 0
  }

}
