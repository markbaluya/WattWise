import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#172033',
    background: '#F5F7FB',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EAF6FA',
    textSecondary: '#667085',
    card: '#FFFFFF',
    cyan: '#00AFCB',
    green: '#65B82E',
    border: '#E3E8F0',
    secondary: '#667085',
  },
  dark: {
    text: '#FFFFFF',
    background: '#0B1020',
    backgroundElement: '#192235',
    backgroundSelected: '#253047',
    textSecondary: '#AAB4C8',
    card: '#192235',
    cyan: '#00C5E8',
    green: '#8AF52E',
    border: 'rgba(255,255,255,0.08)',
    secondary: '#AAB4C8',
  },
} as const;

export type ThemeColor = keyof (typeof Colors)['light'] & keyof (typeof Colors)['dark'];

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;