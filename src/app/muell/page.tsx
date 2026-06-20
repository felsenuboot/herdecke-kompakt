import { MuellForm } from '../components/MuellForm';
import { getWasteProvider } from '@/lib/providers/waste';
import { city } from '@/config/city';
import { getT } from '@/lib/i18n-server';
import { FlagStack } from '../components/FlagStack';

export const metadata = { title: 'Müll-Wecker — Digital.Herdecke' };

export default async function MuellPage() {
  const { t } = await getT();
  const waste = getWasteProvider();
  return (
    <>
      <section className="hero" style={{ paddingBottom: 8 }}>
        <FlagStack />
        <h1 style={{ fontSize: 26 }}>{t('Müll-Wecker')}</h1>
        <p className="lead">
          {t(
            'Wann wird in deiner Straße abgeholt? Gib deine Adresse ein und sieh die nächsten Termine für Restabfall, Bioabfall, Papier und Gelben Sack.',
          )}
        </p>
      </section>

      <section className="section">
        <div className="card">
          <MuellForm />
        </div>
        <p className="hint" style={{ marginTop: 14 }}>
          Datenquelle: <a href={waste.info.providerUrl} target="_blank" rel="noreferrer">{waste.info.provider}</a> ·{' '}
          <a href={waste.info.calendarUrl} target="_blank" rel="noreferrer">offizieller Abfuhrkalender der Stadt {city.name}</a> (mit iCal-Export) ·{' '}
          <a href={waste.info.pdfUrl} target="_blank" rel="noreferrer">Jahres-PDF</a>. Ohne Gewähr — maßgeblich sind
          die offiziellen Angaben.
        </p>
      </section>
    </>
  );
}
