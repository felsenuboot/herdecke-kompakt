/** Tiny JSON fetch helper for the open-data source clients: timeout + caching. */
const UA = 'Herdecke-kompakt/0.1 (open civic-tech; +https://github.com/felsenuboot/herdecke-digital)';

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

/** Herdecke town centre, used for geo-located queries. */
export const HERDECKE = { lat: 51.4, lon: 7.43 } as const;
