import { Text, type TextProps, type TextStyle } from 'react-native';
import { type FC } from 'react';
import {
  FONT_SIZES,
  FONT_WEIGHTS,
  type FontSizeKey,
  type FontWeightKey,
  TEXT_COLORS,
  type TextColorsKeys,
} from '@shared/config/theme';

export interface TextBlockProps extends TextProps {
  color?: TextColorsKeys;
  size?: FontSizeKey;
  weight?: FontWeightKey;
  align?: TextStyle['textAlign'];
}

export const TextBlock: FC<TextBlockProps> = ({
  color = 'primary',
  size = 'md',
  weight = 'regular',
  align = 'left',
  style,
  ...props
}) => {
  return (
    <Text
      {...props}
      style={[
        {
          color: TEXT_COLORS[color],
          fontSize: FONT_SIZES[size],
          fontWeight: FONT_WEIGHTS[weight],
          textAlign: align,
        },
        style,
      ]}
    />
  );
};
