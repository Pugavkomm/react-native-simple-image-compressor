export const COLORS = {
  bgr: '#1f1f1f',
  cardBgr: '#2A2A2A',
  primary: '#5E996B',
  accent: '#5E996B',
  secondary: '#888888',
  danger: '#E53935',
  border: '#333333',
  overlay: 'rgba(0, 0, 0, 0.6)',
  transparentWhite5: 'rgba(255, 255, 255, 0.05)',
  transparentWhite10: 'rgba(255, 255, 255, 0.1)',
  transparentAccent: 'rgba(94, 153, 107, 0.1)',
} as const;

export const TEXT_COLORS = {
  primary: '#ffffff',
  secondary: '#cccccc',
  accent: '#5E996B',
  danger: '#E53935',
  inverted: '#000000',
} as const;

export type ColorsKeys = keyof typeof COLORS;
export type TextColorsKeys = keyof typeof TEXT_COLORS;
