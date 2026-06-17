'use client';

import { useEffect, useState } from 'react';

interface Stop {
  id: string;
  name: string;
}
interface Departure {
  line: string;
  destination: string;
  product: string;
  plannedISO: string;
  estimatedISO: string | null;
  delayMin: number;
}
interface Board {
  stop: string;
  departures: Departure[];
}

const STORAGE_KEY = 'abfahrten-stop';

function hm(iso: string): string {
  return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' });
}

export function AbfahrtenBoard({ stops }: { stops: Stop[] }) {
  const [stopId, setStopId] = useState(stops[0]?.id ?? 'de:05954:2269');
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
      if (s?.id && stops.some((x) => x.id === s.id)) setStopId(s.id);
    } catch {
      /* ignore */
    }
  }, [stops]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setSaved(false);
    fetch(`/api/departures?stop=${encodeURIComponent(stopId)}`)
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
  }, [stopId]);

  const current = stops.find((s) => s.id === stopId);

  function saveDefault() {
    if (current) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: current.id, name: current.name }));
      setSaved(true);
    }
  }

  return (
    <div>
      <div className="muell-fields" style={{ maxWidth: 480 }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="stop">Haltestelle in Herdecke</label>
          <select id="stop" className="stop-select" value={stopId} onChange={(e) => setStopId(e.target.value)}>
            {stops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button type="button" className="btn" style={{ marginTop: 10 }} onClick={saveDefault}>
        {saved ? '✓ Als Standard gespeichert' : 'Als Standard für die Startseite'}
      </button>

      <div style={{ marginTop: 18 }}>
        {loading ? (
          <div className="skeleton" style={{ height: 120 }} />
        ) : board && board.departures.length > 0 ? (
          <ul className="dep-list dep-list-lg">
            {board.departures.map((d, i) => (
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
          <p className="muted">Zurzeit keine Abfahrten an dieser Haltestelle.</p>
        )}
      </div>
    </div>
  );
}
