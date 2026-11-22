import Storage from 'expo-sqlite/kv-store';
import { Appearance } from 'react-native';

import { type Scheme, useScheme } from '@/constants/theme';

const STORAGE_KEY = 'theme';

/**
 * Applies the theme the user picked last time, if any. Without one the app follows the
 * system setting, like the site follows the browser's.
 */
export function applySavedTheme() {
  const saved = Storage.getItemSync(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') Appearance.setColorScheme(saved);
}

/** The light/dark switch in the top bar. */
export function useThemeToggle() {
  const scheme = useScheme();

  function toggle() {
    const next: Scheme = scheme === 'dark' ? 'light' : 'dark';
    Appearance.setColorScheme(next);
    Storage.setItemSync(STORAGE_KEY, next);
  }

  return { scheme, toggle };
}
