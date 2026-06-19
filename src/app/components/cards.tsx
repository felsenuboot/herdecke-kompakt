/** Live data cards for the "Digital.Herdecke" overview. All server components.
 *  KERN components (KernLink, Icon, Badge) are rendered here with serializable
 *  props — they hydrate as client islands inside these server-rendered cards. */
import Link from 'next/link';
import { KernLink, Badge, Icon } from './kern';
import { WarningsList } from './WarningsList';
import { getWeather, getWarnings } from '@/lib/sources/weather';
import { getRuhrLevel } from '@/lib/sources/pegel';
import { getAirQuality } from '@/lib/sources/air';
import { getSchoolHolidays } from '@/lib/sources/schools';
import { listUpcomingMeetings, fetchMeetingAgenda } from '@/sessionnet';
import { getT } from '@/lib/i18n-server';

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
          {href.startsWith('/') ? (
            <Link href={href} className="kern-link kern-link--small">
              {cta.replace(/\s*→\s*$/, '')}
              <Icon name="arrow-forward" aria-hidden={true} />
            </Link>
          ) : (
            <KernLink
              href={href}
              variant="small"
              title={cta.replace(/\s*→\s*$/, '')}
              icon={{ name: 'open-in-new' }}
              rel="noreferrer"
            />
          )}
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
  // Rendering + dismissal happen client-side (localStorage only); the server
  // only forwards the public DWD warnings — no user data leaves the browser.
  return <WarningsList warnings={warnings} />;
}

export async function WeatherCard() {
  const { t } = await getT();
  const [w, warnings] = await Promise.all([getWeather(), getWarnings()]);
  // Name the distinct warning events (e.g. "Gewitter", "Windböen") instead of
  // just counting them; colour each by its own severity.
  const events = [...new Set(warnings.map((x) => x.event))];
  return (
    <Card title={t('Wetter')} sub={w ? `Stand ${hm(w.when)}` : undefined}>
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
        <p className="muted">{t('Zurzeit nicht verfügbar.')}</p>
      )}
      {events.length > 0 && (
        <div className="wx-warns">
          {events.slice(0, 2).map((ev) => {
            const sev = warnings.find((x) => x.event === ev)?.severity ?? '';
            const danger = sev === 'severe' || sev === 'extreme';
            return <Badge key={ev} variant={danger ? 'danger' : 'warning'} showIcon title={ev} />;
          })}
          {events.length > 2 && (
            <span className="muted" style={{ fontSize: 12 }}>
              +{events.length - 2}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}

export async function AirCard() {
  const { t } = await getT();
  const a = await getAirQuality();
  if (!a) {
    return (
      <Card title={t('Luftqualität')} sub={t('Station Herdecke')}>
        <p className="muted">{t('Zurzeit nicht verfügbar.')}</p>
      </Card>
    );
  }
  return (
    <Card title={t('Luftqualität')} sub={`${t('Station Herdecke')} · ${hm(a.when)}`}>
      <div className="metric">
        <span className={`aqi aqi-${a.index}`} />
        <span className="metric-value-sm">{a.label}</span>
      </div>
      <p className="metric-detail">{t('Luftqualitätsindex (Umweltbundesamt)')}</p>
    </Card>
  );
}

export async function PegelCard() {
  const { t } = await getT();
  const p = await getRuhrLevel();
  const arrow = p?.trend === 'rising' ? '↑' : p?.trend === 'falling' ? '↓' : p?.trend === 'steady' ? '→' : '';
  return (
    <Card title={t('Ruhr-Pegel')} sub={p ? `Hattingen · ${hm(p.when)}` : undefined} href="https://www.pegelonline.wsv.de/gast/stammdaten?pegelnr=2790010" cta={t('Mehr beim WSV →')}>
      {p ? (
        <>
          <div className="metric">
            <span className="metric-value">
              {p.cm} cm {arrow}
            </span>
          </div>
          <p className="metric-detail">{t('Wasserstand der Ruhr (Pegel Hattingen)')}</p>
        </>
      ) : (
        <p className="muted">{t('Zurzeit nicht verfügbar.')}</p>
      )}
    </Card>
  );
}

export async function SchulferienCard() {
  const { t } = await getT();
  const holidays = await getSchoolHolidays();
  const next = holidays[0];
  if (!next) {
    return (
      <Card title={t('Schulferien NRW')} href="/schulen" cta={`${t('Schulen & Ferien')} →`}>
        <p className="muted">{t('Zurzeit nicht verfügbar.')}</p>
      </Card>
    );
  }
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
    <Card title={t('Schulferien NRW')} sub={ongoing ? 'aktuell' : 'nächste'} href="/schulen" cta={`${t('Schulen & Ferien')} →`}>
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
  const { t } = await getT();
  let next;
  try {
    next = (await listUpcomingMeetings({ months: 4 }))[0];
  } catch {
    next = undefined;
  }
  if (!next) {
    return (
      <Card title={t('Nächste Ratssitzung')} href="/sitzungen" cta={t('Alle Sitzungen →')}>
        <p className="muted">{t('Zurzeit keine Sitzung angekündigt.')}</p>
      </Card>
    );
  }
  const agenda = await fetchMeetingAgenda(next).catch(() => null);
  const items = (agenda?.items ?? []).filter((i) => i.subject).slice(0, 4);
  return (
    <Card title={t('Nächste Ratssitzung')} sub={`${next.committee} · ${dmy(next.date)}`} href={`/meetings/${next.ksinr}`} cta={t('Ganze Tagesordnung →')}>
      {items.length > 0 ? (
        <ul className="mini-agenda">
          {items.map((it, i) => (
            <li key={i}>{it.subject}</li>
          ))}
        </ul>
      ) : (
        <p className="muted">{t('Tagesordnung noch nicht veröffentlicht.')}</p>
      )}
    </Card>
  );
}
