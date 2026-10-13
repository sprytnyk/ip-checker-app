import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Footer } from '@/components/footer';
import { HistoryList } from '@/components/history-list';
import { ArrowLeftIcon } from '@/components/icons';
import { ErrorCard, LookupCard, MyIpCard } from '@/components/location-card';
import { SearchBar } from '@/components/search-bar';
import { Colors, PageGradient, Spacing } from '@/constants/theme';
import { useLookup } from '@/hooks/use-lookup';
import { useLookupHistory } from '@/hooks/use-lookup-history';
import { useMyIp } from '@/hooks/use-my-ip';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const myIp = useMyIp();
  const lookup = useLookup();
  const history = useLookupHistory();

  const showingLookup = lookup.state.status !== 'idle';
  const refreshing = showingLookup
    ? lookup.state.status === 'loading'
    : myIp.refreshing && myIp.state.status !== 'loading';

  async function search(ip: string) {
    const location = await lookup.lookup(ip);
    if (location) history.add(location.ip);
  }

  function refresh() {
    if (lookup.state.status === 'idle') myIp.refresh();
    else lookup.lookup(lookup.state.query);
  }

  function renderCard() {
    const { state } = lookup;
    if (state.status === 'error') {
      return <ErrorCard key={`error:${state.query}`} message={state.message} onRetry={refresh} />;
    }
    if (state.status !== 'idle') {
      const location = state.status === 'ready' ? state.location : undefined;
      return <LookupCard key={`lookup:${state.query}`} query={state.query} location={location} />;
    }

    const mine = myIp.state;
    if (mine.status === 'error') {
      return <ErrorCard key="error:mine" message={mine.message} onRetry={refresh} />;
    }
    return mine.status === 'ready' ? (
      <MyIpCard key="mine" location={mine.location} addresses={mine.addresses} />
    ) : (
      <MyIpCard key="mine" />
    );
  }

  return (
    <View style={styles.background}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.page,
          { paddingTop: insets.top + Spacing.six, paddingBottom: insets.bottom + Spacing.six },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            progressViewOffset={insets.top}
            colors={[Colors.link]}
            progressBackgroundColor={Colors.slate800}
          />
        }>
        <Text style={styles.title} accessibilityRole="header">
          What&apos;s My IP
        </Text>

        <SearchBar onSubmit={search} busy={lookup.state.status === 'loading'} />

        <View style={styles.cardSection}>
          {showingLookup && (
            <Pressable
              onPress={lookup.reset}
              accessibilityRole="button"
              style={({ pressed }) => [styles.backChip, pressed && styles.backChipPressed]}>
              <ArrowLeftIcon color={Colors.link} size={16} />
              <Text style={styles.backChipText}>Back to my IP</Text>
            </Pressable>
          )}
          {renderCard()}
        </View>

        <HistoryList
          items={history.items}
          onSelect={search}
          onRemove={history.remove}
          onClear={history.clear}
        />

        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: Colors.slate900,
    experimental_backgroundImage: PageGradient,
  },
  page: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 672,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.six,
  },
  title: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.four,
  },
  cardSection: {
    gap: Spacing.three,
  },
  backChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: Colors.slate800,
    borderWidth: 1,
    borderColor: Colors.slate700,
    borderRadius: 999,
  },
  backChipPressed: {
    backgroundColor: Colors.slate700,
  },
  backChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.link,
  },
});
