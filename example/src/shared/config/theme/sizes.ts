export const SIZES = {
  zero: 0,
  micro: 2,
  ultrasmall: 4,
  small: 8,
  regular: 12,
  medium: 16,
  larget: 20,
  huge: 24,
  ultraHuge: 32,
  giant: 48,
  massive: 64,
} as const;

export type SizeKey = keyof typeof SIZES;
export type SizeValue = (typeof SIZES)[SizeKey];
