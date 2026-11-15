import { useThemeContext } from '@/contexts/ThemeContext';

export function useTheme() {
  return useThemeContext().colors;
}

export function useThemeMode() {
  return useThemeContext();
}