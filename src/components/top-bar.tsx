import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PillButton } from '@/components/card';
import { GlobeIcon, MoonIcon, SunIcon } from '@/components/icons';
import { AccentGradient, Spacing, themedStyles, useColors } from '@/constants/theme';
import { useThemeToggle } from '@/hooks/use-theme-preference';

export const TOP_BAR_HEIGHT = 58;

/** The site's sticky header: the logo and name, and the light/dark switch. */
export function TopBar() {
  const styles = useStyles();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { scheme, toggle } = useThemeToggle();
  const label = scheme === 'dark' ? 'Switch to the light theme' : 'Switch to the dark theme';

  return (
    <View style={[styles.bar, { paddingTop: insets.top, height: insets.top + TOP_BAR_HEIGHT }]}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <GlobeIcon color="#ffffff" strokeWidth={2} />
        </View>
        <Text style={styles.name} accessibilityRole="header">
          What&apos;s My IP
        </Text>
      </View>
      <PillButton onPress={toggle} accessibilityLabel={label}>
        {scheme === 'dark' ? <SunIcon color={colors.label} /> : <MoonIcon color={colors.label} />}
      </PillButton>
    </View>
  );
}

const useStyles = themedStyles((c) => ({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    // Solid, not see-through like the site: without a blur, text scrolling under it shows.
    backgroundColor: c.bg,
    borderBottomWidth: 1,
    borderBottomColor: c.line,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    experimental_backgroundImage: AccentGradient,
    boxShadow: `0 6px 16px -4px ${c.accentGlow}, inset 0 1px 0 #ffffff40`,
  },
  name: {
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.6,
    color: c.strong,
  },
}));
