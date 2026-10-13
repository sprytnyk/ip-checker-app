import { StyleSheet, Text, View } from 'react-native';

import { ExternalLink } from '@/components/external-link';
import { Colors } from '@/constants/theme';
import { API_HOST } from '@/lib/api';

/** The site's footer, word for word. */
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
});
