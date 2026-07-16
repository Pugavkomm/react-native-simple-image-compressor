// @ts-ignore
import { compressImage } from '../compressImage.tsx';
import { describe, expect, it } from '@jest/globals';

describe("Web implementation 'compressImage`", () => {
  it('should throw Error, because not implemented for web', async () => {
    await expect(async () =>
      compressImage('path/to/file', { quality: 1.0, format: 'webp-lossless' })
    ).rejects.toThrow();
  });
});
