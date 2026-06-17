/**
 * SessionNet client + parser for the Herdecke Ratsinformationssystem.
 *
 * The Stadt Herdecke council portal runs Somacos SessionNet ("Bürgerinfo")
 * at https://sessionnet.owl-it.de/herdecke/bi/ and exposes NO OParl API,
 * so we read the public HTML directly. Page map (verified June 2026):
 *
 *   si0040.asp?__cjahr=Y&__cmonat=M&__canz=1&__cselect=0  → month calendar
 *   si0057.asp?__ksinr=<id>                               → a meeting + its agenda
 *   vo0050.asp?__kvonr=<id>                               → a Vorlage (paper)
 *   getfile.asp?id=<id>&type=do                           → a document (PDF)
 *   rssfeed.asp                                           → "what's new" feed
 *
 * Everything here is plain, dependency-light, and framework-agnostic so it can
 * be reused by the CLI, the scheduled scan job, and the Next.js app.
 */

import * as cheerio from 'cheerio';

export const BASE_URL = 'https://sessionnet.owl-it.de/herdecke/bi';

/** Identify the bot honestly with a contact, as good civic-scraping etiquette. */
const USER_AGENT =
  'Herdecke-kompakt/0.1 (open civic-tech; +https://github.com/felsenuboot/herdecke-kompakt)';

const REQUEST_TIMEOUT_MS = 20_000;

export interface Meeting {
  ksinr: number;
  /** Gremium, e.g. "Rat" or "Ausschuss für Umwelt und Klima". */
  committee: string;
  /** ISO date, e.g. "2026-06-18". */
  date: string;
  url: string;
}

export interface AgendaItem {
  ksinr: number;
  /** TOP label as shown, e.g. "5.2". */
  top: string;
  /** Betreff — the matchable subject line. */
  subject: string;
  /** Öffentlich? Non-public items usually have no subject. */
  public: boolean;
  /** Vorlage id (vo0050), if the item references a paper. */
  vonr?: number;
  vorlageUrl?: string;
  /** Attached document ids (getfile.asp?id=...). */
  documentIds: number[];
}

export interface MeetingAgenda extends Meeting {
  /** Full header title, e.g. "Rat - 18.06.2026 - 17:00 Uhr". */
  title: string;
  items: AgendaItem[];
}

/** Fetch a URL as text with a sane UA, timeout, and error on non-2xx. */
async function fetchHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml' },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`GET ${url} → HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

/** "18.06.2026" → "2026-06-18". Returns "" if it doesn't look like a date. */
function germanDateToIso(dmy: string): string {
  const m = dmy.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (!m) return '';
  return `${m[3]}-${m[2]}-${m[1]}`;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * SessionNet flattens subjects across <div>/<span> without whitespace, so
 * `.text()` yields run-ons like "KoepchenwerkWeiterentwicklung". Insert a
 * space at block-level tag breaks before parsing so text reads naturally.
 */
function withTextSpacing(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(div|span|p|li|td|th|h[1-6]|a)>/gi, ' </$1>');
}

/**
 * Parse one month of the calendar. Each meeting is an <a> linking to si0057
 * whose title attribute reads "Details anzeigen: <Committee> <DD.MM.YYYY>".
 */
export async function listMeetingsForMonth(year: number, month: number): Promise<Meeting[]> {
  const url = `${BASE_URL}/si0040.asp?__cjahr=${year}&__cmonat=${month}&__canz=1&__cselect=0`;
  const $ = cheerio.load(await fetchHtml(url));
  const byId = new Map<number, Meeting>();

  $('a[href*="si0057.asp?__ksinr="]').each((_, el) => {
    const href = $(el).attr('href') ?? '';
    const ksinr = Number(href.match(/__ksinr=(\d+)/)?.[1]);
    if (!ksinr || byId.has(ksinr)) return;

    const label = $(el).attr('title') ?? $(el).attr('aria-label') ?? $(el).text();
    const date = germanDateToIso(label);
    // Committee = label minus the "Details anzeigen:" prefix and trailing date.
    const committee = label
      .replace(/^\s*Details anzeigen:\s*/i, '')
      .replace(/\s*\d{2}\.\d{2}\.\d{4}.*$/, '')
      .replace(/\s+/g, ' ')
      .trim() || $(el).text().replace(/\s+/g, ' ').trim();

    byId.set(ksinr, { ksinr, committee, date, url: `${BASE_URL}/si0057.asp?__ksinr=${ksinr}` });
  });

  return [...byId.values()];
}

/**
 * Parse the "next sessions" widget on the landing page. Each meeting is an
 * iCal export link `yvcs.asp?key=<ksinr>&dstart=<YYYYMMDD…>&…&text=<committee>`,
 * which announces meetings further out than the month calendar shows them.
 */
