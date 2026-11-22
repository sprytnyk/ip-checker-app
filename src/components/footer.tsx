import Constants from 'expo-constants';
import { Text, View } from 'react-native';

import { ExternalLink } from '@/components/external-link';
import { Spacing, themedStyles } from '@/constants/theme';
import { API_HOST } from '@/lib/api';

const APP_VERSION = Constants.expoConfig?.version;

/** The site's footer, word for word, plus the app's version. */
export function Footer() {
  const styles = useStyles();
  return (
    <View style={styles.footer}>
      <Text style={styles.line}>
        Location data from{' '}
        <ExternalLink
          href="https://dev.maxmind.com/geoip/geolite2-free-geolocation-data/"
          style={styles.link}>
          MaxMind GeoLite2
        </ExternalLink>
      </Text>
      <Text style={styles.line}>
        <ExternalLink href={`https://${API_HOST}/docs/`} style={styles.link}>
          API documentation
        </ExternalLink>
      </Text>
      <Text style={styles.line}>
        Your data isn&apos;t collected: see the{' '}
        <ExternalLink href="https://github.com/sprytnyk/ip" style={styles.link}>
          source on GitHub
        </ExternalLink>
      </Text>
      {APP_VERSION !== undefined && <Text style={styles.line}>Version {APP_VERSION}</Text>}
    </View>
  );
}

const useStyles = themedStyles((c) => ({
  footer: {
    marginTop: 'auto',
    paddingTop: Spacing.four,
    gap: Spacing.two,
  },
  line: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 17,
    color: c.muted,
  },
  link: {
    color: c.label,
    fontWeight: '500',
  },
}));
