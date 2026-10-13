import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ClockIcon, XIcon } from '@/components/icons';
import { Colors, Radius, Spacing } from '@/constants/theme';

type Props = {
  items: string[];
  onSelect: (ip: string) => void;
  onRemove: (ip: string) => void;
  onClear: () => void;
};

export function HistoryList({ items, onSelect, onRemove, onClear }: Props) {
  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent lookups</Text>
        <Pressable onPress={onClear} hitSlop={8} accessibilityRole="button">
          {({ pressed }) => (
            <Text style={[styles.clear, pressed && styles.clearPressed]}>Clear all</Text>
          )}
        </Pressable>
      </View>
      {items.map((ip) => (
        <Pressable
          key={ip}
          onPress={() => onSelect(ip)}
          accessibilityRole="button"
          accessibilityHint="Looks up this address again"
          style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}>
          <ClockIcon color={Colors.slate500} size={18} />
          <Text style={styles.ip} numberOfLines={1} ellipsizeMode="middle">
            {ip}
          </Text>
          <Pressable
            onPress={() => onRemove(ip)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${ip} from history`}>
            <XIcon color={Colors.slate500} size={18} />
          </Pressable>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.one,
    marginBottom: Spacing.one,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.slate400,
  },
  clear: {
    fontSize: 14,
    color: Colors.link,
  },
  clearPressed: {
    color: Colors.linkPressed,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    backgroundColor: Colors.rowBackground,
    borderRadius: Radius.row,
  },
  itemPressed: {
    backgroundColor: Colors.slate700,
  },
  ip: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.slate200,
  },
});
