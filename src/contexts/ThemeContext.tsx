import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';
type ThemeMode = 'dark' | 'light';

type ThemePreference = 'dark' | 'light' | 'system';

type ThemeContextType = {
  preference: ThemePreference;
  mode: ThemeMode;
  colors: typeof Colors.dark;
  setPreference: (pref: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useRNColorScheme();
  const [preference, setPrefState] = useState<ThemePreference>('system');
  const [loaded, setLoaded] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('theme_pref');
        if (saved === 'dark' || saved === 'light' || saved === 'system') {
          setPrefState(saved);
        }
      } catch {}
      setLoaded(true);
    })();
  }, []);

  // Resolve mode from preference + system
  const mode: ThemeMode = preference === 'system'
    ? (system === 'light' ? 'light' : 'dark')
    : preference;

  // Persist when changed (after initial load)
  useEffect(() => {
    if (loaded) {
      if (preference === 'system') {
        AsyncStorage.removeItem('theme_pref').catch(() => {});
      } else {
        AsyncStorage.setItem('theme_pref', preference).catch(() => {});
      }
    }
  }, [preference, loaded]);

  const setPreference = (pref: ThemePreference) => {
    setPrefState(pref);
  };

  return (
    <ThemeContext.Provider value={{ preference, mode, colors: (Colors as any)[mode], setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used within ThemeProvider');
  return ctx;
}