import { useCallback, useState } from 'react';

import type {
  CompressedResult,
  CompressOptions,
} from '../SimpleImageCompressor.nitro';
import { compressImage } from '../compressImage';
import { ImageCompressorError } from '../ImageCompressorError';
import { getFileSize as _getFileSize } from '../getFileSize';

/**
 * A hook that provides stateful methods for image compression and file size calculation.
 * It automatically manages loading states and error handling.
 *
 * @returns An object containing the compression methods and their execution states.
 *
 * @example
 * ```tsx
 * const { compress, isCompressing, error } = useImageCompressor();
 *
 * const handleCompress = async () => {
 *   const result = await compress('file://path/to/image.jpg', { quality: 0.8 });
 *   if (result) console.log(result.path);
 * };
 * ```
 */
export function useImageCompressor() {
  const [isCompressing, setIsCompressing] = useState(false);
  const [isGettingSize, setIsGettingSize] = useState(false);
  const [error, setError] = useState<ImageCompressorError | Error | null>(null);

  const compress = useCallback(
    async (
      uri: string,
      options: CompressOptions
    ): Promise<CompressedResult | null> => {
      setIsCompressing(true);
      setError(null);

      try {
        return await compressImage(uri, options);
      } catch (e) {
        if (e instanceof ImageCompressorError) {
          setError(e);
        } else {
          setError(e instanceof Error ? e : new Error(String(e)));
        }
        return null;
      } finally {
        setIsCompressing(false);
      }
    },
    []
  );
  const getFileSize = useCallback(
    async (uri: string): Promise<number | null> => {
      setIsGettingSize(true);
      setError(null);

      try {
        return await _getFileSize(uri);
      } catch (e) {
        if (e instanceof ImageCompressorError) {
          setError(e);
        }
        return null;
      } finally {
        setIsGettingSize(false);
      }
    },
    []
  );

  return {
    /**
     * Compresses an image based on the provided URI and options.
     * @param uri - The local file URI of the image to compress.
     * @param options - Configuration options for compression (e.g., quality, format).
     * @returns A promise that resolves to the compressed image result, or null if an error occurred.
     */
    compress,
    /**
     * Retrieves the file size of an image in bytes
     * @param uri - The local file URI of the image.
     * @returns A promise that resolves to the file size in bytes, or nul if an error occurred.
     */
    getFileSize,
    /** Indicates whether an image is currently being compressed. */
    isCompressing,
    /** Indicates whether the file size is currently being calculated. */
    isGettingSize,
    /** A combined loading state that is true if either compression or size calculation is in progress. */
    isLoading: isCompressing || isGettingSize,
    /** Contains the error object if the last operation failed or null. */
    error,
  };
}
