import { describe, expect, it } from '@jest/globals';
import { isImageCompressorError } from '../utils/isImageCompressorError';
import { ImageCompressorError } from '../ImageCompressorError';

describe('isImageCompressorError', () => {
  it('should return true for an actual ImageCompressorError instance', () => {
    const error = new ImageCompressorError('1', 'Test error');
    expect(isImageCompressorError(error)).toBe(true);
  });

  it('should return true for a custom object that mocks the error shape (duck typing)', () => {
    const mockError = {
      isImageCompressorError: true,
      code: 'cannot-read-source',
      message: 'Mocked error',
    };
    expect(isImageCompressorError(mockError)).toBe(true);
  });

  it('should return false for standard Error instances', () => {
    const genericError = new Error('Generic error');
    expect(isImageCompressorError(genericError)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isImageCompressorError(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isImageCompressorError(undefined)).toBe(false);
  });

  it('should return false for primitive values (string, number, boolean)', () => {
    expect(isImageCompressorError('Error string')).toBe(false);
    expect(isImageCompressorError(404)).toBe(false);
    expect(isImageCompressorError(true)).toBe(false);
  });

  it('should return false for an object that is missing the isImageCompressorError flag', () => {
    const someObject = { code: '123', message: 'test' };
    expect(isImageCompressorError(someObject)).toBe(false);
  });

  it('should return false if the flag is false', () => {
    const fakeError = { isImageCompressorError: false };
    expect(isImageCompressorError(fakeError)).toBe(false);
  });
});
