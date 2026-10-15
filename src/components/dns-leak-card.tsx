import { StyleSheet, Text, View } from 'react-native';

import { ServerIcon } from '@/components/icons';
import { InfoCard, InfoRow } from '@/components/info-card';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { ResolversState } from '@/hooks/use-my-ip';

const NOTE =
  'The servers that look up domain names for you. If you use a VPN and one of these ' +
  'belongs to your ISP rather than the VPN provider, your DNS queries are leaking.';

/** The site's "DNS resolvers" card: one row per resolver, or a single muted message. */
export function DnsLeakCard({ state }: { state: ResolversState }) {
  return (
    <InfoCard key={state.status} title="DNS resolvers" note={NOTE}>
      {state.status === 'loading' && <Message text="Checking…" />}
      {state.status === 'error' && <Message text={state.message} />}
      {state.status === 'ready' && state.resolvers.length === 0 && (
        <Message text="No resolvers detected" />
      )}
      {state.status === 'ready' &&
        state.resolvers.map((resolver) => (
          <InfoRow
            key={resolver.ip}
            icon={ServerIcon}
            accent="blue"
            label={`IPv${resolver.version}`}
            value={resolver.ip}
            detail={`${resolver.city}, ${resolver.country} (${resolver.iso_code}) · ${resolver.org}`}
            copyable
          />
        ))}
    </InfoCard>
  );
}

function Message({ text }: { text: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    padding: Spacing.four,
    backgroundColor: Colors.rowBackground,
    borderRadius: Radius.row,
  },
  text: {
    fontSize: 17.6,
    lineHeight: 26,
    fontWeight: '600',
    color: Colors.slate400,
  },
});
