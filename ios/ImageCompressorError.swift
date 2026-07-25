import Foundation

public enum ImageCompressorError: Int, LocalizedError, CustomNSError {
  case cannotReadSource = 1
  case cannotReadDimensions = 2
  case cannotCreateDestination = 3
  case writeFailed = 4
  case invalidSourceUrl = 5
  case fileDoesNotExist = 6
  case downsamplingFailed = 7
  case invalidTargetParameter = 8

  public static var errorDomain: String {
    return "ImageCompressor"
  }

  public var errorCode: Int {
    return self.rawValue
  }

  public var errorUserInfo: [String: Any] {
    return [NSLocalizedDescriptionKey: errorDescription ?? "Unknown error"]
  }

  public var errorDescription: String? {
    switch self {
    case .cannotReadSource: return "Cannot read source file"
    case .cannotReadDimensions: return "Failed to read image dimensions"
    case .cannotCreateDestination: return "Cannot create destination file"
    case .writeFailed: return "Failed to write image to disk"
    case .invalidSourceUrl:
      return "Source URL must be a local file path (file://)"
    case .fileDoesNotExist: return "File does not exist at the specified path"
    case .downsamplingFailed: return "Downsampling failed"
    case .invalidTargetParameter: return "Invalid target parameters"
    }
  }
}
