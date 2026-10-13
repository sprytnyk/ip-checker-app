import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { SearchIcon, XIcon } from '@/components/icons';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { looksLikeIp } from '@/lib/ip';

type Props = {
  onSubmit: (ip: string) => void;
  busy?: boolean;
};

export function SearchBar({ onSubmit, busy }: Props) {
  const [text, setText] = useState('');
  const [invalid, setInvalid] = useState(false);

  function submit() {
    const ip = text.trim();
    if (!ip) return;
    if (!looksLikeIp(ip)) {
      setInvalid(true);
      return;
    }
    onSubmit(ip);
  }

  return (
    <View style={styles.container}>
      <View style={[styles.field, invalid && styles.fieldInvalid]}>
        <SearchIcon color={Colors.slate400} size={20} />
        <TextInput
          value={text}
          onChangeText={(value) => {
            setText(value);
            setInvalid(false);
          }}
          onSubmitEditing={submit}
          placeholder="Look up an IP address"
          placeholderTextColor={Colors.slate500}
          cursorColor={Colors.link}
          selectionColor={Colors.link}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          spellCheck={false}
          inputMode="url"
          returnKeyType="search"
          accessibilityLabel="IP address to look up"
          style={styles.input}
        />
        {text.length > 0 && (
          <Pressable
            onPress={() => {
              setText('');
              setInvalid(false);
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear">
            <XIcon color={Colors.slate400} size={18} />
          </Pressable>
        )}
      </View>
      <Pressable
        onPress={submit}
        disabled={busy}
        accessibilityRole="button"
        style={({ pressed }) => [styles.button, (pressed || busy) && styles.buttonPressed]}>
        <Text style={styles.buttonText}>Look up</Text>
      </Pressable>
      {invalid && <Text style={styles.error}>Enter a valid IPv4 or IPv6 address.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    backgroundColor: Colors.slate800,
    borderWidth: 1,
    borderColor: Colors.slate700,
    borderRadius: Radius.row,
  },
  fieldInvalid: {
    borderColor: Colors.error,
  },
  input: {
    flex: 1,
    minHeight: 52,
    fontSize: 16,
    color: Colors.white,
  },
  button: {
    justifyContent: 'center',
    paddingHorizontal: Spacing.five,
    backgroundColor: Colors.blue600,
    borderRadius: Radius.row,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  error: {
    width: '100%',
    fontSize: 14,
    color: Colors.error,
  },
});
