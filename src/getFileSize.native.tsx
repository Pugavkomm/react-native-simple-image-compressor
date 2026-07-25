import { NitroModules } from 'react-native-nitro-modules';
import { ImageCompressorError } from './imageCompressorError';
import type { SimpleImageCompressor } from './SimpleImageCompressor.nitro';

let hybridObject: SimpleImageCompressor | null = null;

export async function getFileSize(uri: string): Promise<number> {
  if (!hybridObject) {
    hybridObject = NitroModules.createHybridObject<SimpleImageCompressor>(
      'SimpleImageCompressor'
    );
  }

  try {
    return await hybridObject.getFileSize(uri);
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
