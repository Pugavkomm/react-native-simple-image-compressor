import type { CompressOptions } from './SimpleImageCompressor.nitro';

export async function compressImage(
  imageUri: string,
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options: CompressOptions
): Promise<string> {
  console.warn(
    '[SimpleImageCompressor] Web is not supported yet. Returning original image URI.'
  );
  return imageUri;
}
