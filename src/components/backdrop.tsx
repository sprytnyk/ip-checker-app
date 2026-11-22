import { StyleSheet, View } from 'react-native';

import { themedStyles } from '@/constants/theme';

/**
 * The site's page background: a faint dot grid that fades out down the page, under a soft
 * blue glow at the top. It stays put while the page scrolls.
 */
export function Backdrop() {
  const styles = useStyles();
  return (
    <View style={[StyleSheet.absoluteFill, styles.base]} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, styles.dots]} />
      <View style={[StyleSheet.absoluteFill, styles.fade]} />
      <View style={[StyleSheet.absoluteFill, styles.glow]} />
    </View>
  );
}

const useStyles = themedStyles((c) => ({
  base: {
    backgroundColor: c.bg,
  },
  dots: {
    experimental_backgroundImage: `radial-gradient(circle, ${c.dots} 1px, transparent 1px)`,
    experimental_backgroundSize: '22px 22px',
    experimental_backgroundRepeat: 'repeat',
  },
  // React Native has no CSS masks, so the page color covers the dots away from the top.
  fade: {
    experimental_backgroundImage: `radial-gradient(ellipse 120% 55% at 50% 0%, transparent, ${c.bg})`,
  },
  glow: {
    experimental_backgroundImage: `radial-gradient(ellipse 180% 45% at 50% 0%, ${c.glow}, transparent 70%)`,
  },
}));
