import { useState } from 'react';
import { Alert } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import {
  type CompressOptions,
  type OutputCompressedFormat,
  useImageCompressor,
} from 'react-native-simple-image-compressor';
import { Stack } from '@shared/ui/Stack';
import { TextBlock } from '@shared/ui/TextBlock';
import { Button } from '@shared/ui/Button';
import { Select } from '@shared/ui/Select';
import { Card } from '@shared/ui/Card';
import { ImagePreviewCard } from '@shared/ui/ImagePreviewCard/ImagePreviewCard';

const getCompressionRatio = (
  original: number | null,
  compressed: number | null
) => {
  if (original && compressed) {
    const ratio = ((1 - compressed / original) * 100).toFixed(1);
    return `(-${ratio}%)`;
  }
  return '';
};

export const CompressorWidget = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);

  const [options, setOptions] = useState<CompressOptions>({
    format: 'webp',
    quality: 0.8,
    maxWidth: 1000,
    maxHeight: 1000,
  });

  const { compress, isCompressing } = useImageCompressor();

  const pickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
      });
      if (result.assets?.[0]?.uri) {
        setOriginalImage(result.assets[0].uri);
        setOriginalSize(result.assets[0].fileSize ?? null);
        setCompressedImage(null);
        setCompressedSize(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Selection Error');
      console.error(error);
    }
  };

  const takePhoto = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        saveToPhotos: false,
      });
      if (result.assets?.[0]?.uri) {
        setOriginalImage(result.assets[0].uri);
        setOriginalSize(result.assets[0].fileSize ?? null);
        setCompressedImage(null);
        setCompressedSize(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Camera Error');
      console.error(error);
    }
  };

  const handleCompress = async () => {
    if (!originalImage) return;

    const finalOptions: CompressOptions = {
      ...options,
      maxWidth: options.maxWidth === 0 ? undefined : options.maxWidth,
      maxHeight: options.maxHeight === 0 ? undefined : options.maxHeight,
    };

    const result = await compress(originalImage, finalOptions);
    if (result) {
      setCompressedImage(result.uri);
      // use the library's returned fileSize if available, otherwise fallback
      if (result.fileSize) {
        setCompressedSize(result.fileSize);
      } else {
        try {
          const response = await fetch(result.uri);
          const blob = await response.blob();
          setCompressedSize(blob.size);
        } catch {}
      }
    } else {
      Alert.alert('Error', 'Compression failed');
    }
  };

  return (
    <Stack gap="huge">
      {/* 1. Image source */}
      <Card>
        <Card.Header>
          <TextBlock size="lg" weight="bold">
            Select Image
          </TextBlock>
        </Card.Header>
        <Card.Body flex={1}>
          <Stack direction={'row'} gap="small" flex={1}>
            <Button title="Gallery" onPress={pickImage} variant="secondary" />
            <Button title="Camera" onPress={takePhoto} variant="secondary" />
          </Stack>
        </Card.Body>
      </Card>

      {/* 2. Options */}
      <Card>
        <Card.Header>
          <TextBlock size="lg" weight="bold">
            Compression Options
          </TextBlock>
        </Card.Header>
        <Card.Body gap="regular" flex={1}>
          <Stack direction={'row'} gap="regular" flex={1}>
            <Select
              label="Format"
              selectedValue={options.format}
              onValueChange={(val) =>
                setOptions({
                  ...options,
                  format: val as OutputCompressedFormat,
                })
              }
              options={[
                { label: 'JPG', value: 'jpg' },
                { label: 'PNG', value: 'png' },
                { label: 'WEBP', value: 'webp' },
                { label: 'WEBP LOSSLESS', value: 'webp-lossless' },
              ]}
            />
            <Select
              label="Quality"
              selectedValue={options.quality}
              onValueChange={(val) => setOptions({ ...options, quality: val })}
              options={[
                { label: 'Low (0.3)', value: 0.3 },
                { label: 'Medium (0.5)', value: 0.5 },
                { label: 'High (0.8)', value: 0.8 },
                { label: 'Max (1.0)', value: 1.0 },
              ]}
            />
          </Stack>
          <Stack direction={'row'} flex={1} gap="regular">
            <Select
              label="Max Width"
              selectedValue={options.maxWidth ?? 0}
              onValueChange={(val) => setOptions({ ...options, maxWidth: val })}
              options={[
                { label: 'None', value: 0 },
                { label: '500px', value: 500 },
                { label: '1000px', value: 1000 },
                { label: '2000px', value: 2000 },
              ]}
            />
            <Select
              label="Max Height"
              selectedValue={options.maxHeight ?? 0}
              onValueChange={(val) =>
                setOptions({ ...options, maxHeight: val })
              }
              options={[
                { label: 'None', value: 0 },
                { label: '500px', value: 500 },
                { label: '1000px', value: 1000 },
                { label: '2000px', value: 2000 },
              ]}
            />
          </Stack>
        </Card.Body>
      </Card>

      {/* 3. Original Image */}
      {originalImage && (
        <Stack gap="regular">
          <ImagePreviewCard
            title="Original Image"
            uri={originalImage}
            size={originalSize}
          />
          <Button
            title={isCompressing ? 'Compressing...' : 'Compress Image'}
            onPress={handleCompress}
            disabled={isCompressing}
          />
        </Stack>
      )}

      {/* 4. Compressed Image */}
      {compressedImage && (
        <ImagePreviewCard
          title="Compressed Result"
          uri={compressedImage}
          size={compressedSize}
          action={
            <TextBlock color="accent" weight="bold">
              {getCompressionRatio(originalSize, compressedSize)}
            </TextBlock>
          }
        />
      )}
    </Stack>
  );
};
