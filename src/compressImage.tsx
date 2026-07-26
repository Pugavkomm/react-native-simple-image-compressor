import type {
  CompressedResult,
  CompressOptions,
} from './SimpleImageCompressor.nitro';

/**
 * Compresses an image based on the provided URI and options.
 * @param _uri - The local file URI of the image to compress.
 * @param _options - Configuration options for compression (e.g., quality, format).
 * @returns A promise that resolves to the compressed image result, or null if an error occurred.
 */
export async function compressImage(
  _uri: string,
  _options: CompressOptions
): Promise<CompressedResult> {
  throw new Error(
    '[SimpleImageCompressor] Web platform is not supported. Please implement your own web compression logic or conditionally call this method only on native platforms.'
  );
}
