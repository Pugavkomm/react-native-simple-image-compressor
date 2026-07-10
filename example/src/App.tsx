import { useState } from 'react';
import {
  compressImage,
  type CompressOptions,
} from 'react-native-simple-image-compressor';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const formatSize = (bytes: number | null) => {
  if (bytes === null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getCompressionRatio = (
  original: number | null,
  compressed: number | null
) => {
  if (original && compressed) {
    const ratio = ((1 - compressed / original) * 100).toFixed(1);
    return `(Compressed by ${ratio}%)`;
  }
  return '';
};

export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const pickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        includeExtra: true,
      });

      if (result.didCancel || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];

      if (asset?.uri) {
        setOriginalImage(asset.uri);
        setOriginalSize(asset.fileSize ?? null);
        setCompressedImage(null);
        setCompressedSize(null);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Selection Error');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        saveToPhotos: false,
        includeExtra: true,
      });

      if (result.didCancel || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];

      if (asset?.uri) {
        setOriginalImage(asset.uri);
        setOriginalSize(asset.fileSize ?? null);
        setCompressedImage(null);
        setCompressedSize(null);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Camera Error');
    }
  };

  const handleCompress = async () => {
    if (!originalImage) return;

    setIsCompressing(true);
    try {
      const options: CompressOptions = {
        quality: 0.5,
        format: 'jpg',
        maxHeight: 1000,
        maxWidth: 500,
      };

      console.log('Starting compression with options:', options);

      const result = await compressImage(originalImage, options);
      const resultUri = result.uri;
      console.log('Compression result:', resultUri);

      setCompressedImage(resultUri);

      try {
        const response = await fetch(resultUri);
        const blob = await response.blob();
        setCompressedSize(blob.size);
      } catch (sizeError) {
        console.error('Failed to get compressed file size', sizeError);
      }
    } catch (error) {
      console.error('Compression failed:', error);
      Alert.alert('Compression error', String(error));
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Nitro Image Compressor</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.buttonText}>🖼 Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.cameraBtn]}
            onPress={takePhoto}
          >
            <Text style={styles.buttonText}>📸 Camera</Text>
          </TouchableOpacity>
        </View>

        {originalImage && (
          <View style={styles.imageContainer}>
            <Text style={styles.label}>Original:</Text>
            <Image
              source={{ uri: originalImage }}
              style={styles.imagePreview}
            />
            {originalSize !== null && (
              <Text style={styles.sizeText}>
                Size: {formatSize(originalSize)}
              </Text>
            )}
            <Text style={styles.uriText} numberOfLines={2}>
              {originalImage}
            </Text>

            <TouchableOpacity
              style={[styles.button, styles.compressBtn]}
              onPress={handleCompress}
              disabled={isCompressing}
            >
              <Text style={styles.buttonText}>
                {isCompressing ? 'Compressing...' : '2. Compress'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {compressedImage && (
          <View style={styles.imageContainer}>
            <Text style={styles.label}>Result (Compressed):</Text>
            <Image
              source={{ uri: compressedImage }}
              style={styles.imagePreview}
            />
            {compressedSize !== null && (
              <Text style={styles.sizeText}>
                Size: {formatSize(compressedSize)}{' '}
                {getCompressionRatio(originalSize, compressedSize)}
              </Text>
            )}
            <Text style={styles.uriText} numberOfLines={2}>
              {compressedImage}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  cameraBtn: {
    backgroundColor: '#5856D6', // Slightly different color for camera
  },
  compressBtn: {
    backgroundColor: '#34C759', // Green button for accent
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 15,
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    alignSelf: 'flex-start',
    color: '#333',
  },
  imagePreview: {
    width: 250,
    height: 250,
    borderRadius: 8,
    backgroundColor: '#E1E4E8',
    resizeMode: 'contain',
  },
  sizeText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '700',
    color: '#E53935',
  },
  uriText: {
    marginTop: 5,
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
  },
});
