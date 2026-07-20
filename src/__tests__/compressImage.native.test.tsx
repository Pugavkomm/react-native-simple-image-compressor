import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockCompressImage = jest.fn();

jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn(() => ({
      compressImage: mockCompressImage,
    })),
  },
}));

import { compressImage } from '../compressImage';
import { NitroModules } from 'react-native-nitro-modules';
describe('Native implementation of compressImage', () => {
  beforeEach(() => {
    mockCompressImage.mockClear();
  });
  it('lazily creates HybridObject and passes uri and options', async () => {
    const fakeResult = {
      uri: 'file:///compressed.jpg',
      width: 100,
      height: 50,
    };
    mockCompressImage.mockResolvedValue(fakeResult as never);
    const options = { quality: 0.8, format: 'jpeg' as const };

    const result = await compressImage('file:///original.jpg', options);

    expect(NitroModules.createHybridObject).toHaveBeenCalledWith(
      'SimpleImageCompressor'
    );
    expect(mockCompressImage).toHaveBeenCalledWith(
      'file:///original.jpg',
      options
    );
    expect(result).toEqual(fakeResult);
  });
});
