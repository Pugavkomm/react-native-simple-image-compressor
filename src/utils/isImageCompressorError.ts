import { ImageCompressorError } from '../ImageCompressorError';

/**
 * Type guard to check if an error is an ImageCompressorError.
 * Safe to use across module boundaries where `instanceof` might fail.
 */
export function isImageCompressorError(
  payload: any
): payload is ImageCompressorError {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    payload.isImageCompressorError === true
  );
}
