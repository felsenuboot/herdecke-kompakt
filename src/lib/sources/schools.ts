/**
 * Schools in Herdecke + NRW school holidays.
 *
 *  - Directory: NRW Schulgrunddaten CSV (Schulministerium NRW open data),
 *    filtered to Herdecke (AGS 05954020). UTF-8, ";"-separated, quoted fields.
 *  - Holidays: OpenHolidays API (keyless) for Nordrhein-Westfalen (DE-NW).
 */

import { city, sourceUserAgent } from '../../config/city';

const SCHULDATEN_CSV = 'https://www.schulministerium.nrw.de/BiPo/OpenData/Schuldaten/schuldaten.csv';
const SCHOOL_AGS = city.ags;
const UA = sourceUserAgent;

/** Official NRW Schulform key (key_schulformschluessel.csv). */
const SCHULFORM: Record<string, string> = {
  '02': 'Grundschule',
  '04': 'Hauptschule',
  '06': 'Volksschule',
  '08': 'Förderschule',
  '10': 'Realschule',
  '13': 'Primus (Schulversuch)',
  '14': 'Sekundarschule',
  '15': 'Gesamtschule',
  '16': 'Gemeinschaftsschule (Schulversuch)',
  '17': 'Waldorfschule',
  '18': 'Hiberniaschule',
  '19': 'Freie Waldorfförderschule',
  '20': 'Gymnasium',
  '25': 'Weiterbildungskolleg',
  '30': 'Berufskolleg',
};

export interface School {
  name: string;
  form: string; // numeric code
  formLabel: string;
  street: string;
  plz: string;
  phone: string;
  email: string;
  website: string;
}

export interface Holiday {
  name: string;
  start: string; // ISO date
  end: string; // ISO date
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQuotes = false;
      } else cur += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ';') {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

function tidyUrl(url: string): string {
  const u = url.trim();
  if (!u) return '';
  return /^https?:\/\//i.test(u) ? u : `http://${u}`;
}

let cache: { at: number; schools: School[] } | null = null;
const TTL = 12 * 60 * 60 * 1000;

export async function getHerdeckeSchools(): Promise<School[]> {
  if (cache && Date.now() - cache.at < TTL) return cache.schools;
  try {
    const res = await fetch(SCHULDATEN_CSV, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(15_000),
      next: { revalidate: 86_400 },
    } as RequestInit);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const lines = (await res.text()).split(/\r?\n/).filter(Boolean);

    const hIdx = lines.findIndex((l) => /Schulnummer;Schulform/i.test(l));
    if (hIdx < 0) throw new Error('header not found');
    const cols = parseCsvLine(lines[hIdx]!).map((c) => c.trim());
    const idx = (name: string) => cols.findIndex((c) => c.toLowerCase() === name.toLowerCase());
    const i = {
      form: idx('Schulform'),
      n1: idx('Schulbezeichnung_1'),
      plz: idx('PLZ'),
      str: idx('Strasse'),
      vw: idx('Telefonvorwahl'),
      tel: idx('Telefon'),
      mail: idx('E-Mail'),
      web: idx('Homepage'),
      gem: idx('Gemeindeschluessel'),
    };

    const schools: School[] = lines
      .slice(hIdx + 1)
      .map(parseCsvLine)
      .filter((f) => f[i.gem] === SCHOOL_AGS)
      .map((f) => {
        const form = (f[i.form] ?? '').trim();
        return {
          name: (f[i.n1] ?? '').trim(),
          form,
          formLabel: SCHULFORM[form] ?? 'Schule',
          street: (f[i.str] ?? '').trim(),
          plz: (f[i.plz] ?? '').trim(),
          phone: `${f[i.vw] ? `${f[i.vw]} ` : ''}${f[i.tel] ?? ''}`.trim(),
          email: (f[i.mail] ?? '').trim(),
          website: tidyUrl(f[i.web] ?? ''),
        };
      })
      .sort((a, b) => a.form.localeCompare(b.form) || a.name.localeCompare(b.name));

    cache = { at: Date.now(), schools };
    return schools;
  } catch {
    return cache?.schools ?? [];
  }
}

interface OpenHoliday {
  startDate: string;
  endDate: string;
  name: Array<{ language: string; text: string }>;
}

export async function getSchoolHolidays(monthsAhead = 14): Promise<Holiday[]> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const to = new Date();
    to.setMonth(to.getMonth() + monthsAhead);
    const validTo = to.toISOString().slice(0, 10);
    const url =
      `https://openholidaysapi.org/SchoolHolidays?countryIsoCode=DE&subdivisionCode=${city.state.code}` +
      `&languageIsoCode=DE&validFrom=${today}&validTo=${validTo}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
      next: { revalidate: 86_400 },
    } as RequestInit);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as OpenHoliday[];
    return data
      .map((h) => ({
        name: (h.name.find((n) => n.language === 'DE') ?? h.name[0])?.text ?? 'Ferien',
        start: h.startDate,
        end: h.endDate,
      }))
      .filter((h) => h.end >= today)
      .sort((a, b) => a.start.localeCompare(b.start));
  } catch {
    return [];
  }
}
