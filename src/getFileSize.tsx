/**
 * Retrieves the file size of an image in bytes
 *
 * @param _uri - The local file URI of the image.
 * @returns A promise that resolves to the file size in bytes, or nul if an error occurred.
 */
export async function getFileSize(_uri: string): Promise<number> {
  throw new Error(
    '[SimpleImageCompressor] Web platform is not supported. Please implement your own web compression logic or conditionally call this method only on native platforms.'
  );
}
