/**
 * Müll-Wecker data source: AHE Ennepe-Ruhr waste calendar for Herdecke.
 *
 * AHE's site is backed by a JSON+iCal API at ahe.atino.net. The flow (verified
 * June 2026, recipe cross-checked against the community `waste_collection_schedule`
 * project's `ahe_de` source):
 *   1. GET /pickup-dates           → CSRF token + PHPSESSID cookie
 *   2. GET /search/postalcode?q=   → resolve PLZ to its record id
 *   3. GET /search/city?postalCode → resolve the city id
 *   4. GET /search/street?cityId&q → resolve the street id (server-side filtered)
 *   5. POST /pickup-dates          → an iCalendar of collection dates
 *
 * Herdecke is entirely PLZ 58313.
 */
const BASE = 'https://ahe.atino.net';
const PLZ = '58313';
const UA = 'Herdecke-kompakt/0.1 (open civic-tech; +https://github.com/felsenuboot/herdecke-kompakt)';

export interface Pickup {
  /** Waste type, e.g. "Restabfall", "Bioabfall", "Papier", "Gelber Sack". */
  type: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
}

export interface WasteResult {
  street: string;
  pickups: Pickup[];
  /** Set when the street was ambiguous/not found — candidates to choose from. */
  suggestions?: string[];
  error?: string;
}

interface Session {
  cookie: string;
}

function captureCookie(res: Response, sess: Session): void {
  const sc = res.headers.getSetCookie?.() ?? [];
  if (sc.length) sess.cookie = sc.map((c) => c.split(';')[0]).join('; ');
}

function headers(sess: Session, extra: Record<string, string> = {}): Record<string, string> {
  return { 'User-Agent': UA, ...(sess.cookie ? { Cookie: sess.cookie } : {}), ...extra };
}

function get(url: string, sess: Session): Promise<Response> {
  return fetch(url, { headers: headers(sess), signal: AbortSignal.timeout(10_000) });
}

const norm = (s: string): string =>
  s.toLowerCase().replace(/ß/g, 'ss').replace(/\s+/g, '').replace(/stra(ss|ß)e\b/g, 'str').trim();

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseIcs(ics: string): Pickup[] {
  const out: Pickup[] = [];
  for (const block of ics.split('BEGIN:VEVENT').slice(1)) {
    const summary = block.match(/SUMMARY:(.+)/)?.[1]?.trim();
    const dt = block.match(/DTSTART[^:]*:(\d{8})/)?.[1];
    if (!summary || !dt) continue;
    const date = `${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}`;
    if (date < '2000-01-01') continue; // skip calendar header artefacts
    out.push({ type: summary, date });
  }
  return out;
}

export async function getWastePickups(strasse: string, hnr: string | number, limit = 10): Promise<WasteResult> {
  const street = strasse.trim();
  if (!street) return { street, pickups: [], error: 'Bitte gib eine Straße an.' };

  try {
    const sess: Session = { cookie: '' };

    const tokenRes = await get(`${BASE}/pickup-dates`, sess);
    captureCookie(tokenRes, sess);
    const html = await tokenRes.text();
    const token =
      html.match(/name="pickup_date\[_token\]"[^>]*value="([^"]+)"/)?.[1] ??
      html.match(/value="([^"]+)"[^>]*name="pickup_date\[_token\]"/)?.[1];
    if (!token) return { street, pickups: [], error: 'Abfuhrkalender-Dienst nicht erreichbar.' };

    const pcRes = await get(`${BASE}/search/postalcode?q=${PLZ}`, sess);
    captureCookie(pcRes, sess);
    const pcs = (await pcRes.json()) as Array<{ id: string; text: string }>;
    const post = pcs.find((e) => e.text === PLZ) ?? pcs[0];
    if (!post) return { street, pickups: [], error: 'Postleitzahl konnte nicht aufgelöst werden.' };

    const cityRes = await get(`${BASE}/search/city?postalCode=${PLZ}`, sess);
    captureCookie(cityRes, sess);
    const city = (await cityRes.json()) as { id: string; name: string };
    if (!city?.id) return { street, pickups: [], error: 'Ort konnte nicht aufgelöst werden.' };

    const stRes = await get(`${BASE}/search/street?cityId=${city.id}&q=${encodeURIComponent(street)}`, sess);
    captureCookie(stRes, sess);
    const streets = (await stRes.json()) as Array<{ id: string; name: string }>;
    if (!streets.length)
      return {
        street,
        pickups: [],
        error: `„${street}" wurde nicht gefunden. Bitte gib den vollständigen Straßennamen ein (z. B. „Hauptstraße").`,
      };

    const match = streets.find((s) => norm(s.name) === norm(street)) ?? (streets.length === 1 ? streets[0] : undefined);
    if (!match) {
      return { street, pickups: [], suggestions: streets.map((s) => s.name).slice(0, 8), error: 'Bitte wähle deine Straße genauer.' };
    }

    const body = new URLSearchParams({
      'pickup_date[postalCode]': post.id,
      'fake_pickup_date[postalCode]': post.id,
      'pickup_date[street]': match.id,
      'pickup_date[houseNumber]': String(hnr ?? '').trim(),
      'pickup_date[format]': '1',
      'pickup_date[submit]': '',
      'pickup_date[_token]': token,
    });
    const icsRes = await fetch(`${BASE}/pickup-dates`, {
      method: 'POST',
      headers: headers(sess, { 'Content-Type': 'application/x-www-form-urlencoded' }),
      body,
      signal: AbortSignal.timeout(10_000),
    });
    const ics = await icsRes.text();
    if (ics.includes('Es wurden keine Termine gefunden')) {
      return { street: match.name, pickups: [], error: 'Für diese Adresse wurden keine Termine gefunden — bitte Hausnummer prüfen.' };
    }

    const today = todayIso();
    const pickups = parseIcs(ics)
      .filter((p) => p.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, limit);

    return { street: match.name, pickups };
  } catch {
    return { street, pickups: [], error: 'Abfuhrtermine konnten gerade nicht geladen werden.' };
  }
}
