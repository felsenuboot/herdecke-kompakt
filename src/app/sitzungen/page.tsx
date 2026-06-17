import Link from 'next/link';
import { listUpcomingMeetings, type Meeting } from '@/sessionnet';

export const revalidate = 1800;
export const metadata = { title: 'Sitzungen — Herdecke kompakt' };

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return d && m && y ? `${d}.${m}.${y}` : iso;
}

export default async function SitzungenPage() {
  let meetings: Meeting[] = [];
  let error: string | null = null;
  try {
    meetings = await listUpcomingMeetings({ months: 4 });
  } catch (err) {
    error = (err as Error).message;
  }

  return (
    <>
      <section className="hero" style={{ paddingBottom: 0 }}>
        <h1 style={{ fontSize: 26 }}>Kommende Ratssitzungen</h1>
        <p className="lead">Rat, Ausschüsse und Gremien der Stadt Herdecke. Tagesordnungen erscheinen meist wenige Tage vor der Sitzung.</p>
      </section>

      <section className="section">
        {error ? (
          <p className="status err">Sitzungen konnten gerade nicht geladen werden ({error}).</p>
        ) : meetings.length === 0 ? (
          <p className="hint">Zurzeit sind keine kommenden Sitzungen angekündigt.</p>
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
          Quelle:{' '}
          <a href="https://sessionnet.owl-it.de/herdecke/bi/" target="_blank" rel="noreferrer">
            Ratsinformationssystem der Stadt Herdecke
          </a>
          .
        </p>
      </section>
    </>
  );
}
