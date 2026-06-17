/** Weather + official DWD warnings for Herdecke, via the keyless Bright Sky API. */
import { fetchJson, HERDECKE } from './http';

export interface Weather {
  tempC: number;
  condition: string; // German label
  icon: string; // emoji
  windKmh: number;
  humidity: number;
  when: string;
}

export interface Warning {
  event: string;
  severity: string; // minor | moderate | severe | extreme
  headline: string;
  instruction?: string;
  start?: string;
  end?: string;
}

const ICONS: Record<string, string> = {
  'clear-day': '☀️',
  'clear-night': '🌙',
  'partly-cloudy-day': '⛅',
  'partly-cloudy-night': '☁️',
  cloudy: '☁️',
  fog: '🌫️',
  wind: '💨',
  rain: '🌧️',
  sleet: '🌨️',
  snow: '❄️',
  hail: '🌨️',
  thunderstorm: '⛈️',
};

const CONDITIONS: Record<string, string> = {
  dry: 'trocken',
  fog: 'Nebel',
  rain: 'Regen',
  sleet: 'Schneeregen',
  snow: 'Schnee',
  hail: 'Hagel',
  thunderstorm: 'Gewitter',
};

interface BrightSkyCurrent {
  weather: {
    temperature: number;
    condition: string;
    icon: string;
    wind_speed_10: number;
    relative_humidity: number;
    timestamp: string;
  };
}

export async function getWeather(): Promise<Weather | null> {
  try {
    const d = await fetchJson<BrightSkyCurrent>(
      `https://api.brightsky.dev/current_weather?lat=${HERDECKE.lat}&lon=${HERDECKE.lon}`,
      600,
    );
    const w = d.weather;
    return {
      tempC: w.temperature,
      condition: CONDITIONS[w.condition] ?? w.condition,
      icon: ICONS[w.icon] ?? '🌡️',
      windKmh: Math.round(w.wind_speed_10),
      humidity: w.relative_humidity,
      when: w.timestamp,
    };
  } catch {
    return null;
  }
}

interface BrightSkyAlerts {
  alerts: Array<{
    event_de?: string;
    event_en?: string;
    severity: string;
    headline_de?: string;
    headline_en?: string;
    instruction_de?: string;
    onset?: string;
    expires?: string;
  }>;
}

export async function getWarnings(): Promise<Warning[]> {
  try {
    const d = await fetchJson<BrightSkyAlerts>(
      `https://api.brightsky.dev/alerts?lat=${HERDECKE.lat}&lon=${HERDECKE.lon}`,
      600,
    );
    return (d.alerts ?? []).map((a) => ({
      event: a.event_de ?? a.event_en ?? 'Wetterwarnung',
      severity: a.severity,
      headline: a.headline_de ?? a.headline_en ?? '',
      instruction: a.instruction_de ?? undefined,
      start: a.onset,
      end: a.expires,
    }));
  } catch {
    return [];
  }
}
