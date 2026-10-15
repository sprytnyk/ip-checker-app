import { StyleSheet, Text, View } from 'react-native';

import { ServerIcon } from '@/components/icons';
import { InfoCard, InfoRow } from '@/components/info-card';
import { Colors, Radius, Spacing, type Tone, Tones } from '@/constants/theme';
import type { ResolversState } from '@/hooks/use-my-ip';
import type { DnsLeakResult, DnsResolver } from '@/lib/api';

const NOTE =
  'The servers that look up domain names for you, compared with the network your IP ' +
  'address belongs to.';

/**
 * The site's "DNS resolvers" card: a verdict on whether DNS leaks, then one row per resolver
 * with a network badge, or a single muted message.
 */
export function DnsLeakCard({ state }: { state: ResolversState }) {
  return (
    <InfoCard key={state.status} title="DNS resolvers" note={NOTE}>
      {state.status === 'loading' && <Message text="Checking…" />}
      {state.status === 'error' && <Message text={state.message} />}
      {state.status === 'ready' && <Results result={state.result} />}
    </InfoCard>
  );
}

function Results({ result: { leak, resolvers } }: { result: DnsLeakResult }) {
  if (resolvers.length === 0) return <Message text="No resolvers detected" />;
  return (
    <>
      <Verdict leak={leak} resolvers={resolvers} />
      {resolvers.map((resolver) => (
        <InfoRow
          key={resolver.ip}
          icon={ServerIcon}
          accent="blue"
          label={`IPv${resolver.version}`}
          badge={networkBadge(resolver)}
          value={resolver.ip}
          detail={`${resolver.city}, ${resolver.country} (${resolver.iso_code}) · ${resolver.org}`}
          copyable
        />
      ))}
    </>
  );
}

function networkBadge({ same_network }: DnsResolver) {
  if (same_network === true) return { text: 'Your network', tone: 'ok' } as const;
  if (same_network === false) return { text: 'Other network', tone: 'leak' } as const;
  return undefined;
}

/** The site's verdict banner, word for word. */
function Verdict({ leak, resolvers }: DnsLeakResult) {
  let tone: Tone;
  let title: string;
  let text: string;
  if (leak === true) {
    const outside = resolvers.filter((resolver) => resolver.same_network === false);
    const orgs = [...new Set(outside.map((resolver) => resolver.org))].join(', ');
    tone = 'leak';
    title = 'Possible DNS leak';
    text =
      `Resolvers on a different network than your IP address: ${outside.length} of ` +
      `${resolvers.length} (${orgs}). If you use a VPN and these aren't your VPN's or a DNS ` +
      'provider you chose, your DNS queries bypass the VPN, and whoever runs them can see ' +
      'the sites you visit.';
  } else if (leak === false) {
    tone = 'ok';
    title = 'No DNS leak detected';
    text =
      'All resolvers belong to the same network as your IP address, so your DNS queries ' +
      'take the same route as the rest of your traffic.';
  } else {
    tone = 'unknown';
    title = "Can't tell whether DNS leaks";
    text = "Some addresses aren't in the GeoIP database, so their networks can't be compared.";
  }

  const colors = Tones[tone];
  return (
    <View
      style={[styles.verdict, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.verdictTitle, { color: colors.text }]} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.verdictText}>{text}</Text>
    </View>
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
  verdict: {
    padding: Spacing.four,
    borderRadius: Radius.row,
    borderWidth: 1,
  },
  verdictTitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    marginBottom: Spacing.one,
  },
  verdictText: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.slate300,
  },
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
