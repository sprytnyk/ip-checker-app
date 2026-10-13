/**
 * Colors and sizes mirror the CSS of https://ip.sprytnyk.dev (templates/index.html),
 * which uses the Tailwind slate palette. The site is dark only, and so is the app.
 */

export const Colors = {
  slate900: '#0f172a',
  slate800: '#1e293b',
  slate700: '#334155',
  rowBackground: 'rgba(51, 65, 85, 0.5)',
  slate500: '#64748b',
  slate400: '#94a3b8',
  slate200: '#e2e8f0',
  white: '#ffffff',
  blue600: '#2563eb',
  link: '#60a5fa',
  linkPressed: '#93c5fd',
  error: '#fb7185',
} as const;

/** Icon tile colors: a 20% tint behind a lighter stroke, as in `.row-icon.*`. */
export const Accents = {
  blue: { tile: 'rgba(59, 130, 246, 0.2)', icon: '#60a5fa' },
  emerald: { tile: 'rgba(16, 185, 129, 0.2)', icon: '#34d399' },
  purple: { tile: 'rgba(139, 92, 246, 0.2)', icon: '#a78bfa' },
  amber: { tile: 'rgba(245, 158, 11, 0.2)', icon: '#fbbf24' },
  rose: { tile: 'rgba(244, 63, 94, 0.2)', icon: '#fb7185' },
} as const;

export type Accent = keyof typeof Accents;

export const PageGradient = `linear-gradient(to bottom right, ${Colors.slate900}, ${Colors.slate800}, ${Colors.slate900})`;

export const CardShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';

export const Spacing = {
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 32,
  seven: 48,
} as const;

export const Radius = {
  icon: 8,
  row: 12,
  card: 24,
} as const;
