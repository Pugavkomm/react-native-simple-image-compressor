import { renderHook, act } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn(),
  },
}));
jest.mock('../compressImage.native');
jest.mock('../getFileSize.native');

import { useImageCompressor } from '../hooks/useImageCompressor';
import { compressImage } from '../compressImage.native';
import { getFileSize } from '../getFileSize.native';
import { ImageCompressorError } from '../ImageCompressorError';

const mockCompressImage = compressImage as jest.MockedFunction<
  typeof compressImage
>;
const mockGetFileSize = getFileSize as jest.MockedFunction<typeof getFileSize>;

// Helper to create controlled promises
const createControlledPromise = <T,>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

describe('useImageCompressor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('compress', () => {
    it('should successfully compress an image and update state', async () => {
      const mockResult = {
        uri: 'file:///compressed.jpg',
        width: 100,
        height: 100,
        fileSize: 1024,
        originalFileSize: 2048,
        format: 'jpeg' as const,
      };

      const { promise, resolve } = createControlledPromise<any>();
      mockCompressImage.mockReturnValue(promise);

      const { result } = await renderHook(() => useImageCompressor());

      expect(result.current.isCompressing).toBe(false);
      expect(result.current.error).toBeNull();

      let compressPromise: Promise<any>;

      // Start the compression without awaiting it yet
      await act(async () => {
        compressPromise = result.current.compress('file:///test.jpg', {
          format: 'jpeg',
          quality: 0.8,
        });
      });

      // should be isCompression=true
      expect(result.current.isCompressing).toBe(true);

      // Resolve
      await act(async () => {
        resolve(mockResult);
        await compressPromise;
      });

      const compressedResult = await compressPromise!;

      expect(compressedResult).toEqual(mockResult);
      expect(result.current.isCompressing).toBe(false);
      expect(result.current.error).toBeNull();

      expect(mockCompressImage).toHaveBeenCalledTimes(1);
    });

    it('should handle ImageCompressorError correctly', async () => {
      const mockError = new ImageCompressorError(
        'E_TEST',
        'Compression failed'
      );
      const { promise, reject } = createControlledPromise<any>();
      mockCompressImage.mockReturnValue(promise);

      const { result } = await renderHook(() => useImageCompressor());

      let compressPromise: Promise<any>;
      await act(async () => {
        compressPromise = result.current.compress('file:///test.jpg', {
          format: 'jpeg',
          quality: 0.8,
        });
      });

      await act(async () => {
        reject(mockError);
        await compressPromise;
      });

      const compressedResult = await compressPromise!;
      expect(compressedResult).toBeNull();
      expect(result.current.isCompressing).toBe(false);
      expect(result.current.error).toBe(mockError);
    });

    it('should convert unknown errors to Error instances', async () => {
      const { promise, reject } = createControlledPromise<any>();
      mockCompressImage.mockReturnValue(promise);

      const { result } = await renderHook(() => useImageCompressor());

      let compressPromise: Promise<any>;
      await act(async () => {
        compressPromise = result.current.compress('file:///test.jpg', {
          format: 'jpeg',
          quality: 0.8,
        });
      });

      await act(async () => {
        reject('String error');
        await compressPromise;
      });

      const compressedResult = await compressPromise!;
      expect(compressedResult).toBeNull();
      expect(result.current.isCompressing).toBe(false);
      expect(result.current.error).toBeInstanceOf(Error);
      expect((result.current.error as Error).message).toBe('String error');
    });
  });

  describe('getFileSize', () => {
    it('should successfully get file size and update state', async () => {
      const { promise, resolve } = createControlledPromise<number>();
      mockGetFileSize.mockReturnValue(promise);

      const { result } = await renderHook(() => useImageCompressor());

      expect(result.current.isGettingSize).toBe(false);
      expect(result.current.error).toBeNull();

      let sizePromise: Promise<any>;
      await act(async () => {
        sizePromise = result.current.getFileSize('file:///test.jpg');
      });

      expect(result.current.isGettingSize).toBe(true);

      await act(async () => {
        resolve(5000);
        await sizePromise;
      });

      const size = await sizePromise!;
      expect(size).toBe(5000);
      expect(result.current.isGettingSize).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockGetFileSize).toHaveBeenCalledTimes(1);
    });

    it('should handle ImageCompressorError correctly during getFileSize', async () => {
      const mockError = new ImageCompressorError(
        'E_TEST',
        'Cannot get file size'
      );
      const { promise, reject } = createControlledPromise<number>();
      mockGetFileSize.mockReturnValue(promise);

      const { result } = await renderHook(() => useImageCompressor());

      let sizePromise: Promise<any>;
      await act(async () => {
        sizePromise = result.current.getFileSize('file:///test.jpg');
      });

      await act(async () => {
        reject(mockError);
        await sizePromise;
      });

      const size = await sizePromise!;
      expect(size).toBeNull();
      expect(result.current.isGettingSize).toBe(false);
      expect(result.current.error).toBe(mockError);
    });
  });

  describe('isLoading', () => {
    it('should be true if either isCompressing or isGettingSize is true', async () => {
      const { promise } = createControlledPromise<any>();
      mockCompressImage.mockReturnValue(promise);

      const { result } = await renderHook(() => useImageCompressor());

      expect(result.current.isLoading).toBe(false);

      await act(async () => {
        result.current.compress('file:///test.jpg', {
          format: 'jpeg',
          quality: 0.8,
        });
      });

      expect(result.current.isCompressing).toBe(true);
      expect(result.current.isLoading).toBe(true);
    });
  });
});
