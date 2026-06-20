/**
 * City configuration — the single place that makes this dashboard "Herdecke".
 *
 * To run the framework for another city you (almost) only change this object:
 * identity & branding, geography, the federal state, and the per-source provider
 * parameters. Operator/legal data deliberately stays in the environment (PII /
 * deployment-specific — see `src/lib/site.ts`), not here.
 */

export interface FlagStripes {
  /** Equal horizontal stripes, top → bottom (civil-flag colours; deliberately
   *  no coat of arms / protected municipal emblems). */
  stripes: string[];
}

export interface CityConfig {
  // ── Identity & branding ──
  slug: string;
  /** Display name of the city, e.g. "Herdecke". */
  name: string;
  /** Wordmark, rendered as `${prefix}.${suffix}` with the dot accented. */
  wordmark: { prefix: string; suffix: string };
  /** Public domain (share-link fallback), without protocol. */
  domain: string;
  /** Source repository — shown in the footer and sent as a contact in User-Agents. */
  repoUrl: string;
  /** Short app token for outbound User-Agent headers, e.g. "Digital.Herdecke/0.1". */
  userAgent: string;
  /** Single letter for the generated favicon. */
  faviconLetter: string;

  // ── Geography ──
  /** Town centre, for geo-located queries (weather, air, transit search). */
  center: { lat: number; lon: number };
  /** Amtlicher Gemeindeschlüssel (municipality key). */
  ags: string;
  /** Postal code(s) covering the municipality. */
  postalCodes: string[];
  /** Locality name used to filter the EFA stop search. */
  localityName: string;
  /** Federal state — scopes schools, holidays and the state flag. */
  state: { code: string; name: string } & FlagStripes;
  /** City flag (civil colours). */
  flag: FlagStripes;

  // ── Per-source provider parameters ──
  sources: {
    weather: { enabled: boolean };
    transit: {
      enabled: boolean;
      kind: 'efa';
      efaBaseUrl: string;
      defaultStop: { id: string; name: string };
      fallbackStops: { id: string; name: string }[];
      searchRadiusMeters: number;
    };
    pegel: {
      enabled: boolean;
      gaugeUuid: string;
      gaugeNumber: string;
      station: string;
      river: string;
      distanceKm: number;
    };
    air: { enabled: boolean; stationId: string };
    waste: {
      enabled: boolean;
      kind: 'ahe';
      links: { provider: string; calendarUrl: string; pdfUrl: string; providerUrl: string };
    };
    /** School directory — state-scoped via `state.code`. */
    schools: { enabled: boolean; kind: 'nrw' };
    /** School holidays — state-scoped via `state.code`. */
    holidays: { enabled: boolean };
    council: { enabled: boolean; kind: 'sessionnet'; baseUrl: string };
  };

  /** Optional SEO overrides. If unset, the page title suffix and meta
   *  description are derived from the active features (so a city without a
   *  river / council, with a differently-named river, or with more sources,
   *  gets correct metadata automatically). */
  seo?: { titleSuffix?: string; description?: string };
}

export const herdecke: CityConfig = {
  slug: 'herdecke',
  name: 'Herdecke',
  wordmark: { prefix: 'Digital', suffix: 'Herdecke' },
  domain: 'digital.herdecke',
  repoUrl: 'https://github.com/felsenuboot/herdecke-digital',
  userAgent: 'Digital.Herdecke/0.1',
  faviconLetter: 'H',

  center: { lat: 51.4006, lon: 7.4309 },
  ags: '05954020',
  postalCodes: ['58313'],
  localityName: 'Herdecke',
  state: { code: 'DE-NW', name: 'Nordrhein-Westfalen', stripes: ['#009A44', '#FFFFFF', '#DA121A'] },
  flag: { stripes: ['#DA121A', '#FFFFFF'] },

  sources: {
    weather: { enabled: true },
    transit: {
      enabled: true,
      kind: 'efa',
      efaBaseUrl: 'https://efa.vrr.de/vrr',
      defaultStop: { id: 'de:05954:2269', name: 'Herdecke Bf' },
      fallbackStops: [
        { id: 'de:05954:2269', name: 'Herdecke Bf' },
        { id: 'de:05954:2268', name: 'Herdecke Rathaus' },
        { id: 'de:05954:2253', name: 'Herdecke Mitte' },
      ],
      searchRadiusMeters: 9000,
    },
    pegel: {
      enabled: true,
      gaugeUuid: 'c0594fb5-77ff-4287-9b8d-7ff326afe9ff',
      gaugeNumber: '2790010',
      station: 'Hattingen',
      river: 'Ruhr',
      distanceKm: 18.7,
    },
    air: { enabled: true, stationId: '1069' },
    waste: {
      enabled: true,
      kind: 'ahe',
      links: {
        provider: 'AHE GmbH (Ennepe-Ruhr)',
        calendarUrl: 'https://www.herdecke.de/portal/seiten/abfuhrkalender-900000008-37460.html',
        pdfUrl: 'https://www.ahe.de/downloads/abfallkalender/herdecke.pdf',
        providerUrl: 'https://www.ahe.de/abfuhrtermine/herdecke/',
      },
    },
    schools: { enabled: true, kind: 'nrw' },
    holidays: { enabled: true },
    council: { enabled: true, kind: 'sessionnet', baseUrl: 'https://sessionnet.owl-it.de/herdecke/bi' },
  },
};

/** The active city. Later: select per deployment (env / `cities/<slug>.ts`). */
export const city = herdecke;

/** User-Agent for outbound open-data requests, with a contact URL. */
export const sourceUserAgent = `${city.userAgent} (open civic-tech; +${city.repoUrl})`;

/** Plain wordmark text, e.g. "Digital.Herdecke" (the accented dot is markup). */
export const wordmarkText = `${city.wordmark.prefix}.${city.wordmark.suffix}`;

const FEATURE_ORDER = ['weather', 'transit', 'pegel', 'air', 'waste', 'schools', 'council'] as const;

function featureLabel(key: (typeof FEATURE_ORDER)[number]): string {
  switch (key) {
    case 'weather':
      return 'Wetter & Warnungen';
    case 'transit':
      return 'Abfahrten';
    case 'pegel':
      return `${city.sources.pegel.river}-Pegel`;
    case 'air':
      return 'Luftqualität';
    case 'waste':
      return 'Müllabfuhr';
    case 'schools':
      return 'Schulen & Ferien';
    case 'council':
      return 'Stadtrat';
  }
}

/** Labels of the features this city actually has (enabled), in display order. */
export const activeFeatureLabels: string[] = FEATURE_ORDER.filter((k) => city.sources[k].enabled).map(featureLabel);

/** Page-title suffix + meta description — derived from the active features (or
 *  overridden per city via `city.seo`), so they adapt to each city's sources. */
export const metaTitleSuffix = city.seo?.titleSuffix ?? activeFeatureLabels.slice(0, 4).join(', ');
export const metaDescription =
  city.seo?.description ?? `Das Wichtigste aus ${city.name} auf einen Blick: ${activeFeatureLabels.join(', ')}.`;
