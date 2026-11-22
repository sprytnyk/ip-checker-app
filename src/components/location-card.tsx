import type { ComponentType } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button, Card, CardHeading, copy, GradientText, Tag } from '@/components/card';
import {
  AlertIcon,
  CopyIcon,
  FlagIcon,
  type IconProps,
  MapPinIcon,
  ServerIcon,
} from '@/components/icons';
import { Fonts, Spacing, themedStyles, useColors } from '@/constants/theme';
import type { Addresses } from '@/hooks/use-my-ip';
import type { IpVersion, Location } from '@/lib/api';

const CHECKING = 'Checking…';

/**
 * The site's main card: the address as the headline, the other protocol's address under it,
 * then country, city and organisation.
 */
function Hero({
  title,
  version,
  ip,
  other,
  location,
}: {
  title: string;
  version: IpVersion;
  /** undefined while loading. */
  ip?: string;
  /** The address on the other protocol; omitted for a looked-up address. */
  other?: { version: IpVersion; address: string | null | undefined };
  location?: Location;
}) {
  const styles = useStyles();
  const colors = useColors();

  return (
    <Card style={styles.hero}>
      <View style={styles.top}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        <Tag text={`IPv${version}`} />
        {ip !== undefined && (
          <Pressable
            onPress={() => copy(ip)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={`Copy ${ip}`}
            style={styles.copy}>
            <CopyIcon color={colors.muted} size={17} />
          </Pressable>
        )}
      </View>

      <Pressable
        onPress={ip === undefined ? undefined : () => copy(ip)}
        disabled={ip === undefined}
        accessibilityHint="Copies the address">
        {ip === undefined ? (
          <Text style={[styles.ip, styles.ipMuted]}>{CHECKING}</Text>
        ) : (
          <GradientText text={ip} style={[styles.ip, version === 6 && styles.ipV6]} />
        )}
      </Pressable>

      {other !== undefined && (
        <View style={styles.other}>
          <Tag text={`IPv${other.version}`} />
          {typeof other.address === 'string' ? (
            <Pressable
              onPress={() => copy(other.address as string)}
              accessibilityRole="button"
              accessibilityHint="Copies the address"
              style={styles.otherPress}>
              <Text style={styles.otherIp}>{other.address}</Text>
            </Pressable>
          ) : (
            <Text style={[styles.otherIp, styles.muted]}>
              {other.address === null ? 'Not detected' : CHECKING}
            </Text>
          )}
        </View>
      )}

      <View style={styles.facts}>
        <Fact
          icon={FlagIcon}
          label="Country"
          value={location && `${location.country} (${location.iso_code})`}
        />
        <Fact icon={MapPinIcon} label="City" value={location?.city} />
        <Fact icon={ServerIcon} label="Organisation" value={location?.org} />
      </View>
    </Card>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<IconProps>;
  label: string;
  value?: string;
}) {
  const styles = useStyles();
  const colors = useColors();
  return (
    <View style={styles.fact}>
      <View style={styles.factLabel}>
        <Icon color={colors.icon} size={15} />
        <Text style={styles.factLabelText}>{label}</Text>
      </View>
      <Text style={[styles.factValue, value === undefined && styles.muted]} selectable>
        {value ?? CHECKING}
      </Text>
    </View>
  );
}

/** The caller's own details. Missing data shows as "Checking…". */
export function MyIpCard({ location, addresses }: { location?: Location; addresses?: Addresses }) {
  const version = location?.version ?? 4;
  const other: IpVersion = version === 4 ? 6 : 4;
  return (
    <Hero
      title="Your IP address"
      version={version}
      ip={location?.ip}
      other={{ version: other, address: addresses?.[other] }}
      location={location}
    />
  );
}

/** A looked-up address has one protocol, so it gets no second address line. */
export function LookupCard({ query, location }: { query: string; location?: Location }) {
  const version: IpVersion = location?.version ?? (query.includes(':') ? 6 : 4);
  return (
    <Hero
      title="Looked-up address"
      version={version}
      ip={location?.ip ?? query}
      location={location}
    />
  );
}

export function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card>
      <CardHeading icon={AlertIcon} title="Something went wrong" note={message} bad />
      <Button title="Try again" onPress={onRetry} />
    </Card>
  );
}

const useStyles = themedStyles((c) => ({
  hero: {
    paddingHorizontal: Spacing.five,
    paddingTop: 22,
    paddingBottom: 0,
    overflow: 'hidden',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: c.muted,
  },
  copy: {
    marginLeft: 'auto',
  },
  ip: {
    marginTop: 10,
    fontSize: 44,
    lineHeight: 48,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1.6,
  },
  // IPv6 addresses are up to 39 characters long.
  ipV6: {
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.8,
  },
  ipMuted: {
    color: c.muted,
  },
  other: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  otherPress: {
    flexShrink: 1,
  },
  otherIp: {
    flexShrink: 1,
    fontFamily: Fonts.mono,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
    color: c.strong,
  },
  muted: {
    color: c.muted,
    fontWeight: '500',
  },
  facts: {
    marginTop: Spacing.five,
    marginHorizontal: -Spacing.five,
  },
  fact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: Spacing.four,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: c.line,
  },
  factLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    alignSelf: 'center',
  },
  factLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: c.muted,
  },
  factValue: {
    flexShrink: 1,
    textAlign: 'right',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
    color: c.strong,
  },
}));
