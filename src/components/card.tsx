import * as Clipboard from 'expo-clipboard';
import type { ComponentType, ReactNode } from 'react';
import {
  Pressable,
  type StyleProp,
  Text,
  type TextStyle,
  ToastAndroid,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, { cubicBezier } from 'react-native-reanimated';

import type { IconProps } from '@/components/icons';
import { AccentGradient, Fonts, Radius, Spacing, themedStyles, useColors } from '@/constants/theme';

export async function copy(value: string) {
  await Clipboard.setStringAsync(value);
  ToastAndroid.show(`Copied ${value}`, ToastAndroid.SHORT);
}

/** The site's `.card`: see-through, with a hairline border, rising in as it appears. */
export function Card({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode;
  /** Staggers cards that appear together, like the site's `nth-child` delays. */
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useStyles();
  return (
    <Animated.View style={[styles.card, rise, { animationDelay: `${delay}ms` }, style]}>
      {children}
    </Animated.View>
  );
}

/** The site's `.card-heading`: a tinted icon tile, a title and a muted line under it. */
export function CardHeading({
  icon: Icon,
  title,
  note,
  bad,
  action,
}: {
  icon: ComponentType<IconProps>;
  title: string;
  note?: string;
  /** Rose instead of blue, for errors. */
  bad?: boolean;
  /** A control on the right, like "Clear all". */
  action?: ReactNode;
}) {
  const styles = useStyles();
  const colors = useColors();
  return (
    <View style={styles.heading}>
      <View style={[styles.sectionIcon, bad && styles.sectionIconBad]}>
        <Icon color={bad ? colors.bad : colors.icon} />
      </View>
      <View style={styles.headingText}>
        <Text style={styles.headingTitle} accessibilityRole="header">
          {title}
        </Text>
        {note !== undefined && <Text style={styles.headingNote}>{note}</Text>}
      </View>
      {action}
    </View>
  );
}

/** The site's `.tag`: a small outlined pill in monospace, like "IPv4". */
export function Tag({ text }: { text: string }) {
  const styles = useStyles();
  // The pill is a View: padding and clipping on an Android Text can cut its glyphs.
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{text}</Text>
    </View>
  );
}

export type Tone = 'ok' | 'leak' | 'unknown';

/** The site's `.badge`: green for your network, rose for another one. */
export function Badge({ text, tone }: { text: string; tone: 'ok' | 'leak' }) {
  const styles = useStyles();
  return (
    <View style={[styles.badge, tone === 'ok' ? styles.okBox : styles.leakBox]}>
      <Text style={[styles.badgeText, tone === 'ok' ? styles.okText : styles.leakText]}>
        {text}
      </Text>
    </View>
  );
}

/** The site's `.verdict`: a tinted banner with a bold first line. */
export function Verdict({ tone, title, text }: { tone: Tone; title: string; text: string }) {
  const styles = useStyles();
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.verdict, tone === 'ok' && styles.okBox, tone === 'leak' && styles.leakBox]}>
      <Text
        style={[
          styles.verdictTitle,
          tone === 'ok' && styles.okText,
          tone === 'leak' && styles.leakText,
        ]}
        accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.verdictText}>{text}</Text>
    </View>
  );
}

/** The site's `.item`: a row inside a card. Pressable when given `onPress`. */
export function Item({
  children,
  onPress,
  accessibilityHint,
  style,
}: {
  children: ReactNode;
  onPress?: () => void;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      disabled={onPress === undefined}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed, style]}>
      {children}
    </Pressable>
  );
}

/** The site's `.button`: a blue gradient with a soft glow. */
export function Button({
  title,
  onPress,
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        (pressed || disabled) && styles.buttonPressed,
        style,
      ]}>
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}

/** A small outlined control, the site's `.pill-link` and `.icon-button`. */
export function PillButton({
  children,
  onPress,
  accessibilityLabel,
  style,
}: {
  children: ReactNode;
  onPress: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
      style={({ pressed }) => [styles.pill, pressed && styles.pillPressed, style]}>
      {children}
    </Pressable>
  );
}

