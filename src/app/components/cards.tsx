/** Live data cards for the "Herdecke kompakt" overview. All server components. */
import Link from 'next/link';
import { getWeather, getWarnings } from '@/lib/sources/weather';
import { getRuhrLevel } from '@/lib/sources/pegel';
import { getAirQuality } from '@/lib/sources/air';
import { wasteInfo } from '@/lib/sources/waste';
import { getSchoolHolidays } from '@/lib/sources/schools';
import { listUpcomingMeetings, fetchMeetingAgenda } from '@/sessionnet';

function hm(iso: string): string {
  return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' });
}
function dmy(iso: string): string {
  const [y, m, d] = iso.split('-');
  return d && m && y ? `${d}.${m}.${y}` : iso;
}

function Card({
  title,
  sub,
  children,
  href,
  cta,
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="data-card">
      <div className="data-card-head">
        <h3>{title}</h3>
        {sub && <span className="data-card-sub">{sub}</span>}
      </div>
      <div className="data-card-body">{children}</div>
      {href && cta && (
        <div className="data-card-foot">
          {href.startsWith('/') ? <Link href={href}>{cta}</Link> : <a href={href} target="_blank" rel="noreferrer">{cta}</a>}
        </div>
      )}
    </div>
  );
}

export function CardSkeleton({ title }: { title: string }) {
  return (
    <div className="data-card">
      <div className="data-card-head">
        <h3>{title}</h3>
      </div>
      <div className="data-card-body">
        <div className="skeleton" />
      </div>
    </div>
  );
}

export async function WarningsBanner() {
  const warnings = await getWarnings();
  if (warnings.length === 0) return null;
  return (
    <div className="warn-banner">
      {warnings.map((w, i) => (
        <div key={i} className={`warn warn-${w.severity}`}>
          <strong>⚠️ {w.event}</strong>
          {w.headline && <span> — {w.headline}</span>}
          {w.instruction && <p className="warn-instruction">{w.instruction}</p>}
        </div>
      ))}
    </div>
  );
}

export async function WeatherCard() {
  const w = await getWeather();
  return (
    <Card title="Wetter" sub={w ? `Stand ${hm(w.when)}` : undefined}>
      {w ? (
        <>
          <div className="metric">
            <span className="metric-icon">{w.icon}</span>
            <span className="metric-value">{Math.round(w.tempC)}°C</span>
          </div>
          <p className="metric-detail">
            {w.condition} · Wind {w.windKmh} km/h · {w.humidity}% rF
          </p>
        </>
      ) : (
        <p className="muted">Zurzeit nicht verfügbar.</p>
      )}
    </Card>
  );
}

export async function AirCard() {
  const a = await getAirQuality();
  if (!a) return null; // best-effort: hide when no value is ready
  return (
    <Card title="Luftqualität" sub={`Station Herdecke · ${hm(a.when)}`}>
      <div className="metric">
        <span className={`aqi aqi-${a.index}`} />
        <span className="metric-value-sm">{a.label}</span>
      </div>
      <p className="metric-detail">Luftqualitätsindex (Umweltbundesamt)</p>
    </Card>
  );
}

export async function PegelCard() {
  const p = await getRuhrLevel();
  const arrow = p?.trend === 'rising' ? '↑' : p?.trend === 'falling' ? '↓' : p?.trend === 'steady' ? '→' : '';
  return (
    <Card title="Ruhr-Pegel" sub={p ? `Hattingen · ${hm(p.when)}` : undefined} href="https://www.pegelonline.wsv.de/gast/stammdaten?pegelnr=2790010" cta="Mehr beim WSV →">
      {p ? (
        <>
          <div className="metric">
            <span className="metric-value">
              {p.cm} cm {arrow}
            </span>
          </div>
          <p className="metric-detail">Wasserstand Ruhr, ~{p.km} km flussabwärts von Herdecke</p>
        </>
      ) : (
        <p className="muted">Zurzeit nicht verfügbar.</p>
      )}
    </Card>
  );
}

export function AbfallCard() {
  return (
    <Card title="Müll-Wecker" sub={wasteInfo.provider} href="/muell" cta="Meine Abfuhrtermine →">
      <p className="metric-detail" style={{ marginTop: 0 }}>
        Die nächsten Abfuhrtermine für deine Straße — Restabfall, Bio, Papier und Gelber Sack.
      </p>
    </Card>
  );
}

export async function SchulferienCard() {
  const holidays = await getSchoolHolidays();
  const next = holidays[0];
  if (!next) return null;
  const today = new Date().toISOString().slice(0, 10);
  const ongoing = next.start <= today;
  let note = '';
  if (ongoing) note = ' · läuft gerade';
  else {
    const days = Math.round(
      (new Date(`${next.start}T00:00:00`).getTime() - new Date(`${today}T00:00:00`).getTime()) / 86_400_000,
    );
    note = days === 1 ? ' · ab morgen' : ` · in ${days} Tagen`;
  }
  return (
    <Card title="Schulferien NRW" sub={ongoing ? 'aktuell' : 'nächste'} href="/schulen" cta="Schulen & Ferien →">
      <div className="metric">
        <span className="metric-value-sm">{next.name}</span>
      </div>
      <p className="metric-detail">
        {dmy(next.start)} – {dmy(next.end)}
        {note}
      </p>
    </Card>
  );
}

export async function NextMeetingCard() {
  let next;
  try {
    next = (await listUpcomingMeetings({ months: 4 }))[0];
  } catch {
    next = undefined;
  }
  if (!next) {
    return (
      <Card title="Nächste Ratssitzung" href="/sitzungen" cta="Alle Sitzungen →">
        <p className="muted">Zurzeit keine Sitzung angekündigt.</p>
      </Card>
    );
  }
  const agenda = await fetchMeetingAgenda(next).catch(() => null);
  const items = (agenda?.items ?? []).filter((i) => i.subject).slice(0, 4);
  return (
    <Card title="Nächste Ratssitzung" sub={`${next.committee} · ${dmy(next.date)}`} href={`/meetings/${next.ksinr}`} cta="Ganze Tagesordnung →">
      {items.length > 0 ? (
        <ul className="mini-agenda">
          {items.map((it, i) => (
            <li key={i}>{it.subject}</li>
          ))}
        </ul>
      ) : (
        <p className="muted">Tagesordnung noch nicht veröffentlicht.</p>
      )}
    </Card>
  );
}
