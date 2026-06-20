/**
 * Air quality from the UBA station "Herdecke" (DENW014, id 1069, ~2.2 km),
 * via the keyless Umweltbundesamt Air Data API. Best-effort: the computed
 * index lags by an hour or two, so this returns null when no value is ready.
 */
import { fetchJson } from './http';
import { city } from '../../config/city';

const STATION_ID = city.sources.air.stationId;

export interface AirQuality {
  label: string;
  index: number; // 0 (sehr gut) … 4 (sehr schlecht)
  when: string;
}

const LABELS = ['sehr gut', 'gut', 'mäßig', 'schlecht', 'sehr schlecht'];

interface UbaAirQuality {
  // data[stationId][datetime] = [totalIndex, incomplete, [componentId, value, index, yval], …]
  data?: Record<string, Record<string, Array<string | number | unknown[]>>>;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getAirQuality(): Promise<AirQuality | null> {
  try {
    const now = new Date();
    const from = isoDate(new Date(now.getTime() - 86_400_000));
    const to = isoDate(now);
    const url =
      `https://www.umweltbundesamt.de/api/air_data/v2/airquality/json` +
      `?date_from=${from}&time_from=1&date_to=${to}&time_to=24&station=${STATION_ID}`;
    const d = await fetchJson<UbaAirQuality>(url, 1800);

    const station = d.data?.[STATION_ID];
    if (!station) return null;
    const times = Object.keys(station).sort();
    const latest = times[times.length - 1];
    if (!latest) return null;

    const index = Number(station[latest]?.[0]);
    if (!Number.isFinite(index) || index < 0) return null;

    return { label: LABELS[index] ?? 'unbekannt', index, when: latest };
  } catch {
    return null;
  }
}
