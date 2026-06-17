import { MuellForm } from '../components/MuellForm';
import { wasteInfo } from '@/lib/sources/waste';
import { getT } from '@/lib/i18n-server';

export const metadata = { title: 'Müll-Wecker — Digital.Herdecke' };

export default async function MuellPage() {
  const { t } = await getT();
  return (
    <>
      <section className="hero" style={{ paddingBottom: 8 }}>
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
          Datenquelle: <a href={wasteInfo.providerUrl} target="_blank" rel="noreferrer">AHE Ennepe-Ruhr</a> ·{' '}
          <a href={wasteInfo.calendarUrl} target="_blank" rel="noreferrer">offizieller Abfuhrkalender der Stadt Herdecke</a> (mit iCal-Export) ·{' '}
          <a href={wasteInfo.pdfUrl} target="_blank" rel="noreferrer">Jahres-PDF</a>. Ohne Gewähr — maßgeblich sind
          die offiziellen Angaben.
        </p>
      </section>
    </>
  );
}
