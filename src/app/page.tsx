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

// Render per request so the cards reflect current data; each source fetch is
// still cached briefly (see the source clients) to stay polite to the upstreams.
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <>
      <section className="hero">
        <h1>Herdecke</h1>
        <p className="lead">
          Wetter, Verkehr, Ruhr-Pegel, Müllabfuhr und der Stadtrat — das Wichtigste aus Herdecke auf einen Blick.
        </p>
      </section>

      <Suspense fallback={null}>
        <WarningsBanner />
      </Suspense>

      <section className="section">
        <DashboardGrid
          items={[
            { id: 'wetter', node: <Suspense fallback={<CardSkeleton title="Wetter" />}><WeatherCard /></Suspense> },
            { id: 'abfahrten', node: <DeparturesCard /> },
            { id: 'muell', node: <AbfallCard /> },
            { id: 'pegel', node: <Suspense fallback={<CardSkeleton title="Ruhr-Pegel" />}><PegelCard /></Suspense> },
            { id: 'luft', node: <Suspense fallback={<CardSkeleton title="Luftqualität" />}><AirCard /></Suspense> },
            { id: 'schulferien', node: <Suspense fallback={<CardSkeleton title="Schulferien NRW" />}><SchulferienCard /></Suspense> },
            { id: 'rat', node: <Suspense fallback={<CardSkeleton title="Nächste Ratssitzung" />}><NextMeetingCard /></Suspense> },
          ]}
        />
      </section>

      <section className="section">
        <div className="card">
          <h2>Stichwort-Alarm für den Stadtrat</h2>
          <p className="lead" style={{ fontSize: 15 }}>
            Lass dich per E-Mail benachrichtigen, sobald deine Themen — eine Straße, „Radweg", „Kita", der
            Hengsteysee — auf einer Tagesordnung des Herdecker Rats erscheinen.
          </p>
          {config.subscriptionsEnabled ? (
            <SubscribeForm />
          ) : (
            <p className="hint">
              E-Mail-Benachrichtigungen werden bald freigeschaltet. Bis dahin findest du die Tagesordnungen unter{' '}
              <a href="/sitzungen">Sitzungen</a>.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
