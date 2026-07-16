import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn(() => ({
      compressImage: jest.fn(),
    })),
  },
}));

const mockHybridObject = jest.mocked(NitroModules.createHybridObject).mock
  .results[0]!.value;
// @ts-ignore
const mockCompressImage = mockHybridObject.compressImage as jest.Mock;

import { compressImage } from '../compressImage';
import { NitroModules } from 'react-native-nitro-modules';
describe('Native implementation of compressImage', () => {
  beforeEach(() => {
    mockCompressImage.mockClear();
  });
  it('creates HybridObject with correct name', () => {
    expect(NitroModules.createHybridObject).toHaveBeenCalledWith(
      'SimpleImageCompressor'
    );
  });
  it('passes uri and options to HybridObject', async () => {
    const fakeResult = {
      uri: 'file:///compressed.jpg',
      width: 100,
      height: 50,
    };
    mockCompressImage.mockResolvedValue(fakeResult as never);
    const options = { quality: 0.8, format: 'jpeg' as const };
    const result = await compressImage('file:///original.jpg', options);
    expect(mockCompressImage).toHaveBeenCalledWith(
      'file:///original.jpg',
      options
    );
    expect(result).toEqual(fakeResult);
  });
});
