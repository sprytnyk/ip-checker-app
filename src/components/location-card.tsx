import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AlertIcon, BuildingIcon, FlagIcon, HashIcon, MapPinIcon } from '@/components/icons';
import { InfoCard, InfoRow } from '@/components/info-card';
import { Accents, Colors, Radius, Spacing } from '@/constants/theme';
import type { Addresses } from '@/hooks/use-my-ip';
import type { IpVersion, Location } from '@/lib/api';

const CHECKING = 'Checking…';

function AddressRow({
  version,
  address,
}: {
  version: IpVersion;
  address: string | null | undefined;
}) {
  const accent = version === 4 ? 'blue' : 'purple';
  const label = `IPv${version}`;
  if (address === undefined)
    return <InfoRow icon={HashIcon} accent={accent} label={label} value={CHECKING} muted />;
  if (address === null)
    return <InfoRow icon={HashIcon} accent={accent} label={label} value="Not detected" muted />;
  return <InfoRow icon={HashIcon} accent={accent} label={label} value={address} copyable />;
}

function DetailRows({ location }: { location?: Location }) {
  return (
    <>
      <InfoRow
        icon={FlagIcon}
        accent="emerald"
        label="Country"
        value={location ? `${location.country} (${location.iso_code})` : CHECKING}
        muted={!location}
      />
      <InfoRow
        icon={MapPinIcon}
        accent="amber"
        label="City"
        value={location?.city ?? CHECKING}
        muted={!location}
      />
      <InfoRow
        icon={BuildingIcon}
        accent="rose"
        label="Organisation"
        value={location?.org ?? CHECKING}
        muted={!location}
      />
    </>
  );
}

/** The caller's own details: both protocols, then location. Missing data shows as "Checking…". */
export function MyIpCard({ location, addresses }: { location?: Location; addresses?: Addresses }) {
  return (
    <InfoCard>
      <AddressRow version={4} address={addresses?.[4]} />
      <AddressRow version={6} address={addresses?.[6]} />
      <DetailRows location={location} />
    </InfoCard>
  );
}

/** A looked-up address has one protocol, so it gets one address row. */
export function LookupCard({ query, location }: { query: string; location?: Location }) {
  const version: IpVersion = location?.version ?? (query.includes(':') ? 6 : 4);
  return (
    <InfoCard>
      <InfoRow
        icon={HashIcon}
        accent={version === 4 ? 'blue' : 'purple'}
        label={`IPv${version}`}
        value={location?.ip ?? query}
        copyable={location !== undefined}
      />
      <DetailRows location={location} />
    </InfoCard>
  );
}

export function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <InfoCard>
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: Accents.rose.tile }]}>
          <AlertIcon color={Accents.rose.icon} />
        </View>
        <View style={styles.content}>
          <Text style={styles.label}>Something went wrong</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        style={({ pressed }) => [styles.retry, pressed && styles.retryPressed]}>
        <Text style={styles.retryText}>Try again</Text>
      </Pressable>
    </InfoCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.four,
    padding: Spacing.four,
    backgroundColor: Colors.rowBackground,
    borderRadius: Radius.row,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: Radius.icon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
    color: Colors.slate400,
    marginBottom: Spacing.one,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: Colors.white,
  },
  retry: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
    backgroundColor: Colors.blue600,
    borderRadius: Radius.row,
  },
  retryPressed: {
    opacity: 0.7,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
