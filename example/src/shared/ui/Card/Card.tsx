import type { FC, ReactNode } from 'react';
import { Stack } from '../Stack';
import { StyleSheet } from 'react-native';
import { BORDER_RADIUS, BORDER_WIDTH, COLORS } from '@shared/config/theme';

export interface CardProps {
  children: ReactNode;
}

export const Card: FC<CardProps> = ({ children }) => {
  return (
    <Stack gap={'zero'} paddingHorizontal={'small'} style={styles.card}>
      {children}
    </Stack>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBgr,
    borderRadius: BORDER_RADIUS.small,
    borderColor: COLORS.border,
    borderWidth: BORDER_WIDTH.thin,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
});
