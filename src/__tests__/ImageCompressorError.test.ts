import { describe, expect, it } from '@jest/globals';
import { ImageCompressorError } from '../ImageCompressorError';

describe('ImageCompressorError', () => {
  it('should correctly map a known numeric code to a string code', () => {
    const error = new ImageCompressorError('5', 'Source URI is not valid');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ImageCompressorError);
    expect(error.name).toBe('ImageCompressorError');
    expect(error.message).toBe('Source URI is not valid');
    expect(error.code).toBe('invalid-source-uri'); // mapped from '5'
    expect(error.isImageCompressorError).toBe(true);
  });

  it('should fallback to "unknown-error" for unknown numeric codes', () => {
    const error = new ImageCompressorError(
      '999',
      'Something went completely wrong'
    );

    expect(error.code).toBe('unknown-error');
    expect(error.message).toBe('Something went completely wrong');
  });

  it('should fallback to "unknown-error" if code is completely invalid (e.g., empty string)', () => {
    const error = new ImageCompressorError('', 'Empty error');

    expect(error.code).toBe('unknown-error');
  });

  it('should preserve the standard Error stack trace', () => {
    const error = new ImageCompressorError('1', 'Test stack');
    expect(error.stack).toBeDefined();
    expect(typeof error.stack).toBe('string');
  });
});
