import { addNetworkStateListener } from 'expo-network';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { AppState } from 'react-native';

import {
  ApiError,
  type DnsLeakResult,
  fetchLocation,
  type IpVersion,
  type Location,
  probeAddress,
  testDnsLeak,
} from '@/lib/api';

// Coming back to the app after at least this long triggers a fresh check.
const STALE_AFTER_MS = 30_000;

/** undefined while the probe runs, null when the device has no address on that protocol. */
export type Addresses = Record<IpVersion, string | null | undefined>;

export type MyIpState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; location: Location; addresses: Addresses };

export type ResolversState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; result: DnsLeakResult };

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'Something went wrong.';
}

export function useMyIp() {
  const [state, setState] = useState<MyIpState>({ status: 'loading' });
  const [resolvers, setResolvers] = useState<ResolversState>({ status: 'loading' });
  const [refreshing, setRefreshing] = useState(false);
  // Each run gets an id so a slow, older response can't overwrite a newer one.
  const runId = useRef(0);

  // The first load has its own 'loading' state; only later runs show the refresh spinner.
  // State is only set in promise callbacks, never synchronously, so this is safe to start
  // from an effect.
  function load() {
    const id = ++runId.current;
    const isCurrent = () => id === runId.current;

    fetchLocation().then(
      async (location) => {
        if (!isCurrent()) return;
        const other: IpVersion = location.version === 4 ? 6 : 4;
        const addresses = { [location.version]: location.ip, [other]: undefined } as Addresses;
        setState({ status: 'ready', location, addresses });
        setRefreshing(false);

        const otherAddress = await probeAddress(other);
        if (!isCurrent()) return;
        setState({ status: 'ready', location, addresses: { ...addresses, [other]: otherAddress } });
      },
      (error: unknown) => {
        if (!isCurrent()) return;
        setState({ status: 'error', message: errorMessage(error) });
        setRefreshing(false);
      },
    );

    // The DNS leak test runs alongside; it takes a few seconds and doesn't hold the spinner.
    testDnsLeak().then(
      (result) => {
        if (isCurrent()) setResolvers({ status: 'ready', result });
      },
      (error: unknown) => {
        if (isCurrent()) setResolvers({ status: 'error', message: errorMessage(error) });
      },
    );
  }

  function refresh() {
    setRefreshing(true);
    setResolvers({ status: 'loading' });
    load();
  }

  const initialLoad = useEffectEvent(() => {
    load();
  });
  const reload = useEffectEvent(refresh);

  useEffect(() => {
    initialLoad();

    // Wi-Fi, cellular and VPN switches change the public address.
    let lastNetwork: string | undefined;
    const network = addNetworkStateListener(({ type, isConnected }) => {
      const current = `${type}:${isConnected}`;
      if (lastNetwork !== undefined && current !== lastNetwork && isConnected) {
        reload();
      }
      lastNetwork = current;
    });

    let leftAt: number | undefined;
    const appState = AppState.addEventListener('change', (status) => {
      if (status !== 'active') {
        leftAt ??= Date.now();
        return;
      }
      if (leftAt !== undefined && Date.now() - leftAt >= STALE_AFTER_MS) {
        reload();
      }
      leftAt = undefined;
    });

    return () => {
      network.remove();
      appState.remove();
    };
  }, []);

  return { state, resolvers, refreshing, refresh };
}
