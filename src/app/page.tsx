import { Suspense } from 'react';
import { SubscribeForm } from './components/SubscribeForm';
import {
  WarningsBanner,
  WeatherCard,
  AirCard,
  PegelCard,
  AbfallCard,
  SchulferienCard,
  NextMeetingCard,
  CardSkeleton,
} from './components/cards';
import { DeparturesCard } from './components/DeparturesCard';

// Render per request so the cards reflect current data; each source fetch is
// still cached briefly (see the source clients) to stay polite to the upstreams.
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <>
      <section className="hero">
        <h1>Herdecke kompakt</h1>
        <p className="lead">
          Wetter, Verkehr, Ruhr-Pegel, Müllabfuhr und der Stadtrat — das Wichtigste aus Herdecke auf einen Blick.
        </p>
      </section>

      <Suspense fallback={null}>
        <WarningsBanner />
      </Suspense>

      <section className="section">
        <div className="overview">
          <Suspense fallback={<CardSkeleton title="Wetter" />}>
            <WeatherCard />
          </Suspense>
          <DeparturesCard />
          <Suspense fallback={<CardSkeleton title="Ruhr-Pegel" />}>
            <PegelCard />
          </Suspense>
          <Suspense fallback={null}>
            <AirCard />
          </Suspense>
          <AbfallCard />
          <Suspense fallback={null}>
            <SchulferienCard />
          </Suspense>
          <Suspense fallback={<CardSkeleton title="Nächste Ratssitzung" />}>
            <NextMeetingCard />
          </Suspense>
        </div>
      </section>

      <section className="section">
        <div className="card">
          <h2>Stichwort-Alarm für den Stadtrat</h2>
          <p className="lead" style={{ fontSize: 15 }}>
            Lass dich per E-Mail benachrichtigen, sobald deine Themen — eine Straße, „Radweg", „Kita", der
            Hengsteysee — auf einer Tagesordnung des Herdecker Rats erscheinen.
          </p>
          <SubscribeForm />
        </div>
      </section>
    </>
  );
}
