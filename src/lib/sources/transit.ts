/** Live VRR departures + Herdecke stop directory, via the keyless EFA (rapidJSON). */
import { fetchJson } from './http';

const EFA = 'https://efa.vrr.de/vrr';
/** Herdecke Bahnhof — the default stop. */
export const DEFAULT_STOP = { id: 'de:05954:2269', name: 'Herdecke Bf' } as const;
/** Herdecke town centre, for the coordinate-based stop search. */
const CENTER = '7.4309:51.4006';

export interface Stop {
  id: string;
  name: string;
  distance?: number;
}

export interface Departure {
  line: string;
  destination: string;
  product: string;
  plannedISO: string;
  estimatedISO: string | null;
  delayMin: number;
}

export interface DepartureBoard {
  stop: string;
  departures: Departure[];
}

interface EfaLocation {
  id?: string;
  name?: string;
  disassembledName?: string;
  parent?: { name?: string };
  properties?: { distance?: string | number };
}

const FALLBACK_STOPS: Stop[] = [
  { id: 'de:05954:2269', name: 'Herdecke Bf' },
  { id: 'de:05954:2268', name: 'Herdecke Rathaus' },
  { id: 'de:05954:2253', name: 'Herdecke Mitte' },
];

let stopCache: { at: number; stops: Stop[] } | null = null;

/** All public-transport stops in Herdecke (coordinate search around the centre). */
export async function getHerdeckeStops(): Promise<Stop[]> {
  if (stopCache && Date.now() - stopCache.at < 24 * 60 * 60 * 1000) return stopCache.stops;
  try {
    // Herdecke's stops reach ~7.2 km from the centre (e.g. Schanze, Ahlenberg),
    // so search a 9 km radius and keep only stops whose locality is Herdecke.
    const url =
      `${EFA}/XML_COORD_REQUEST?outputFormat=rapidJSON&coord=${CENTER}:WGS84[DD.ddddd]` +
      `&coordOutputFormat=WGS84[DD.ddddd]&type_1=STOP&radius_1=9000&max=900&inclFilter=1`;
    const j = await fetchJson<{ locations?: EfaLocation[] }>(url, 86_400);
    const seen = new Set<string>();
    const stops: Stop[] = [];
    for (const s of j.locations ?? []) {
      if (!s.id || s.parent?.name !== 'Herdecke') continue;
      if (seen.has(s.id)) continue;
      seen.add(s.id);
      stops.push({
        id: s.id,
        name: s.disassembledName || s.name || s.id,
        distance: s.properties?.distance != null ? Number(s.properties.distance) : undefined,
      });
    }
    stops.sort((a, b) => a.name.localeCompare(b.name, 'de'));
    if (stops.length) {
      stopCache = { at: Date.now(), stops };
      return stops;
    }
    return FALLBACK_STOPS;
  } catch {
    return stopCache?.stops ?? FALLBACK_STOPS;
  }
}

interface EfaDm {
  locations?: Array<{ name?: string }>;
  stopEvents?: Array<{
    departureTimePlanned?: string;
    departureTimeEstimated?: string;
    transportation?: { number?: string; destination?: { name?: string }; product?: { name?: string } };
  }>;
}

/** Live departures from a stop, addressed by its EFA global id (or a name). */
export async function getDepartures(stop: string = DEFAULT_STOP.id, limit = 6): Promise<DepartureBoard | null> {
  try {
    const url =
      `${EFA}/XML_DM_REQUEST?outputFormat=rapidJSON&type_dm=stop&name_dm=${encodeURIComponent(stop)}` +
      `&useRealtime=1&mode=direct&limit=${limit}&itdDateTimeDepArr=dep`;
    const j = await fetchJson<EfaDm>(url, 45);
    return {
      stop: j.locations?.[0]?.name ?? stop,
      departures: (j.stopEvents ?? []).slice(0, limit).map((e) => {
        const planned = e.departureTimePlanned ?? '';
        const est = e.departureTimeEstimated ?? null;
        const delayMin = est && planned ? Math.round((Date.parse(est) - Date.parse(planned)) / 60000) : 0;
        return {
          line: e.transportation?.number ?? '',
          destination: e.transportation?.destination?.name ?? '',
          product: e.transportation?.product?.name ?? '',
          plannedISO: planned,
          estimatedISO: est,
          delayMin,
        };
      }),
    };
  } catch {
    return null;
  }
}
