import { useRef, useState } from 'react';

import { ApiError, fetchLocation, type Location } from '@/lib/api';

export type LookupState =
  | { status: 'idle' }
  | { status: 'loading'; query: string }
  | { status: 'error'; query: string; message: string }
  | { status: 'ready'; query: string; location: Location };

export function useLookup() {
  const [state, setState] = useState<LookupState>({ status: 'idle' });
  const runId = useRef(0);

  async function lookup(query: string): Promise<Location | undefined> {
    const id = ++runId.current;
    setState({ status: 'loading', query });
    try {
      const location = await fetchLocation(query);
      if (id === runId.current) setState({ status: 'ready', query, location });
      return location;
    } catch (error) {
      if (id !== runId.current) return;
      setState({
        status: 'error',
        query,
        message: error instanceof ApiError ? error.message : 'Something went wrong.',
      });
    }
  }

  function reset() {
    runId.current++;
    setState({ status: 'idle' });
  }

  return { state, lookup, reset };
}
