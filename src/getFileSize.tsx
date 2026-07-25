export async function getFileSize(_uri: string): Promise<number> {
  throw new Error(
    '[SimpleImageCompressor] Web platform is not supported. Please implement your own web compression logic or conditionally call this method only on native platforms.'
  );
}
