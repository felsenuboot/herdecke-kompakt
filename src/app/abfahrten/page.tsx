import { getHerdeckeStops } from '@/lib/sources/transit';
import { AbfahrtenBoard } from '../components/AbfahrtenBoard';

export const revalidate = 86400;
export const metadata = { title: 'Abfahrten — Herdecke kompakt' };

export default async function AbfahrtenPage() {
  const stops = await getHerdeckeStops();
  return (
    <>
      <section className="hero" style={{ paddingBottom: 8 }}>
        <h1 style={{ fontSize: 26 }}>Abfahrten</h1>
        <p className="lead">
          Wähle deine Haltestelle in Herdecke und sieh die nächsten Bus- und Bahnabfahrten in Echtzeit. Du kannst
          eine Haltestelle als Standard für die Startseite speichern.
        </p>
      </section>

      <section className="section">
        <div className="card">
          <AbfahrtenBoard stops={stops} />
        </div>
        <p className="hint" style={{ marginTop: 14 }}>
          Daten: <a href="https://www.vrr.de" target="_blank" rel="noreferrer">VRR</a> (EFA), Echtzeit. Ohne Gewähr.
        </p>
      </section>
    </>
  );
}
