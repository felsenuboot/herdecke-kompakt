/** Live Ruhr water level near Herdecke, via the keyless PegelOnline API (WSV). */
import { fetchJson } from './http';

// Hattingen is the nearest WSV Ruhr gauge to Herdecke (~18.7 km downstream).
const HATTINGEN_UUID = 'c0594fb5-77ff-4287-9b8d-7ff326afe9ff';
const BASE = 'https://www.pegelonline.wsv.de/webservices/rest-api/v2';

export interface RuhrLevel {
  station: string;
  cm: number;
  when: string;
  km: number;
  trend: 'rising' | 'falling' | 'steady' | null;
}

interface CurrentMeasurement {
  timestamp: string;
  value: number;
}

export async function getRuhrLevel(): Promise<RuhrLevel | null> {
  try {
    const cur = await fetchJson<CurrentMeasurement>(
      `${BASE}/stations/${HATTINGEN_UUID}/W/currentmeasurement.json`,
      900,
    );

    let trend: RuhrLevel['trend'] = null;
    try {
      const series = await fetchJson<CurrentMeasurement[]>(
        `${BASE}/stations/${HATTINGEN_UUID}/W/measurements.json?start=PT6H`,
        900,
      );
      if (series.length >= 2) {
        const first = series[0]!.value;
        const last = series[series.length - 1]!.value;
        trend = last > first + 2 ? 'rising' : last < first - 2 ? 'falling' : 'steady';
      }
    } catch {
      /* trend is optional */
    }

    return { station: 'Hattingen', cm: cur.value, when: cur.timestamp, km: 18.7, trend };
  } catch {
    return null;
  }
}
