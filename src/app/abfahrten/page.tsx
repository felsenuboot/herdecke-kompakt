import { getTransitProvider } from '@/lib/providers/transit';
import { AbfahrtenBoard } from '../components/AbfahrtenBoard';
import { getT } from '@/lib/i18n-server';
import { FlagStack } from '../components/FlagStack';

export const revalidate = 86400;
export const metadata = { title: 'Abfahrten — Digital.Herdecke' };

export default async function AbfahrtenPage() {
  const { t } = await getT();
  const stops = await getTransitProvider().getStops();
  return (
    <>
      <section className="hero" style={{ paddingBottom: 8 }}>
        <FlagStack />
        <h1 style={{ fontSize: 26 }}>{t('Abfahrten')}</h1>
        <p className="lead">
          {t(
            'Wähle deine Haltestelle in Herdecke und sieh die nächsten Bus- und Bahnabfahrten in Echtzeit. Du kannst eine Haltestelle als Standard für die Startseite speichern.',
          )}
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
