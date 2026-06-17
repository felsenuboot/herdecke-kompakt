'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Pickup {
  type: string;
  date: string;
}
interface WasteResult {
  street: string;
  pickups: Pickup[];
  error?: string;
}

function fractionClass(type: string): { cls: string; emoji: string } {
  const t = type.toLowerCase();
  if (t.includes('rest')) return { cls: 'rest', emoji: '🗑️' };
  if (t.includes('bio')) return { cls: 'bio', emoji: '🟫' };
  if (t.includes('papier')) return { cls: 'papier', emoji: '📦' };
  if (t.includes('gelb') || t.includes('wertstoff') || t.includes('verpack')) return { cls: 'gelb', emoji: '🟡' };
  return { cls: 'other', emoji: '♻️' };
}
function fmtDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
}
function relative(iso: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((new Date(`${iso}T00:00:00`).getTime() - today.getTime()) / 86_400_000);
  if (days <= 0) return 'heute';
  if (days === 1) return 'morgen';
  if (days < 7) return `in ${days} Tagen`;
  return '';
}

/** Homepage waste card — shows the next collection for the saved address. */
export function AbfallCard() {
  const [addr, setAddr] = useState<{ strasse: string; hnr: string } | null>(null);
  const [result, setResult] = useState<WasteResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('muell-adresse') ?? 'null');
      if (saved?.strasse) setAddr({ strasse: saved.strasse, hnr: saved.hnr ?? '' });
      else setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!addr) return;
    let active = true;
    setLoading(true);
    fetch(`/api/waste?strasse=${encodeURIComponent(addr.strasse)}&hnr=${encodeURIComponent(addr.hnr)}`)
      .then((r) => r.json())
      .then((d: WasteResult) => {
        if (active) {
          setResult(d);
          setLoading(false);
        }
      })
      .catch(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [addr]);

  const firstDate = result?.pickups[0]?.date;
  const dueNext = result?.pickups.filter((p) => p.date === firstDate) ?? [];

  return (
    <div className="data-card">
      <div className="data-card-head">
        <h3>Müll-Wecker</h3>
        {addr && <span className="data-card-sub">{result?.street ?? addr.strasse}</span>}
      </div>
      <div className="data-card-body">
        {loading ? (
          <div className="skeleton" />
        ) : !addr ? (
          <p className="metric-detail" style={{ marginTop: 0 }}>
            Trage deine Straße ein, um hier die nächste Abfuhr zu sehen.
          </p>
        ) : firstDate ? (
          <div>
            <div className="muell-next-when">
              {fmtDate(firstDate)}
              {relative(firstDate) && <span className="muell-rel"> · {relative(firstDate)}</span>}
            </div>
            <div className="muell-types">
              {dueNext.map((p, i) => {
                const f = fractionClass(p.type);
                return (
                  <span key={i} className={`frac frac-${f.cls}`}>
                    {f.emoji} {p.type}
                  </span>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="muted">Keine Termine gefunden.</p>
        )}
      </div>
      <div className="data-card-foot">
        <Link href="/muell">{addr ? 'Alle Termine →' : 'Adresse eintragen →'}</Link>
      </div>
    </div>
  );
}