/**
 * Text that fades from the strong color into blue, like the site's headline. React Native
 * can't clip a gradient to text, so each character gets its own shade instead.
 */
export function GradientText({ text, style }: { text: string; style?: StyleProp<TextStyle> }) {
  const { titleFrom, titleTo } = useColors();
  const chars = [...text];
  return (
    <Text style={style}>
      {chars.map((char, index) => {
        // Solid for the first 35%, then into blue, as in `linear-gradient(100deg, a 35%, b)`.
        const position = chars.length > 1 ? index / (chars.length - 1) : 0;
        const amount = Math.max(0, (position - 0.35) / 0.65);
        return (
          <Text key={index} style={{ color: mix(titleFrom, titleTo, amount) }}>
            {char}
          </Text>
        );
      })}
    </Text>
  );
}

function mix(from: string, to: string, amount: number) {
  const a = parseInt(from.slice(1, 7), 16);
  const b = parseInt(to.slice(1, 7), 16);
  const channel = (shift: number) => {
    const x = (a >> shift) & 0xff;
    const y = (b >> shift) & 0xff;
    return Math.round(x + (y - x) * amount);
  };
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}

// Reanimated CSS animation, same as the site's `rise` keyframes.
const rise = {
  animationName: {
    from: { opacity: 0, transform: [{ translateY: 8 }] },
    to: { opacity: 1, transform: [{ translateY: 0 }] },
  },
  animationDuration: '500ms',
  animationTimingFunction: cubicBezier(0.2, 0.7, 0.2, 1),
  animationFillMode: 'both',
} as const;

const useStyles = themedStyles((c) => ({
  card: {
    padding: Spacing.five - 2,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: Radius.card,
    boxShadow: `${c.highlight}, ${c.shadow}`,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: Radius.icon,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.soft,
    borderWidth: 1,
    borderColor: c.softLine,
  },
  sectionIconBad: {
    backgroundColor: c.badBg,
    borderColor: c.badLine,
  },
  headingText: {
    flex: 1,
    minWidth: 0,
  },
  headingTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: -0.2,
    color: c.strong,
  },
  headingNote: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 19,
    color: c.muted,
  },
  tag: {
    flexShrink: 0,
    minWidth: 46,
    paddingHorizontal: Spacing.two,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: c.lineStrong,
    borderRadius: Radius.tag,
    alignItems: 'center',
  },
  tagText: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '600',
    color: c.muted,
  },
  badge: {
    flexShrink: 0,
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderWidth: 1,
    borderRadius: Radius.tag,
  },
  badgeText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
  },
  okBox: {
    backgroundColor: c.okBg,
    borderColor: c.okLine,
  },
  okText: {
    color: c.ok,
  },
  leakBox: {
    backgroundColor: c.badBg,
    borderColor: c.badLine,
  },
  leakText: {
    color: c.bad,
  },
  verdict: {
    paddingHorizontal: 15,
    paddingVertical: Spacing.three,
    borderWidth: 1,
    borderColor: c.lineStrong,
    borderRadius: Radius.item,
    backgroundColor: c.item,
  },
  verdictTitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    color: c.strong,
  },
  verdictText: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 19,
    color: c.label,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: Spacing.three,
    backgroundColor: c.item,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: Radius.item,
  },
  itemPressed: {
    borderColor: c.lineStrong,
    backgroundColor: c.pressed,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
    borderRadius: Radius.icon,
    experimental_backgroundImage: AccentGradient,
    boxShadow: `0 1px 2px #0f172a26, 0 4px 12px -4px ${c.accentGlow}, inset 0 1px 0 #ffffff33`,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  pill: {
    minWidth: 34,
    height: 34,
    paddingHorizontal: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: Radius.button,
    backgroundColor: c.card,
    boxShadow: c.highlight,
  },
  pillPressed: {
    backgroundColor: c.pressed,
  },
}));