export async function listAnnouncedMeetings(from: string = todayIso()): Promise<Meeting[]> {
  const $ = cheerio.load(await fetchHtml(`${BASE_URL}/info.asp`));
  const byId = new Map<number, Meeting>();

  $('a[href*="yvcs.asp?"]').each((_, el) => {
    const query = ($(el).attr('href') ?? '').split('?')[1] ?? '';
    const params = new URLSearchParams(query);
    const ksinr = Number(params.get('key'));
    const dstart = params.get('dstart') ?? '';
    const committee = (params.get('text') ?? '').replace(/\s+/g, ' ').trim();
    if (!ksinr || !/^\d{8}/.test(dstart)) return;
    const date = `${dstart.slice(0, 4)}-${dstart.slice(4, 6)}-${dstart.slice(6, 8)}`;
    if (date < from || byId.has(ksinr)) return;
    byId.set(ksinr, { ksinr, committee, date, url: `${BASE_URL}/si0057.asp?__ksinr=${ksinr}` });
  });

  return [...byId.values()];
}

/**
 * List upcoming meetings, de-duplicated and sorted by date. Combines the month
 * calendar (next `months` months) with the landing-page "next sessions" widget,
 * so both near-term published meetings and announced future ones are covered.
 * Meetings before `from` (default today) are dropped. Resilient: a failure in
 * one source doesn't sink the others.
 */
export async function listUpcomingMeetings(opts: { months?: number; from?: string } = {}): Promise<Meeting[]> {
  const months = opts.months ?? 4;
  const from = opts.from ?? todayIso();
  const start = new Date(`${from}T00:00:00Z`);
  const byId = new Map<number, Meeting>();

  const add = (meetings: Meeting[]) => {
    for (const m of meetings) {
      if (m.date && m.date >= from && !byId.has(m.ksinr)) byId.set(m.ksinr, m);
    }
  };

  for (let i = 0; i < months; i++) {
    const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1));
    try {
      add(await listMeetingsForMonth(d.getUTCFullYear(), d.getUTCMonth() + 1));
    } catch {
      /* keep going — other months / the landing page may still succeed */
    }
  }
  try {
    add(await listAnnouncedMeetings(from));
  } catch {
    /* landing page optional */
  }

  return [...byId.values()].sort((a, b) => a.date.localeCompare(b.date) || a.ksinr - b.ksinr);
}

/** Fetch a meeting and parse its agenda items (TOPs). */
export async function fetchMeetingAgenda(meeting: Meeting | number): Promise<MeetingAgenda> {
  const ksinr = typeof meeting === 'number' ? meeting : meeting.ksinr;
  const $ = cheerio.load(withTextSpacing(await fetchHtml(`${BASE_URL}/si0057.asp?__ksinr=${ksinr}`)));

  const title = ($('title').first().text() || '')
    .replace(/^\s*SessionNet\s*\|\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  const items: AgendaItem[] = [];
  // Each agenda row carries a `.tofnum` (TOP number) cell.
  $('.tofnum').each((_, el) => {
    const $row = $(el).closest('tr');
    const top = $(el).text().replace(/\s+/g, ' ').trim();
    const subject = $row.find('.smc-card-header-title-simple').first().text().replace(/\s+/g, ' ').trim();

    const voHref = $row.find('a[href*="vo0050.asp?__kvonr="]').first().attr('href');
    const vonr = voHref ? Number(voHref.match(/__kvonr=(\d+)/)?.[1]) : undefined;

    const documentIds = $row
      .find('a[href*="getfile.asp?id="]')
      .map((_, a) => Number(($(a).attr('href') ?? '').match(/id=(\d+)/)?.[1]))
      .get()
      .filter((n): n is number => Number.isFinite(n));

    const isPublic = !/nicht\s*öffentlich/i.test($row.text());

    items.push({
      ksinr,
      top,
      subject,
      public: isPublic,
      vonr: vonr || undefined,
      vorlageUrl: vonr ? `${BASE_URL}/vo0050.asp?__kvonr=${vonr}` : undefined,
      documentIds,
    });
  });

  const base: Meeting =
    typeof meeting === 'number'
      ? { ksinr, committee: title.split(' - ')[0]?.trim() ?? '', date: germanDateToIso(title), url: `${BASE_URL}/si0057.asp?__ksinr=${ksinr}` }
      : meeting;

  return { ...base, title, items };
}

export interface RssItem {
  title: string;
  description: string;
  link?: string;
}

/** The portal's RSS feed — a cheap "has anything changed?" signal. */
export async function fetchRss(): Promise<RssItem[]> {
  const xml = await fetchHtml(`${BASE_URL}/rssfeed.asp`);
  const $ = cheerio.load(xml, { xmlMode: true });
  return $('item')
    .map((_, el) => ({
      title: $(el).find('title').first().text().trim(),
      description: $(el).find('description').first().text().replace(/\s+/g, ' ').trim(),
      link: $(el).find('link').first().text().trim() || undefined,
    }))
    .get();
}
