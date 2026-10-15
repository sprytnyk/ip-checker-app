import Constants from 'expo-constants';
import { StyleSheet, Text, View } from 'react-native';

import { ExternalLink } from '@/components/external-link';
import { Colors, Spacing } from '@/constants/theme';
import { API_HOST } from '@/lib/api';

const APP_VERSION = Constants.expoConfig?.version;

/** The site's footer, word for word, plus the app's version. */
export function Footer() {
  return (
    <View>
      <Text style={styles.line}>
        Data provided by{' '}
        <ExternalLink
          href="https://dev.maxmind.com/geoip/geolite2-free-geolocation-data/"
          style={styles.link}>
          MaxMind GeoIP2 Lite
        </ExternalLink>
        .
      </Text>
      <Text style={styles.line}>
        View the{' '}
        <ExternalLink href={`https://${API_HOST}/docs/`} style={styles.link}>
          API Documentation
        </ExternalLink>
        .
      </Text>
      <Text style={styles.line}>
        Your data isn&apos;t collected. Check this{' '}
        <ExternalLink href="https://github.com/sprytnyk/ip" style={styles.link}>
          GitHub repository
        </ExternalLink>
        .
      </Text>
      {APP_VERSION !== undefined && (
        <Text style={[styles.line, styles.version]}>Version {APP_VERSION}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  line: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 25,
    color: Colors.slate400,
  },
  link: {
    color: Colors.link,
  },
  version: {
    marginTop: Spacing.two,
    color: Colors.slate500,
  },
});
