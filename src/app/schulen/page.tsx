import { getHerdeckeSchools, getSchoolHolidays, type School } from '@/lib/sources/schools';
import { getT } from '@/lib/i18n-server';

export const revalidate = 86400;
export const metadata = { title: 'Schulen & Ferien — Digital.Herdecke' };

function dmy(iso: string): string {
  const [y, m, d] = iso.split('-');
  return d && m && y ? `${d}.${m}.${y}` : iso;
}

export default async function SchulenPage() {
  const { t } = await getT();
  const [schools, holidays] = await Promise.all([getHerdeckeSchools(), getSchoolHolidays()]);

  const groups: { label: string; items: School[] }[] = [];
  for (const s of schools) {
    let g = groups.find((x) => x.label === s.formLabel);
    if (!g) {
      g = { label: s.formLabel, items: [] };
      groups.push(g);
    }
    g.items.push(s);
  }

  return (
    <>
      <section className="hero" style={{ paddingBottom: 0 }}>
        <h1 style={{ fontSize: 26 }}>{t('Schulen & Ferien')}</h1>
        <p className="lead">{t('Alle Schulen in Herdecke und die kommenden Schulferien in Nordrhein-Westfalen.')}</p>
      </section>

      <section className="section">
        <h2>{t('Nächste Schulferien (NRW)')}</h2>
        {holidays.length === 0 ? (
          <p className="hint">Ferientermine zurzeit nicht verfügbar.</p>
        ) : (
          <ul className="holiday-list">
            {holidays.slice(0, 8).map((h) => (
              <li key={`${h.name}-${h.start}`}>
                <span className="holiday-name">{h.name}</span>
                <span className="holiday-dates">
                  {dmy(h.start)} – {dmy(h.end)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="section">
        <h2>{t('Schulen in Herdecke')} {schools.length > 0 && <span className="hint">({schools.length})</span>}</h2>
        {groups.length === 0 ? (
          <p className="hint">Schuldaten zurzeit nicht verfügbar.</p>
        ) : (
          groups.map((g) => (
            <div key={g.label} className="school-group">
              <h3 className="school-group-title">{g.label}</h3>
              <div className="school-grid">
                {g.items.map((s) => (
                  <div key={s.name} className="school">
                    <div className="school-name">{s.name}</div>
                    <div className="school-meta">
                      {s.street}, {s.plz} Herdecke
                    </div>
                    <div className="school-links">
                      {s.phone && <a href={`tel:${s.phone.replace(/\s/g, '')}`}>{s.phone}</a>}
                      {s.email && <a href={`mailto:${s.email}`}>E-Mail</a>}
                      {s.website && (
                        <a href={s.website} target="_blank" rel="noreferrer">
                          Website ↗
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
        <p className="hint" style={{ marginTop: 16 }}>
          Quellen:{' '}
          <a href="https://www.schulministerium.nrw/open-data" target="_blank" rel="noreferrer">
            Schulgrunddaten NRW (Schulministerium)
          </a>{' '}
          ·{' '}
          <a href="https://www.openholidaysapi.org/" target="_blank" rel="noreferrer">
            OpenHolidays API
          </a>
          . Ohne Gewähr.
        </p>
      </section>
    </>
  );
}
