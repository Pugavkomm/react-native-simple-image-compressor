import type { HybridObject } from 'react-native-nitro-modules';

export type OutputCompressedFormat =
  'jpg' | 'png' | 'jpeg' | 'webp' | 'webp-lossless';

export interface CompressedResult {
  /** The file uri of the compressed image */
  uri: string;
  /** The image's width */
  width: number;
  /** The image's height */
  height: number;
  /** The final compressed image format */
  format: OutputCompressedFormat;
  /** The compressed image's file size in bytes */
  fileSize: number;
}

export interface CompressOptions {
  /** The compression quality, ranging from `0.0` (maximum compression) to `1.0`
   * (maximum quality).
   */
  quality: number;
  /**
   * An optional maximum width boundary. If `undefined`, the width is not
   * constrained.
   */
  maxWidth?: number;
  /**
   * An optional maximum height boundary. If `undefined`, the height is not
   * constrained
   *
   * @note If {@link enablePhysicalRotation} is `false`, this limit applies to the logical
   * (viewable) height of the image.
   */
  maxHeight?: number;

  /** The target image format */
  format: OutputCompressedFormat;

  /**
   * If `true`, physically rotates the image pixels based on EXIF orientation metadata.
   * If `false`, the original EXIF orientation is preserved.
   *
   * @default false
   */
  enablePhysicalRotation?: boolean;
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
