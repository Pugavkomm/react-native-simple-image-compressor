import { Stack, type StackProps } from '../Stack';
import type { FC } from 'react';
import { StyleSheet } from 'react-native';
import { BORDER_WIDTH, COLORS } from '@shared/config/theme';

export const CardHeader: FC<StackProps> = ({ style, ...props }) => {
  return (
    <Stack
      paddingVertical={'medium'}
      style={[styles.cardHeader, style]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  cardHeader: {
    borderBottomWidth: BORDER_WIDTH.thin,
    borderBottomColor: COLORS.border,
  },
});
