import { View, type ViewProps, type ViewStyle } from 'react-native';
import { type FC } from 'react';
import { type SizeKey, SIZES } from '@shared/config/theme';

export interface StackProps extends ViewProps {
  flex?: ViewStyle['flex'];
  padding?: SizeKey; // priority 3
  paddingHorizontal?: SizeKey; // priority 2
  paddingVertical?: SizeKey; // priority 2
  paddingTop?: SizeKey; // priority 1
  paddingBottom?: SizeKey; // priority 1
  paddingLeft?: SizeKey; // priority 1
  paddingRight?: SizeKey; // priority 1
  justify?: ViewStyle['justifyContent'];
  align?: ViewStyle['alignItems'];
  direction?: 'row' | 'col';
  gap?: SizeKey;
}

export const Stack: FC<StackProps> = ({
  flex = 1,
  padding,
  paddingHorizontal,
  paddingVertical,
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  justify,
  align,
  direction,
  gap = 'zero',
  style,
  ...props
}) => {
  const paddings = {
    ...(padding && { padding: SIZES[padding] }),
    ...(paddingHorizontal && { paddingHorizontal: SIZES[paddingHorizontal] }),
    ...(paddingVertical && { paddingVertical: SIZES[paddingVertical] }),
    ...(paddingTop && { paddingTop: SIZES[paddingTop] }),
    ...(paddingBottom && { paddingBottom: SIZES[paddingBottom] }),
    ...(paddingLeft && { paddingLeft: SIZES[paddingLeft] }),
    ...(paddingRight && { paddingRight: SIZES[paddingRight] }),
  };

  const flexDirection: ViewStyle['flexDirection'] = direction
    ? direction === 'col'
      ? 'column'
      : 'row'
    : undefined;

  return (
    <View
      {...props}
      style={[
        paddings,
        {
          flex: flex,
          gap: SIZES[gap],
          alignItems: align,
          justifyContent: justify,
          flexDirection: flexDirection,
        },
        style,
      ]}
    />
  );
};
