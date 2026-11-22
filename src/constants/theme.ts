/**
 * Colors and sizes mirror static/style.css of https://ip.sprytnyk.dev: a soft blue glow and a
 * faint dot grid behind the page, see-through cards, blue and slate, in light and dark.
 */

import { StyleSheet, useColorScheme } from 'react-native';

const light = {
  bg: '#f8fafc',
  glow: '#2563eb1f',
  dots: '#0f172a14',
  ink: '#1e293b',
  strong: '#020617',
  muted: '#64748b',
  label: '#334155',
  line: '#0f172a14',
  lineStrong: '#0f172a24',
  card: '#ffffffcc',
  item: '#f8fafccc',
  highlight: 'inset 0 1px 0 #ffffffe6',
  shadow: '0 1px 2px #0f172a0a, 0 12px 32px -16px #0f172a29',
  accent: '#2563eb',
  accentTop: '#3b82f6',
  accentGlow: '#2563eb73',
  soft: '#2563eb14',
  softLine: '#2563eb2e',
  icon: '#2563eb',
  link: '#2563eb',
  header: '#f8fafcb3',
  pressed: '#f1f5f9',
  /** The title's fade: `--title` on the site. */
  titleFrom: '#020617',
  titleTo: '#2563eb',
  ok: '#047857',
  okBg: '#ecfdf5cc',
  okLine: '#a7f3d0',
  bad: '#be123c',
  badBg: '#fff1f2cc',
  badLine: '#fecdd3',
};

export type Palette = typeof light;

const dark: Palette = {
  ...light,
  bg: '#020617',
  glow: '#3b82f62e',
  dots: '#94a3b81a',
  ink: '#cbd5e1',
  strong: '#f8fafc',
  muted: '#94a3b8',
  label: '#cbd5e1',
  line: '#94a3b81f',
  lineStrong: '#94a3b838',
  card: '#0f172a99',
  item: '#1e293b66',
  highlight: 'inset 0 1px 0 #ffffff0a',
  shadow: '0 12px 40px -16px #000000cc',
  accentGlow: '#3b82f666',
  soft: '#3b82f61f',
  softLine: '#60a5fa40',
  icon: '#93c5fd',
  link: '#93c5fd',
  header: '#020617a6',
  pressed: '#334155b3',
  titleFrom: '#f8fafc',
  titleTo: '#93c5fd',
  ok: '#34d399',
  okBg: '#10b9811a',
  okLine: '#10b98166',
  bad: '#fb7185',
  badBg: '#f43f5e1a',
  badLine: '#f43f5e66',
};

export const Palettes = { light, dark } as const;

export type Scheme = keyof typeof Palettes;

export function useScheme(): Scheme {
  return useColorScheme() === 'dark' ? 'dark' : 'light';
}

export function useColors(): Palette {
  return Palettes[useScheme()];
}

/**
 * Builds a style sheet for each scheme once, and returns a hook that picks the current one.
 * Used as `const useStyles = themedStyles((c) => ({ ... }))`.
 */
export function themedStyles<T extends StyleSheet.NamedStyles<T>>(make: (colors: Palette) => T) {
  const sheets = {
    light: StyleSheet.create(make(light)),
    dark: StyleSheet.create(make(dark)),
  };
  return function useStyles() {
    return sheets[useScheme()];
  };
}

/** The blue tile behind the logo and the gradient on buttons. */
export const AccentGradient = 'linear-gradient(140deg, #3b82f6, #1d4ed8)';

export const Fonts = {
  mono: 'monospace',
} as const;

export const Spacing = {
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  seven: 32,
} as const;

export const Radius = {
  tag: 999,
  icon: 10,
  button: 11,
  item: 14,
  card: 18,
} as const;
