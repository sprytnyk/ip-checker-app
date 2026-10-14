/**
 * Client for the IP Location API. Schema: https://ip.sprytnyk.dev/openapi.json
 */

export const API_HOST = 'ip.sprytnyk.dev';

const REQUEST_TIMEOUT_MS = 10_000;
// Same budget the site gives its ipv4./ipv6. probes.
const PROBE_TIMEOUT_MS = 5_000;

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

async function getJson<T>(url: string, timeoutMs: number): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let response: Response;
  try {
    response = await fetch(url, {
      cache: 'no-store',
      headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(
      controller.signal.aborted
        ? 'The request timed out.'
        : "Couldn't reach the server. Check your connection.",
    );
  } finally {
    clearTimeout(timer);
  }

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
