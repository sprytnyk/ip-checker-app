import { Text, View } from 'react-native';

import { Badge, Card, CardHeading, copy, Item, Tag, type Tone, Verdict } from '@/components/card';
import { ResolversIcon } from '@/components/icons';
import { Fonts, Spacing, themedStyles } from '@/constants/theme';
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
    <Card key={state.status} delay={50}>
      <CardHeading icon={ResolversIcon} title="DNS resolvers" note={NOTE} />
      {state.status === 'loading' && <Message text="Checking…" />}
      {state.status === 'error' && <Message text={state.message} />}
      {state.status === 'ready' && <Results result={state.result} />}
    </Card>
  );
}

function Results({ result: { leak, resolvers } }: { result: DnsLeakResult }) {
  const styles = useStyles();
  if (resolvers.length === 0) return <Message text="No resolvers detected" />;
  return (
    <View style={styles.items}>
      <VerdictBanner leak={leak} resolvers={resolvers} />
      {resolvers.map((resolver) => (
        <Resolver key={resolver.ip} resolver={resolver} />
      ))}
    </View>
  );
}

/** Tag and address on one line, the location under them, then the badge. */
function Resolver({ resolver }: { resolver: DnsResolver }) {
  const styles = useStyles();
  const badge = networkBadge(resolver);
  return (
    <Item
      onPress={() => copy(resolver.ip)}
      accessibilityHint="Copies the address"
      style={styles.resolver}>
      <Tag text={`IPv${resolver.version}`} />
      <View style={styles.resolverText}>
        <Text style={styles.ip}>{resolver.ip}</Text>
        <Text style={styles.detail}>
          {`${resolver.city}, ${resolver.country} (${resolver.iso_code}) · ${resolver.org}`}
        </Text>
        {badge !== undefined && (
          <View style={styles.badge}>
            <Badge {...badge} />
          </View>
        )}
      </View>
    </Item>
  );
}

function networkBadge({ same_network }: DnsResolver) {
  if (same_network === true) return { text: 'Your network', tone: 'ok' } as const;
  if (same_network === false) return { text: 'Other network', tone: 'leak' } as const;
  return undefined;
}

/** The site's verdict banner, word for word. */
function VerdictBanner({ leak, resolvers }: DnsLeakResult) {
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
  return (
    <View style={useStyles().verdict}>
      <Verdict tone={tone} title={title} text={text} />
    </View>
  );
}

function Message({ text }: { text: string }) {
  const styles = useStyles();
  return (
    <Item>
      <Text style={styles.message}>{text}</Text>
    </Item>
  );
}

const useStyles = themedStyles((c) => ({
  items: {
    gap: Spacing.two,
  },
  verdict: {
    marginBottom: Spacing.one,
  },
  resolver: {
    alignItems: 'flex-start',
  },
  resolverText: {
    flex: 1,
    minWidth: 0,
  },
  ip: {
    fontFamily: Fonts.mono,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: c.strong,
  },
  detail: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 19,
    color: c.muted,
  },
  badge: {
    marginTop: 6,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    color: c.muted,
  },
}));
