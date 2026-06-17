'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useT } from './i18n';

interface Departure {
  line: string;
  destination: string;
  plannedISO: string;
  estimatedISO: string | null;
  delayMin: number;
}
interface Board {
  stop: string;
  departures: Departure[];
}

const DEFAULT = { id: 'de:05954:2269', name: 'Herdecke Bf' };
const STORAGE_KEY = 'abfahrten-stop';

function hm(iso: string): string {
  return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' });
}

/** Homepage departures card — honours the user's saved default stop. */
export function DeparturesCard() {
  const { t } = useT();
  const [stop, setStop] = useState(DEFAULT);
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
      if (saved?.id) setStop(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/departures?stop=${encodeURIComponent(stop.id)}`)
      .then((r) => r.json())
      .then((d: Board) => {
        if (active) {
          setBoard(d);
          setLoading(false);
        }
      })
      .catch(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [stop.id]);

  const stopName = (board?.stop || stop.name).replace(/^Herdecke,\s*/, '');

  return (
    <div className="data-card">
      <div className="data-card-head">
        <h3>{t('Nächste Abfahrten')}</h3>
        <span className="data-card-sub">{stopName}</span>
      </div>
      <div className="data-card-body">
        {loading ? (
          <div className="skeleton" />
        ) : board && board.departures.length > 0 ? (
          <ul className="dep-list">
            {board.departures.slice(0, 5).map((d, i) => (
              <li key={i}>
                <span className="dep-line">{d.line}</span>
                <span className="dep-dest">{d.destination}</span>
                <span className="dep-time">
                  {hm(d.estimatedISO ?? d.plannedISO)}
                  {d.delayMin > 0 && <span className="dep-delay"> +{d.delayMin}</span>}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">{t('Zurzeit keine Abfahrten.')}</p>
        )}
      </div>
      <div className="data-card-foot">
        <Link href="/abfahrten">{t('Haltestelle wählen →')}</Link>
      </div>
    </div>
  );
}
