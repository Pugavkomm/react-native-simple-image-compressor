import UniformTypeIdentifiers
import XCTest

final class SimpleImageCompressorTests: XCTestCase {

  private let exptectedDomainName = "ImageCompressor"
  private let fakeUrl = URL(fileURLWithPath: "some_fake_ulr")

  private func createTestImage(width: Int, height: Int) -> URL {
    let colorSpace = CGColorSpaceCreateDeviceRGB()
    let context = CGContext(
      data: nil,
      width: width,
      height: height,
      bitsPerComponent: 8,
      bytesPerRow: 0,
      space: colorSpace,
      bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
    )!

    // Fill red color
    context.setFillColor(CGColor(red: 1, green: 0, blue: 0, alpha: 1))
    context.fill(CGRect(x: 0, y: 0, width: width, height: height))

    let cgImg = context.makeImage()!

    let url = URL(fileURLWithPath: NSTemporaryDirectory())
      .appendingPathComponent("test_image_\(UUID().uuidString).jpg")

    let dest = CGImageDestinationCreateWithURL(
      url as CFURL,
      UTType.jpeg.identifier as CFString,
      1,
      nil
    )!
    CGImageDestinationAddImage(dest, cgImg, nil)
    CGImageDestinationFinalize(dest)

    return url
  }

  override func setUpWithError() throws {
    // Put setup code here. This method is called before the invocation of each test method in the class.
  }

  override func tearDownWithError() throws {
    // Put teardown code here. This method is called after the invocation of each test method in the class.
  }

  // MARK: - calculateTargetDimension
  func testCalculateTargetDimension_noConstraints_returnsOriginalMax() {
    let result = ImageCompressorService.calculateTargetDimension(
      width: 4000,
      height: 3000,
      maxWidth: nil,
      maxHeight: nil
    )

    XCTAssertEqual(result, 4000)  // max(4000, 3000)
  }

  func testCalculateTargetDimension_maxWidthOnly_scalesDown() {
    // Source image: 4000x3000
    // maxWidth = 2000
    // maxHeight = nil
    // scale = 2000 / 4000 = 0.5
    // maxDimension  = 4000 * 0.5 = 2000
    let result = ImageCompressorService.calculateTargetDimension(
      width: 4000,
      height: 3000,
      maxWidth: 2000,
      maxHeight: nil
    )

    XCTAssertEqual(result, 2000)
  }

  func testCalculateTargetDimension_maxHeightOnly_scalesDown() {
    // Source image: 4000x3000
    // maxWidth = nil
    // maxHeight = 1500
    // scale = 1500 / 3000 = 0.5
    // maxDimension  = 4000 * 0.5 = 2000

    let result = ImageCompressorService.calculateTargetDimension(
      width: 4000,
      height: 3000,
      maxWidth: nil,
      maxHeight: 1500
    )

    XCTAssertEqual(result, 2000)

  }

  func testCalculateTargetDimension_bothConstraints_usesSmallestScale() {
    // Source image: 4000x3000
    // maxWidth = 2000
    // maxHeight = 2000
    // scaleW = 2000 / 4000 = 0.5
    // scaleH = 2000 / 3000 = 0.66(7)
    // scale = 0.5 (min)
    // maxDimension  = 4000 * 0.5 = 2000

    let result = ImageCompressorService.calculateTargetDimension(
      width: 4000,
      height: 3000,
      maxWidth: 2000,
      maxHeight: 2000
    )

    XCTAssertEqual(result, 2000)
  }

  func testCalculateTargetDimension_largerConstraints_noUpscale() {
    let result = ImageCompressorService.calculateTargetDimension(
      width: 500,
      height: 1000,
      maxWidth: 3000,
      maxHeight: 3000
    )

    XCTAssertEqual(result, 1000)
  }

  // MARK: - getFormatDetails
  func testGetFormatDetails_png() {
    let result = ImageCompressorService.getFormatDetails(for: .png)

    XCTAssertEqual(result.extension, ".png")
    XCTAssertEqual(result.utType as String, "public.png")
  }

  func testGetFormatDetails_jpg() {
    let result = ImageCompressorService.getFormatDetails(for: .jpg)

    XCTAssertEqual(result.extension, ".jpg")
    XCTAssertEqual(result.utType as String, "public.jpeg")
  }

  func testGetFormatDetails_jpeg() {
    let result = ImageCompressorService.getFormatDetails(for: .jpg)

    XCTAssertEqual(result.extension, ".jpg")
    XCTAssertEqual(result.utType as String, "public.jpeg")
  }

  func testGetFormatDetails_webpFallback() {
    let result = ImageCompressorService.getFormatDetails(for: .webp)

    #if canImport(libwebp)
      XCTAssertEqual(result.extension, ".webp")
      XCTAssertEqual(result.utType as String, "org.webmproject.webp")
    #else
      XCTAssertEqual(result.extension, ".jpg")
      XCTAssertEqual(result.utType as String, "public.jpeg")
    #endif
  }

