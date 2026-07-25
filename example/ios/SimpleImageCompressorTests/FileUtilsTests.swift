import XCTest

final class FileUtilsTests: XCTestCase {

  // MARK: - getCleanUri Tests

  func testGetCleanUri_withValidFileUri_returnsCorrectUrl() throws {
    let uri = "file:///var/mobile/Containers/Data/Application/image.jpg"

    let url = try FileUtils.getCleanUri(uriString: uri)

    XCTAssertEqual(
      url.path,
      "/var/mobile/Containers/Data/Application/image.jpg"
    )
    XCTAssertTrue(url.isFileURL)
  }

  func testGetCleanUri_withPathWithoutScheme_returnsCorrectUrl() throws {
    let uri = "/var/mobile/Containers/Data/Application/image.jpg"

    let url = try FileUtils.getCleanUri(uriString: uri)

    XCTAssertEqual(
      url.path,
      "/var/mobile/Containers/Data/Application/image.jpg"
    )
    XCTAssertTrue(url.isFileURL)
  }

  func testGetCleanUri_withWordFileInPath_doesNotBreak() throws {
    let uri = "file:///var/mobile/file://Test/File/image.jpg"

    let url = try FileUtils.getCleanUri(uriString: uri)

    XCTAssertEqual(url.path, "/var/mobile/file://Test/File/image.jpg")
  }

  func testGetCleanUri_withEmptyString_throwsError() {
    let uri = "   "

    XCTAssertThrowsError(try FileUtils.getCleanUri(uriString: uri)) { error in
      if let compressorError = error as? ImageCompressorError {
        XCTAssertEqual(compressorError, .invalidSourceUrl)
      } else {
        let nsError = error as NSError
        XCTAssertEqual(nsError.code, 100)
      }
    }
  }

  // MARK: - fetchFileSize Tests

  func testFetchFileSize_withExistingFile_returnsSize() throws {
    let tempUrl = URL(fileURLWithPath: NSTemporaryDirectory())
      .appendingPathComponent("test_size.txt")
    let testData = "Hello, World!".data(using: .utf8)!
    try testData.write(to: tempUrl)

    defer { try? FileManager.default.removeItem(at: tempUrl) }

    let size =  FileUtils.fetchFileSize(fileUrl: tempUrl)

    XCTAssertEqual(size, testData.count)
  }

  func testFetchFileSize_withNonExistingFile_throwsError() {
    let fakeUrl = URL(fileURLWithPath: "/path/that/does/not/exist.jpg")
    let size =  FileUtils.fetchFileSize(fileUrl: fakeUrl)

    XCTAssertEqual(size, 0)
    
  }
}
