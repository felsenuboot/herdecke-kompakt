/** Live river water level near the city, via the keyless PegelOnline API (WSV). */
import { fetchJson } from './http';
import { city } from '../../config/city';

// The nearest WSV gauge to the city (configured per city).
const GAUGE_UUID = city.sources.pegel.gaugeUuid;
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
      `${BASE}/stations/${GAUGE_UUID}/W/currentmeasurement.json`,
      900,
    );

    let trend: RuhrLevel['trend'] = null;
    try {
      const series = await fetchJson<CurrentMeasurement[]>(
        `${BASE}/stations/${GAUGE_UUID}/W/measurements.json?start=PT6H`,
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

    return {
      station: city.sources.pegel.station,
      cm: cur.value,
      when: cur.timestamp,
      km: city.sources.pegel.distanceKm,
      trend,
    };
  } catch {
    return null;
  }
}
