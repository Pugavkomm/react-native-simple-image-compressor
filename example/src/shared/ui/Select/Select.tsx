import { useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { TextBlock } from '../TextBlock';
import { Stack } from '../Stack';
import { BORDER_RADIUS, BORDER_WIDTH, COLORS } from '@shared/config/theme';

export interface SelectProps<T> {
  label: string;
  selectedValue: T;
  onValueChange: (val: T) => void;
  options: { label: string; value: T }[];
  placeholder?: string;
  cancelText?: string;
}

export function Select<T>({
  label,
  selectedValue,
  onValueChange,
  options,
  placeholder = 'Select...',
  cancelText = 'Cancel',
}: SelectProps<T>) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((o) => o.value === selectedValue);

  const handleSelect = (val: T) => {
    onValueChange(val);
    setModalVisible(false);
  };

  return (
    <Stack flex={1} gap="small">
      <Stack flex={1} paddingLeft="micro">
        <TextBlock size="sm" color="primary">
          {label}
        </TextBlock>
      </Stack>

      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}
      >
        <Stack flex={1} direction="row" align="center" justify="space-between">
          <TextBlock size="md" color="primary">
            {selectedOption ? selectedOption.label : placeholder}
          </TextBlock>

          <TextBlock size="sm" color="secondary">
            ▼
          </TextBlock>
        </Stack>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Stack flex={1} justify="flex-end">
            <Stack
              flex={0}
              style={styles.bottomSheet}
              paddingTop="medium"
              paddingBottom={Platform.OS === 'ios' ? 'ultraHuge' : 'huge'}
              gap="medium"
            >
              <Stack
                flex={0}
                style={styles.sheetHeader}
                paddingHorizontal="huge"
                paddingBottom="medium"
              >
                <TextBlock size="lg" color="primary" weight="bold">
                  {label}
                </TextBlock>
              </Stack>

              <FlatList
                data={options}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => {
                  const isSelected = item.value === selectedValue;
                  return (
                    <TouchableOpacity
                      style={isSelected && styles.optionRowSelected}
                      onPress={() => handleSelect(item.value)}
                    >
                      <Stack
                        flex={0}
                        direction="row"
                        justify="space-between"
                        align="center"
                        paddingVertical="medium"
                        paddingHorizontal="huge"
                      >
                        <TextBlock
                          size="md"
                          color={isSelected ? 'accent' : 'primary'}
                          weight={isSelected ? 'bold' : 'regular'}
                        >
                          {item.label}
                        </TextBlock>
                        {isSelected && (
                          <TextBlock size="md" color="accent">
                            ✓
                          </TextBlock>
                        )}
                      </Stack>
                    </TouchableOpacity>
                  );
                }}
              />

              <Stack flex={0} paddingHorizontal="huge">
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Stack flex={0} paddingVertical="medium" align="center">
                    <TextBlock size="md" color="secondary" align="center">
                      {cancelText}
                    </TextBlock>
                  </Stack>
                </TouchableOpacity>
              </Stack>
            </Stack>
          </Stack>
        </Pressable>
      </Modal>
    </Stack>
  );
}

const styles = StyleSheet.create({
  selectorButton: {
    backgroundColor: COLORS.transparentWhite5,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.transparentWhite10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
  },
  bottomSheet: {
    backgroundColor: COLORS.bgr,
    borderTopLeftRadius: BORDER_RADIUS.medium,
    borderTopRightRadius: BORDER_RADIUS.medium,
    maxHeight: '60%',
    boxShadow: '0 -4px 10px rgba(0, 0, 0, 0.1)',
  },
  sheetHeader: {
    borderBottomWidth: BORDER_WIDTH.thin,
    borderBottomColor: COLORS.border,
  },
  optionRowSelected: {
    backgroundColor: COLORS.transparentAccent,
  },
  cancelButton: {
    borderRadius: BORDER_RADIUS.small,
    backgroundColor: COLORS.cardBgr,
    borderColor: COLORS.border,
    borderWidth: BORDER_WIDTH.thin,
  },
});
