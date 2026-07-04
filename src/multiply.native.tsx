import { NitroModules } from 'react-native-nitro-modules';
import type { SimpleImageCompressor } from './SimpleImageCompressor.nitro';

const SimpleImageCompressorHybridObject =
  NitroModules.createHybridObject<SimpleImageCompressor>('SimpleImageCompressor');

export function multiply(a: number, b: number): number {
  return SimpleImageCompressorHybridObject.multiply(a, b);
}
