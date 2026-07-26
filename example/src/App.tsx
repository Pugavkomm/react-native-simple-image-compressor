import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
} from 'react-native';

import { COLORS } from '@shared/config/theme/colors';
import { TextBlock } from '@shared/ui/TextBlock';
import { Stack } from '@shared/ui/Stack';
import { CompressorWidget } from '@widgets/CompressorWidget';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Stack
          paddingTop={'regular'}
          paddingHorizontal={'medium'}
          paddingBottom={'huge'}
          gap={'huge'}
        >
          <Stack gap={'small'}>
            <TextBlock
              size={'xxl'}
              color={'accent'}
              weight={'bold'}
              align={'center'}
            >
              Simple Image Compressor
            </TextBlock>
            <TextBlock size={'xl'} weight={'regular'} align={'center'}>
              Demo
            </TextBlock>
          </Stack>

          <CompressorWidget />
        </Stack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgr,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});
