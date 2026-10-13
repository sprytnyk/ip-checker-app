import * as Clipboard from 'expo-clipboard';
import type { ComponentType, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { CopyIcon } from '@/components/icons';
import { type Accent, Accents, CardShadow, Colors, Radius, Spacing } from '@/constants/theme';

/** The site's `.card`; children fade in like its `.animate-fade-in` list. */
export function InfoCard({ children }: { children: ReactNode }) {
  return (
    <View style={styles.card}>
      <Animated.View style={[styles.list, fadeIn]}>{children}</Animated.View>
    </View>
  );
}

type InfoRowProps = {
  icon: ComponentType<{ color: string }>;
  accent: Accent;
  label: string;
  value: string;
  muted?: boolean;
  /** Tapping the row copies the value. */
  copyable?: boolean;
};

export function InfoRow({ icon: Icon, accent, label, value, muted, copyable }: InfoRowProps) {
  const colors = Accents[accent];

  async function copy() {
    await Clipboard.setStringAsync(value);
    ToastAndroid.show(`Copied ${value}`, ToastAndroid.SHORT);
  }

  return (
    <Pressable
      onPress={copyable ? copy : undefined}
      disabled={!copyable}
      accessibilityRole={copyable ? 'button' : undefined}
      accessibilityHint={copyable ? 'Copies the address' : undefined}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <View style={[styles.rowIcon, { backgroundColor: colors.tile }]}>
        <Icon color={colors.icon} />
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={[styles.rowValue, muted && styles.muted]} selectable={!copyable}>
          {value}
        </Text>
      </View>
      {copyable && (
        <View style={styles.copyHint}>
          <CopyIcon color={Colors.slate500} size={18} />
        </View>
      )}
    </Pressable>
  );
}

// Reanimated CSS animation, same keyframes as the site's `fade-in`.
const fadeIn = {
  animationName: {
    from: { opacity: 0, transform: [{ translateY: 10 }] },
    to: { opacity: 1, transform: [{ translateY: 0 }] },
  },
  animationDuration: '500ms',
  animationTimingFunction: 'ease-out',
} as const;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.slate800,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.slate700,
    boxShadow: CardShadow,
    padding: Spacing.five,
  },
  list: {
    gap: Spacing.four,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.four,
    padding: Spacing.four,
    backgroundColor: Colors.rowBackground,
    borderRadius: Radius.row,
  },
  rowPressed: {
    backgroundColor: Colors.slate700,
  },
  rowIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.icon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: {
    flex: 1,
    minWidth: 0,
  },
  rowLabel: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
    color: Colors.slate400,
    marginBottom: Spacing.one,
  },
  rowValue: {
    fontSize: 17.6,
    lineHeight: 26,
    fontWeight: '600',
    color: Colors.white,
  },
  muted: {
    color: Colors.slate400,
  },
  copyHint: {
    alignSelf: 'center',
  },
});
