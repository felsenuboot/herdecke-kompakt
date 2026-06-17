import Link from 'next/link';
import { fetchMeetingAgenda, type MeetingAgenda } from '@/sessionnet';

export const revalidate = 1800;

export default async function MeetingPage({ params }: { params: Promise<{ ksinr: string }> }) {
  const { ksinr } = await params;
  const id = Number(ksinr);

  let agenda: MeetingAgenda | null = null;
  let error: string | null = null;
  if (!Number.isFinite(id)) {
    error = 'Ungültige Sitzungs-ID.';
  } else {
    try {
      agenda = await fetchMeetingAgenda(id);
    } catch (err) {
      error = (err as Error).message;
    }
  }

  return (
    <>
      <section className="hero" style={{ paddingBottom: 0 }}>
        <p className="hint" style={{ marginBottom: 8 }}>
          <Link href="/">← Alle Sitzungen</Link>
        </p>
        <h1 style={{ fontSize: 24 }}>{agenda ? agenda.title || agenda.committee : 'Sitzung'}</h1>
      </section>

      <section className="section">
        {error ? (
          <p className="status err">Tagesordnung konnte nicht geladen werden ({error}).</p>
        ) : !agenda || agenda.items.length === 0 ? (
          <p className="hint">Für diese Sitzung ist noch keine Tagesordnung veröffentlicht.</p>
        ) : (
          <ul className="agenda">
            {agenda.items.map((item, i) => (
              <li key={`${item.top}-${i}`}>
                <div className="top">TOP {item.top}</div>
                {item.subject ? (
                  <>
                    <div className="subject">{item.subject}</div>
                    <div className="meta">
                      {item.vorlageUrl && (
                        <a href={item.vorlageUrl} target="_blank" rel="noreferrer">
                          Vorlage ansehen
                        </a>
                      )}
                      {item.vorlageUrl && item.documentIds.length > 0 && ' · '}
                      {item.documentIds.length > 0 && (
                        <span className="hint">
                          {item.documentIds.length} Dokument{item.documentIds.length === 1 ? '' : 'e'}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="subject nonpublic">Nicht öffentlich</div>
                )}
              </li>
            ))}
          </ul>
        )}
        {agenda && (
          <p className="hint" style={{ marginTop: 16 }}>
            <a href={agenda.url} target="_blank" rel="noreferrer">
              Diese Sitzung im offiziellen Ratsinformationssystem öffnen
            </a>
          </p>
        )}
      </section>
    </>
  );
}
