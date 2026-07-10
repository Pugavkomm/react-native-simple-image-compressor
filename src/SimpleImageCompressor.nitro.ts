import type { HybridObject } from 'react-native-nitro-modules';

export type OutputCompressedFormat =
  'jpg' | 'png' | 'jpeg' | 'webp' | 'webp-lossless';

export interface CompressedResult {
  uri: string;
}

export interface CompressOptions {
  quality: number;
  maxWidth?: number;
  maxHeight?: number;
  format: OutputCompressedFormat;
}

export interface SimpleImageCompressor extends HybridObject<{
  ios: 'swift';
  android: 'kotlin';
}> {
  compressImage(
    uri: string,
    options: CompressOptions
  ): Promise<CompressedResult>;
}
