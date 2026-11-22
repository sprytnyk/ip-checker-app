import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/card';
import { SearchIcon, XIcon } from '@/components/icons';
import { Radius, Spacing, themedStyles, useColors } from '@/constants/theme';
import { looksLikeIp } from '@/lib/ip';

type Props = {
  onSubmit: (ip: string) => void;
  busy?: boolean;
};

export function SearchBar({ onSubmit, busy }: Props) {
  const styles = useStyles();
  const colors = useColors();
  const [text, setText] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [focused, setFocused] = useState(false);

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
      <View style={styles.row}>
        <View
          style={[styles.field, focused && styles.fieldFocused, invalid && styles.fieldInvalid]}>
          <SearchIcon color={colors.muted} />
          <TextInput
            value={text}
            onChangeText={(value) => {
              setText(value);
              setInvalid(false);
            }}
            onSubmitEditing={submit}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Look up an IP address"
            placeholderTextColor={colors.muted}
            cursorColor={colors.accent}
            selectionColor={colors.softLine}
            selectionHandleColor={colors.accent}
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
              <XIcon color={colors.muted} size={17} />
            </Pressable>
          )}
        </View>
        <Button title="Look up" onPress={submit} disabled={busy} style={styles.button} />
      </View>
      {invalid && <Text style={styles.error}>Enter a valid IPv4 or IPv6 address.</Text>}
    </View>
  );
}

const useStyles = themedStyles((c) => ({
  container: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: Radius.item,
    boxShadow: `${c.highlight}, ${c.shadow}`,
  },
  fieldFocused: {
    borderColor: c.accent,
  },
  fieldInvalid: {
    borderColor: c.bad,
  },
  input: {
    flex: 1,
    minHeight: 48,
    fontSize: 15,
    color: c.strong,
  },
  button: {
    borderRadius: Radius.item,
  },
  error: {
    paddingHorizontal: Spacing.one,
    fontSize: 13,
    color: c.bad,
  },
}));
