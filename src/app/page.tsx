import { Suspense } from 'react';
import { SubscribeForm } from './components/SubscribeForm';
import {
  WarningsBanner,
  WeatherCard,
  AirCard,
  PegelCard,
  SchulferienCard,
  NextMeetingCard,
  CardSkeleton,
} from './components/cards';
import { DeparturesCard } from './components/DeparturesCard';
import { AbfallCard } from './components/AbfallCard';
import { DashboardGrid } from './components/DashboardGrid';
import { config } from '@/lib/config';
import { getT } from '@/lib/i18n-server';
import { FlagStack } from './components/FlagStack';

// Render per request so the cards reflect current data; each source fetch is
// still cached briefly (see the source clients) to stay polite to the upstreams.
export const dynamic = 'force-dynamic';

export default async function Home() {
  const { t } = await getT();
  return (
    <>
      <section className="hero">
        <FlagStack />
        <h1>Herdecke</h1>
        <p className="lead">
          {t('Wetter, Verkehr, Ruhr-Pegel, Müllabfuhr und der Stadtrat — das Wichtigste aus Herdecke auf einen Blick.')}
        </p>
      </section>

      <Suspense fallback={null}>
        <WarningsBanner />
      </Suspense>

      <section className="section">
        <DashboardGrid
          items={[
            { id: 'wetter', node: <Suspense fallback={<CardSkeleton title={t('Wetter')} />}><WeatherCard /></Suspense> },
            { id: 'muell', node: <AbfallCard /> },
            { id: 'abfahrten', node: <DeparturesCard /> },
            { id: 'pegel', node: <Suspense fallback={<CardSkeleton title={t('Ruhr-Pegel')} />}><PegelCard /></Suspense> },
            { id: 'luft', node: <Suspense fallback={<CardSkeleton title={t('Luftqualität')} />}><AirCard /></Suspense> },
            { id: 'schulferien', node: <Suspense fallback={<CardSkeleton title={t('Schulferien NRW')} />}><SchulferienCard /></Suspense> },
            { id: 'rat', node: <Suspense fallback={<CardSkeleton title={t('Nächste Ratssitzung')} />}><NextMeetingCard /></Suspense> },
          ]}
        />
      </section>

      <section className="section">
        <div className="card">
          <h2>{t('Stichwort-Alarm für den Stadtrat')}</h2>
          <p className="lead" style={{ fontSize: 15 }}>
            {t(
              'Lass dich per E-Mail benachrichtigen, sobald deine Themen — eine Straße, „Radweg", „Kita", der Hengsteysee — auf einer Tagesordnung des Herdecker Rats erscheinen.',
            )}
          </p>
          {config.subscriptionsEnabled ? (
            <SubscribeForm />
          ) : (
            <p className="hint">
              {t('E-Mail-Benachrichtigungen werden bald freigeschaltet. Bis dahin findest du die Tagesordnungen unter')}{' '}
              <a href="/sitzungen">{t('Sitzungen')}</a>.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
