import Storage from 'expo-sqlite/kv-store';
import { useState } from 'react';

const STORAGE_KEY = 'lookup-history';
const MAX_ENTRIES = 20;

function read(): string[] {
  try {
    const parsed: unknown = JSON.parse(Storage.getItemSync(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

/** The last few IPs the user looked up, newest first. Stays on the device. */
export function useLookupHistory() {
  const [items, setItems] = useState(read);

  function save(next: string[]) {
    setItems(next);
    Storage.setItemSync(STORAGE_KEY, JSON.stringify(next));
  }

  return {
    items,
    add: (ip: string) => save([ip, ...items.filter((item) => item !== ip)].slice(0, MAX_ENTRIES)),
    remove: (ip: string) => save(items.filter((item) => item !== ip)),
    clear: () => save([]),
  };
}
