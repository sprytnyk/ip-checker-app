import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Colors } from '@/constants/theme';

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: Colors.slate900, card: Colors.slate800 },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={theme}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
