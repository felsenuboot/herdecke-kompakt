/** Tiny JSON fetch helper for the open-data source clients: timeout + caching. */
import { city, sourceUserAgent } from '../../config/city';

const UA = sourceUserAgent;

export async function fetchJson<T = unknown>(url: string, revalidateSeconds = 300, timeoutMs = 10000): Promise<T> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    // Honoured by Next.js (ISR-style caching); ignored by plain Node.
    next: { revalidate: revalidateSeconds },
  } as RequestInit);
  if (!res.ok) throw new Error(`GET ${url} → HTTP ${res.status}`);
  return (await res.json()) as T;
}

/** Town centre (from the active city config), used for geo-located queries. */
export const HERDECKE = city.center;
