/**
 * Client for the IP Location API. Schema: https://ip.sprytnyk.dev/openapi.json
 */

import { getRandomBytes } from 'expo-crypto';

export const API_HOST = 'ip.sprytnyk.dev';

const REQUEST_TIMEOUT_MS = 10_000;
// Same budget the site gives its ipv4./ipv6. probes.
const PROBE_TIMEOUT_MS = 5_000;
// The DNS leak test's zone, served by the API's own nameserver.
const DNS_ZONE = `dns.${API_HOST}`;
// Several lookups, so resolvers that share the load all show up. Same count as the site.
const DNS_LOOKUPS = 6;

export type IpVersion = 4 | 6;

export type Location = {
  country: string;
  iso_code: string;
  city: string;
  ip: string;
  version: IpVersion;
  org: string;
};

type Address = {
  ip: string;
  version: IpVersion;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { cache: 'no-store', ...init, signal: controller.signal });
  } catch {
    throw new ApiError(
      controller.signal.aborted
        ? 'The request timed out.'
        : "Couldn't reach the server. Check your connection.",
    );
  } finally {
    clearTimeout(timer);
  }
}

async function getJson<T>(url: string, timeoutMs: number): Promise<T> {
  const response = await fetchWithTimeout(url, timeoutMs, {
    headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
  });

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      errorDetail(body) ?? `Request failed (${response.status}).`,
      response.status,
    );
  }
  return body as T;
}

/** Pulls a readable message out of `Message` (400/404/500) or `HTTPValidationError` (422). */
function errorDetail(body: unknown): string | undefined {
  if (typeof body !== 'object' || body === null || !('detail' in body)) return undefined;
  const { detail } = body;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && typeof detail[0]?.msg === 'string') return detail[0].msg;
  return undefined;
}

/** GET /api/ip/ for the caller's address, or /api/ip/{ip}/ for a given one. */
export function fetchLocation(ip?: string): Promise<Location> {
  const path = ip === undefined ? '' : `${encodeURIComponent(ip)}/`;
  return getJson<Location>(`https://${API_HOST}/api/ip/${path}`, REQUEST_TIMEOUT_MS);
}

/**
 * Finds the caller's address on one protocol. A request reaches the server over one
 * protocol only, so the ipv4. subdomain has only an A record and ipv6. only an AAAA
 * record. Resolves to null when the device has no route over that protocol.
 */
export async function probeAddress(version: IpVersion): Promise<string | null> {
  try {
    const data = await getJson<Address>(
      `https://ipv${version}.${API_HOST}/api/address/`,
      PROBE_TIMEOUT_MS,
    );
    return data.version === version ? data.ip : null;
  } catch {
    return null;
  }
}

/**
 * DNS leak test: looks up random names under dns.<host>, whose nameserver records which
 * resolvers asked, then fetches that list from GET /api/dns/{id}/. The lookups fail with
 * NXDOMAIN by design; only the query matters. Resolves to the resolvers seen, with their
 * location details.
 */
export async function testDnsLeak(): Promise<Location[]> {
  // 32 random hex digits, the id format the server expects.
  const bytes = Array.from(getRandomBytes(16), (byte) => byte.toString(16).padStart(2, '0'));
  const testId = bytes.join('');
  await Promise.allSettled(
    Array.from({ length: DNS_LOOKUPS }, (_, n) =>
      fetchWithTimeout(`https://${testId}-${n}.${DNS_ZONE}/`, PROBE_TIMEOUT_MS),
    ),
  );
  const data = await getJson<{ resolvers: Location[] }>(
    `https://${API_HOST}/api/dns/${testId}/`,
    REQUEST_TIMEOUT_MS,
  );
  return data.resolvers;
}
