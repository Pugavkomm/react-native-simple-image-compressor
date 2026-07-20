import { NitroModules } from 'react-native-nitro-modules';
import type {
  CompressedResult,
  CompressOptions,
  SimpleImageCompressor,
} from './SimpleImageCompressor.nitro';

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
  return await hybridObject.compressImage(uri, options);
}
