import { useColorScheme as useRNColorScheme } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useColorScheme() {
  const system = useRNColorScheme();
  const [pref, setPref] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('theme_pref')
      .then((v) => { setPref(v); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded) return system;
  if (pref === 'dark') return 'dark';
  if (pref === 'light') return 'light';
  return system;
}

export async function setThemePreference(pref: 'dark' | 'light' | 'system') {
  if (pref === 'system') {
    await AsyncStorage.removeItem('theme_pref');
  } else {
    await AsyncStorage.setItem('theme_pref', pref);
  }
}