  // MARK: - compress (positive)
  func testCompress_validJPEG_createsFile() throws {
    let sourceUrl = createTestImage(width: 2000, height: 2000)

    defer { try? FileManager.default.removeItem(at: sourceUrl) }

    let resultUrl = try ImageCompressorService.compress(
      sourceUrl: sourceUrl,
      quality: 0.5,
      maxWidth: 1000,
      maxHeight: nil,
      imageFormat: .jpg
    )

    defer { try? FileManager.default.removeItem(at: resultUrl) }

    XCTAssertTrue(
      FileManager.default.fileExists(atPath: resultUrl.path),
      "Compressed file should exit"
    )

    XCTAssertTrue(
      resultUrl.lastPathComponent.hasSuffix(".jpg"),
      "File extension should be .jpg"
    )

    // Check new image size [quality]
    let originalSize =
      try FileManager.default.attributesOfItem(
        atPath: sourceUrl
          .path
      )[.size] as! UInt64
    let compressedSize =
      try FileManager.default.attributesOfItem(
        atPath: resultUrl
          .path
      )[.size] as! UInt64

    XCTAssertLessThan(compressedSize, originalSize)

  }

  func testCompress_png_format() throws {
    let sourceUrl = createTestImage(width: 2000, height: 2000)

    defer { try? FileManager.default.removeItem(at: sourceUrl) }
    let resultUrl = try ImageCompressorService.compress(

      sourceUrl: sourceUrl,
      quality: 0.5,
      maxWidth: 1000,
      maxHeight: nil,
      imageFormat: .png
    )

    defer { try? FileManager.default.removeItem(at: resultUrl) }

    XCTAssertTrue(
      FileManager.default.fileExists(atPath: resultUrl.path),
      "Compressed file should exit"
    )

    XCTAssertTrue(
      resultUrl.lastPathComponent.hasSuffix(".png"),
      "File extension should be .png"
    )
  }

  // MARK: - compress (negative)

  func testCompress_httpUrl_trhowsError() {
    let httpUrl = URL(string: "http://someurl.com")!

    XCTAssertThrowsError(
      try ImageCompressorService
        .compress(
          sourceUrl: httpUrl,
          quality: 1.0,
          maxWidth: 100,
          maxHeight: 100,
          imageFormat: .jpg
        )
    ) { error in
      XCTAssertEqual(
        error as? ImageCompressorError,
        ImageCompressorError.invalidSourceUrl
      )
    }
  }

  func testCompress_fileNotExists() {

    XCTAssertThrowsError(
      try ImageCompressorService
        .compress(
          sourceUrl: fakeUrl,
          quality: 1.0,
          maxWidth: 100,
          maxHeight: 100,
          imageFormat: .jpg
        )
    ) { error in
      XCTAssertEqual(
        error as? ImageCompressorError,
        ImageCompressorError.fileDoesNotExist
      )
    }
  }

  func testCompress_notAnImage_throwsCannotReadSource() throws {
    let txtUrl = URL(fileURLWithPath: NSTemporaryDirectory())
      .appendingPathComponent("fake.jpg")
    try "this is not an image".write(
      to: txtUrl,
      atomically: true,
      encoding: .utf8
    )
    defer { try? FileManager.default.removeItem(at: txtUrl) }

    XCTAssertThrowsError(
      try ImageCompressorService.compress(
        sourceUrl: txtUrl,
        quality: 1.0,
        maxWidth: 100,
        maxHeight: 100,
        imageFormat: .jpg
      )
    ) { error in
      XCTAssertEqual(error as? ImageCompressorError, .cannotReadDimensions)
    }
  }

  func testCompress_wrongParameters_quality_less_than_zero() {
    XCTAssertThrowsError(
      try ImageCompressorService
        .compress(
          sourceUrl: fakeUrl,
          quality: -0.1,
          maxWidth: 100,
          maxHeight: 100,
          imageFormat: .png
        )
    ) { error in
      XCTAssertEqual(
        error as? ImageCompressorError,
        .invalidTargetParameter
      )
    }
  }

  func testCompress_wrongParameters_quality_greater_than_one() {
    XCTAssertThrowsError(
      try ImageCompressorService
        .compress(
          sourceUrl: fakeUrl,
          quality: 1.1,
          maxWidth: 100,
          maxHeight: 100,
          imageFormat: .png
        )
    ) { error in
      XCTAssertEqual(
        error as? ImageCompressorError,
        .invalidTargetParameter
      )
    }
  }

  func testCompress_wrongParameters_negativeMaxWidth() {
    XCTAssertThrowsError(
      try ImageCompressorService
        .compress(
          sourceUrl: fakeUrl,
          quality: 1.0,
          maxWidth: -100,
          maxHeight: 100,
          imageFormat: .png
        )
    ) { error in
      XCTAssertEqual(
        error as? ImageCompressorError,
        .invalidTargetParameter
      )
    }
  }

  func testCompress_wrongParameters_negativeMaxHeight() {
    XCTAssertThrowsError(
      try ImageCompressorService
        .compress(
          sourceUrl: fakeUrl,
          quality: 1.0,
          maxWidth: 100,
          maxHeight: -100,
          imageFormat: .png
        )
    ) { error in
      XCTAssertEqual(
        error as? ImageCompressorError,
        .invalidTargetParameter
      )
    }
  }

}
