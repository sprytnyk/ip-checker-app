const IPV4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
// Loose on purpose: the server does the full parse and answers 400 for anything it rejects.
const IPV6_CHARS = /^[0-9a-f:.]+$/i;

/** Quick check before calling the API, so obvious typos don't cost a round trip. */
export function looksLikeIp(value: string): boolean {
  if (IPV4.test(value)) return true;
  return value.includes(':') && value.length <= 45 && IPV6_CHARS.test(value);
}
