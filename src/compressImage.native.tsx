import { NitroModules } from 'react-native-nitro-modules';
import type {
  CompressedResult,
  CompressOptions,
  SimpleImageCompressor,
} from './SimpleImageCompressor.nitro';

const SimpleImageCompressorHybridObject =
  NitroModules.createHybridObject<SimpleImageCompressor>(
    'SimpleImageCompressor'
  );

export async function compressImage(
  uri: string,
  options: CompressOptions
): Promise<CompressedResult> {
  return await SimpleImageCompressorHybridObject.compressImage(uri, options);
}
