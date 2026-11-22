import { Pressable, Text, View } from 'react-native';

import { Card, CardHeading, Item } from '@/components/card';
import { ClockIcon, XIcon } from '@/components/icons';
import { Fonts, Spacing, themedStyles, useColors } from '@/constants/theme';

type Props = {
  items: string[];
  onSelect: (ip: string) => void;
  onRemove: (ip: string) => void;
  onClear: () => void;
};

export function HistoryList({ items, onSelect, onRemove, onClear }: Props) {
  const styles = useStyles();
  const colors = useColors();
  if (items.length === 0) return null;

  return (
    <Card delay={100}>
      <CardHeading
        icon={ClockIcon}
        title="Recent lookups"
        note="Kept only on this phone."
        action={
          <Pressable onPress={onClear} hitSlop={8} accessibilityRole="button">
            {({ pressed }) => (
              <Text style={[styles.clear, pressed && styles.clearPressed]}>Clear all</Text>
            )}
          </Pressable>
        }
      />
      <View style={styles.items}>
        {items.map((ip) => (
          <Item
            key={ip}
            onPress={() => onSelect(ip)}
            accessibilityHint="Looks up this address again">
            <Text style={styles.ip} numberOfLines={1} ellipsizeMode="middle">
              {ip}
            </Text>
            <Pressable
              onPress={() => onRemove(ip)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${ip} from history`}>
              <XIcon color={colors.muted} size={17} />
            </Pressable>
          </Item>
        ))}
      </View>
    </Card>
  );
}

const useStyles = themedStyles((c) => ({
  items: {
    gap: Spacing.two,
  },
  clear: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
    color: c.link,
  },
  clearPressed: {
    opacity: 0.6,
  },
  ip: {
    flex: 1,
    fontFamily: Fonts.mono,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
    color: c.strong,
  },
}));
