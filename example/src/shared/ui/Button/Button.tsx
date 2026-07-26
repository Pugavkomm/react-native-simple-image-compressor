import { Pressable, type PressableProps, StyleSheet } from 'react-native';
import { type FC } from 'react';
import { TextBlock } from '../TextBlock';
import { COLORS } from '@shared/config/theme';

export interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: FC<ButtonProps> = ({
  title,
  variant = 'primary',
  style,
  disabled,
  ...props
}) => {
  const getBgr = () => {
    if (disabled) return COLORS.border;
    switch (variant) {
      case 'secondary':
        return COLORS.cardBgr;
      case 'danger':
        return COLORS.danger;
      default:
        return COLORS.primary;
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: getBgr() },
        pressed && styles.pressed,
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
      android_ripple={{ color: 'rgba(255, 255, 255, 0.2)', borderless: false }}
      disabled={disabled}
      {...props}
    >
      <TextBlock color={disabled ? 'secondary' : 'primary'} weight="semibold">
        {title}
      </TextBlock>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.8,
  },
});
