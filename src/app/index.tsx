import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Backdrop } from '@/components/backdrop';
import { PillButton } from '@/components/card';
import { DnsLeakCard } from '@/components/dns-leak-card';
import { Footer } from '@/components/footer';
import { HistoryList } from '@/components/history-list';
import { ArrowLeftIcon } from '@/components/icons';
import { ErrorCard, LookupCard, MyIpCard } from '@/components/location-card';
import { SearchBar } from '@/components/search-bar';
import { TOP_BAR_HEIGHT, TopBar } from '@/components/top-bar';
import { Spacing, themedStyles, useColors } from '@/constants/theme';
import { useLookup } from '@/hooks/use-lookup';
import { useLookupHistory } from '@/hooks/use-lookup-history';
import { useMyIp } from '@/hooks/use-my-ip';

export default function HomeScreen() {
  const styles = useStyles();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const myIp = useMyIp();
  const lookup = useLookup();
  const history = useLookupHistory();

  const showingLookup = lookup.state.status !== 'idle';
  const refreshing = showingLookup
    ? lookup.state.status === 'loading'
    : myIp.refreshing && myIp.state.status !== 'loading';
  const topBar = insets.top + TOP_BAR_HEIGHT;

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
    <View style={styles.screen}>
      <Backdrop />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.page,
          { paddingTop: topBar + Spacing.six, paddingBottom: insets.bottom + Spacing.six },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            progressViewOffset={topBar}
            colors={[colors.accent]}
            progressBackgroundColor={colors.bg}
          />
        }>
        <SearchBar onSubmit={search} busy={lookup.state.status === 'loading'} />

        <View style={styles.cardSection}>
          {showingLookup && (
            <PillButton onPress={lookup.reset} style={styles.back}>
              <ArrowLeftIcon color={colors.label} size={16} />
              <Text style={styles.backText}>Back to my IP</Text>
            </PillButton>
          )}
          {renderCard()}
        </View>

        {/* The leak test is about this device, so it's hidden while showing someone else's IP. */}
        {!showingLookup && <DnsLeakCard state={myIp.resolvers} />}

        <HistoryList
          items={history.items}
          onSelect={search}
          onRemove={history.remove}
          onClear={history.clear}
        />

        <Footer />
      </ScrollView>
      <TopBar />
    </View>
  );
}

const useStyles = themedStyles((c) => ({
  screen: {
    flex: 1,
    backgroundColor: c.bg,
  },
  page: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 672,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  cardSection: {
    gap: Spacing.three,
  },
  back: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.three,
  },
  backText: {
    fontSize: 13,
    fontWeight: '600',
    color: c.label,
  },
}));
