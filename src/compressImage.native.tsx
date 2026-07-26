import { NitroModules } from 'react-native-nitro-modules';
import type {
  CompressedResult,
  CompressOptions,
  SimpleImageCompressor,
} from './SimpleImageCompressor.nitro';
import { ImageCompressorError } from './ImageCompressorError';

let hybridObject: SimpleImageCompressor | null = null;

/**
 * Compresses an image based on the provided URI and options.
 * @param uri - The local file URI of the image to compress.
 * @param options - Configuration options for compression (e.g., quality, format).
 * @returns A promise that resolves to the compressed image result, or null if an error occurred.
 */
export async function compressImage(
  uri: string,
  options: CompressOptions
): Promise<CompressedResult> {
  if (!hybridObject) {
    hybridObject = NitroModules.createHybridObject<SimpleImageCompressor>(
      'SimpleImageCompressor'
    );
  }

  try {
    return await hybridObject.compressImage(uri, options);
  } catch (error) {
    if (error instanceof Error) {
      const match = error.message.match(/\[(\d+)\]\s*(.*)/);
      if (match && match[1] && match[2]) {
        throw new ImageCompressorError(match[1], match[2]);
      }
    }
    throw error;
  }
}
