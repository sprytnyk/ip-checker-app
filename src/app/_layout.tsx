import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Palettes, useScheme } from '@/constants/theme';
import { applySavedTheme } from '@/hooks/use-theme-preference';

// Before the first render, so a saved theme doesn't flash the other one.
applySavedTheme();

const themes = {
  light: {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, background: Palettes.light.bg, card: Palettes.light.bg },
  },
  dark: {
    ...DarkTheme,
    colors: { ...DarkTheme.colors, background: Palettes.dark.bg, card: Palettes.dark.bg },
  },
};

export default function RootLayout() {
  const scheme = useScheme();
  return (
    <ThemeProvider value={themes[scheme]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
