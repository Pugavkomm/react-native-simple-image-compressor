import { NitroModules } from 'react-native-nitro-modules';
import type {
  CompressedResult,
  CompressOptions,
  SimpleImageCompressor,
} from './SimpleImageCompressor.nitro';
import { ImageCompressorError } from './imageCompressorError';

let hybridObject: SimpleImageCompressor | null = null;

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
