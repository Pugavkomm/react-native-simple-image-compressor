import type {
  CompressedResult,
  CompressOptions,
} from './SimpleImageCompressor.nitro';

export async function compressImage(
  _imageUri: string,
  _options: CompressOptions
): Promise<CompressedResult> {
  throw new Error(
    '[SimpleImageCompressor] Web platform is not supported. Please implement your own web compression logic or conditionally call this method only on native platforms.'
  );
}
