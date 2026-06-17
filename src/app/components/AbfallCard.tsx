'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useT } from './i18n';

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
function fmtDate(iso: string, bcp47: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(bcp47, { weekday: 'short', day: '2-digit', month: '2-digit' });
}
function relative(iso: string, bcp47: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((new Date(`${iso}T00:00:00`).getTime() - today.getTime()) / 86_400_000);
  if (days > 7) return '';
  return new Intl.RelativeTimeFormat(bcp47, { numeric: 'auto' }).format(days, 'day');
}

/** Homepage waste card — shows the next collection for the saved address. */
export function AbfallCard() {
  const { t, bcp47 } = useT();
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

  // Group pickups by date, keep the next two collection days.
  const groups: { date: string; types: string[] }[] = [];
  for (const p of result?.pickups ?? []) {
    const g = groups.find((x) => x.date === p.date);
    if (g) g.types.push(p.type);
    else groups.push({ date: p.date, types: [p.type] });
  }
  const nextTwo = groups.slice(0, 2);

  return (
    <div className="data-card">
      <div className="data-card-head">
        <h3>{t('Müll-Wecker')}</h3>
        {addr && <span className="data-card-sub">{result?.street ?? addr.strasse}</span>}
      </div>
      <div className="data-card-body">
        {loading ? (
          <div className="skeleton" />
        ) : !addr ? (
          <p className="metric-detail" style={{ marginTop: 0 }}>
            {t('Trage deine Straße ein, um hier die nächste Abfuhr zu sehen.')}
          </p>
        ) : nextTwo.length > 0 ? (
          <div className="muell-groups">
            {nextTwo.map((g, gi) => (
              <div key={g.date} className={`muell-grp${gi === 0 ? ' muell-grp-next' : ''}`}>
                <div className="muell-next-when">
                  {fmtDate(g.date, bcp47)}
                  {relative(g.date, bcp47) && <span className="muell-rel"> · {relative(g.date, bcp47)}</span>}
                </div>
                <div className="muell-types">
                  {g.types.map((type, i) => {
                    const f = fractionClass(type);
                    return (
                      <span key={i} className={`frac frac-${f.cls}`}>
                        {f.emoji} {t(type)}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">{t('Keine Termine gefunden.')}</p>
        )}
      </div>
      <div className="data-card-foot">
        <Link href="/muell">{addr ? t('Alle Termine →') : t('Adresse eintragen →')}</Link>
      </div>
    </div>
  );
}
