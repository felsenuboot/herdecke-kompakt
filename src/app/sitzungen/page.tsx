import Link from 'next/link';
import { getCouncilProvider, type Meeting } from '@/lib/providers/council';
import { city } from '@/config/city';
import { getT } from '@/lib/i18n-server';
import { FlagStack } from '../components/FlagStack';

export const revalidate = 1800;
export const metadata = { title: 'Sitzungen — Digital.Herdecke' };

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return d && m && y ? `${d}.${m}.${y}` : iso;
}

export default async function SitzungenPage() {
  const { t } = await getT();
  const council = getCouncilProvider();
  let meetings: Meeting[] = [];
  let error: string | null = null;
  try {
    meetings = await council.listUpcomingMeetings({ months: 4 });
  } catch (err) {
    error = (err as Error).message;
  }

  return (
    <>
      <section className="hero" style={{ paddingBottom: 0 }}>
        <FlagStack />
        <h1 style={{ fontSize: 26 }}>{t('Kommende Ratssitzungen')}</h1>
        <p className="lead">
          {t('Rat, Ausschüsse und Gremien der Stadt Herdecke. Tagesordnungen erscheinen meist wenige Tage vor der Sitzung.')}
        </p>
      </section>

      <section className="section">
        {error ? (
          <p className="status err">Sitzungen konnten gerade nicht geladen werden ({error}).</p>
        ) : meetings.length === 0 ? (
          <p className="hint">{t('Zurzeit sind keine kommenden Sitzungen angekündigt.')}</p>
        ) : (
          <ul className="meeting-list">
            {meetings.map((m) => (
              <li key={m.ksinr}>
                <Link href={`/meetings/${m.ksinr}`}>
                  <span>{m.committee}</span>
                  <span className="date">{formatDate(m.date)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className="hint" style={{ marginTop: 12 }}>
          {t('Quelle:')}{' '}
          <a href={council.portalUrl} target="_blank" rel="noreferrer">
            Ratsinformationssystem der Stadt {city.name}
          </a>
          .
        </p>
      </section>
    </>
  );
}
