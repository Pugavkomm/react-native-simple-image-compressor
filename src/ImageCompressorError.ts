const ERROR_CODES_MAP: Record<string, string> = {
  '1': 'cannot-read-source',
  '2': 'cannot-read-dimensions',
  '3': 'cannot-create-dest',
  '4': 'write-failed',
  '5': 'invalid-source-uri',
  '6': 'file-not-found',
  '7': 'decoding-failed',
  '8': 'invalid-parameters',
};

export class ImageCompressorError extends Error {
  /**
   * A string code representing the specific reason for the failure.
   * Useful for programmatic error handling (e.g., `'invalid-source-uri'`).
   */
  code: string;
  /** Boolean indicates if the error is an `ImageCompressorError` */

  isImageCompressorError: true = true;
  /**
   * @param numericCode - The raw numeric error code returned by the native (C++/Kotlin/Swift) side.
   * @param message - The descriptive error message from the native platform.
   */
  constructor(numericCode: string, message: string) {
    super(message);
    this.name = 'ImageCompressorError';
    this.code = ERROR_CODES_MAP[numericCode] || 'unknown-error';
  }
}
