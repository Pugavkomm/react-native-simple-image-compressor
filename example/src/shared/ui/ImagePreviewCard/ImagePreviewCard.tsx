import { Card } from '@shared/ui/Card';
import { TextBlock } from '@shared/ui/TextBlock';
import { Stack } from '@shared/ui/Stack';
import { Image, StyleSheet } from 'react-native';
import { useImageCompressor } from 'react-native-simple-image-compressor';
import { useEffect, useState } from 'react';

const formatSize = (bytes: number | null) => {
  if (bytes === null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};
export interface ImagePreviewCardProps {
  title: string;
  uri: string;
  size: number | null;
  action?: React.ReactNode;
}

export const ImagePreviewCard = ({
  title,
  uri,
  size,
  action,
}: ImagePreviewCardProps) => {
  const { getFileSize } = useImageCompressor();
  const [fileSize, setFileSize] = useState<number | null>(null);

  useEffect(() => {
    getFileSize(uri).then((fsize) => {
      setFileSize(fsize);
    });
  }, [getFileSize, uri]);

  return (
    <Card>
      <Card.Header>
        <TextBlock size="lg" weight="bold">
          {title}
        </TextBlock>
      </Card.Header>
      <Card.Body gap="regular">
        <Image source={{ uri }} style={styles.preview} />
        <Stack direction="col" align="center" justify="space-between">
          <TextBlock color="secondary" size="sm">
            Size: {formatSize(size)}
          </TextBlock>
          <TextBlock color="accent" size="sm">
            getFileSize result: {formatSize(fileSize)}
          </TextBlock>
          {action}
        </Stack>
      </Card.Body>
    </Card>
  );
};

const styles = StyleSheet.create({
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'contain',
    backgroundColor: '#000',
  },
});
