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
  code: string;
  constructor(numericCode: string, message: string) {
    super(message);
    this.name = 'ImageCompressorError';
    this.code = ERROR_CODES_MAP[numericCode] || 'unknown-error';
  }
}
