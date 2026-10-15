import * as Clipboard from 'expo-clipboard';
import type { ComponentType, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { CopyIcon } from '@/components/icons';
import {
  type Accent,
  Accents,
  CardShadow,
  Colors,
  Radius,
  Spacing,
  type Tone,
  Tones,
} from '@/constants/theme';

/**
 * The site's `.card`, with an optional `.card-title` and `.card-note` above the rows;
 * children fade in like its `.animate-fade-in` list.
 */
export function InfoCard({
  title,
  note,
  children,
}: {
  title?: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.card}>
      {title !== undefined && (
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
      )}
      {note !== undefined && <Text style={styles.note}>{note}</Text>}
      <Animated.View style={[styles.list, fadeIn]}>{children}</Animated.View>
    </View>
  );
}

type InfoRowProps = {
  icon: ComponentType<{ color: string }>;
  accent: Accent;
  label: string;
  /** A pill after the label, like the site's `.badge`. */
  badge?: { text: string; tone: Tone };
  value: string;
  /** A smaller line under the value, like the site's `.row-detail`. */
  detail?: string;
  muted?: boolean;
  /** Tapping the row copies the value. */
  copyable?: boolean;
};

export function InfoRow({
  icon: Icon,
  accent,
  label,
  badge,
  value,
  detail,
  muted,
  copyable,
}: InfoRowProps) {
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
        <View style={styles.rowLabelLine}>
          <Text style={styles.rowLabel}>{label}</Text>
          {/* The pill is a View: padding and clipping on an Android Text can cut its glyphs. */}
          {badge !== undefined && (
            <View style={[styles.badge, { backgroundColor: Tones[badge.tone].badge }]}>
              <Text style={[styles.badgeText, { color: Tones[badge.tone].text }]} numberOfLines={1}>
                {badge.text}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.rowValue, muted && styles.muted]} selectable={!copyable}>
          {value}
        </Text>
        {detail !== undefined && <Text style={styles.rowDetail}>{detail}</Text>}
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
  title: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: Spacing.two,
  },
  note: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.slate400,
    marginBottom: 24,
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
  rowLabelLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  rowLabel: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
    color: Colors.slate400,
  },
  badge: {
    flexShrink: 0,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  rowValue: {
    fontSize: 17.6,
    lineHeight: 26,
    fontWeight: '600',
    color: Colors.white,
  },
  rowDetail: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.slate300,
    marginTop: Spacing.one,
  },
  muted: {
    color: Colors.slate400,
  },
  copyHint: {
    alignSelf: 'center',
  },
});
