'use client';

import { useEffect, useState } from 'react';
import { useT } from './i18n';
import { TextInput, EmailInput, Button, Icon } from './kern';

interface Pickup {
  type: string;
  date: string;
}
interface WasteResult {
  street: string;
  pickups: Pickup[];
  suggestions?: string[];
  error?: string;
}

function fraction(type: string) {
  const t = type.toLowerCase();
  if (t.includes('rest')) return { cls: 'rest', emoji: '🗑️' };
  if (t.includes('bio')) return { cls: 'bio', emoji: '🟫' };
  if (t.includes('papier')) return { cls: 'papier', emoji: '📦' };
  if (t.includes('gelb') || t.includes('wertstoff') || t.includes('verpack')) return { cls: 'gelb', emoji: '🟡' };
  return { cls: 'other', emoji: '♻️' };
}

function fmtDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
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

export function MuellForm() {
  const { t } = useT();
  const [strasse, setStrasse] = useState('');
  const [hnr, setHnr] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [result, setResult] = useState<WasteResult | null>(null);
  const [remEmail, setRemEmail] = useState('');
  const [remState, setRemState] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const [remMsg, setRemMsg] = useState('');
  const [geoState, setGeoState] = useState<'idle' | 'locating' | 'err'>('idle');
  const [geoMsg, setGeoMsg] = useState('');

  // Remember the last address for convenience.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('muell-adresse') ?? '{}');
      if (saved.strasse) setStrasse(saved.strasse);
      if (saved.hnr) setHnr(saved.hnr);
    } catch {
      /* ignore */
    }
  }, []);

  async function lookup(street: string, number: string) {
    setState('loading');
    setResult(null);
    try {
      const res = await fetch(`/api/waste?strasse=${encodeURIComponent(street)}&hnr=${encodeURIComponent(number)}`);
      const data = (await res.json()) as WasteResult;
      setResult(data);
      if (data.pickups.length > 0) {
        localStorage.setItem('muell-adresse', JSON.stringify({ strasse: street, hnr: number }));
      }
    } catch {
      setResult({ street, pickups: [], error: 'Netzwerkfehler. Bitte erneut versuchen.' });
    } finally {
      setState('done');
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void lookup(strasse, hnr);
  }

  async function subscribeReminder(e: React.FormEvent) {
    e.preventDefault();
    setRemState('sending');
    setRemMsg('');
    try {
      const res = await fetch('/api/waste/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: remEmail, strasse: result?.street ?? strasse, hnr }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string; error?: string };
      if (res.ok && data.ok) {
        setRemState('ok');
        setRemMsg(data.message ?? 'Bitte bestätige den Link in deiner E-Mail.');
        setRemEmail('');
      } else {
        setRemState('err');
        setRemMsg(data.error ?? 'Anmeldung fehlgeschlagen.');
      }
    } catch {
      setRemState('err');
      setRemMsg('Netzwerkfehler. Bitte erneut versuchen.');
    }
  }

  function useMyLocation() {
    if (!('geolocation' in navigator)) {
      setGeoState('err');
      setGeoMsg('Standortbestimmung wird von deinem Browser nicht unterstützt.');
      return;
    }
    setGeoState('locating');
    setGeoMsg('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`/api/geocode?lat=${latitude}&lon=${longitude}`);
          const data = (await res.json()) as { strasse?: string; hnr?: string; error?: string };
          if (res.ok && data.strasse) {
            setStrasse(data.strasse);
            setHnr(data.hnr ?? '');
            setGeoState('idle');
            void lookup(data.strasse, data.hnr ?? '');
          } else {
            setGeoState('err');
            setGeoMsg(data.error ?? 'Adresse konnte nicht bestimmt werden.');
          }
        } catch {
          setGeoState('err');
          setGeoMsg('Adresse konnte nicht bestimmt werden.');
        }
      },
      () => {
        setGeoState('err');
        setGeoMsg('Standortzugriff wurde abgelehnt.');
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  // Group pickups by date (a day can have several fractions).
  const byDate = new Map<string, string[]>();
  for (const p of result?.pickups ?? []) {
    const list = byDate.get(p.date) ?? [];
    list.push(p.type);
    byDate.set(p.date, list);
  }
  const days = [...byDate.entries()];

  return (
    <div className="muell">
      <form className="muell-form" onSubmit={onSubmit}>
        <div className="muell-fields">
          <div style={{ flex: 3 }}>
            <TextInput
              id="strasse"
              name="strasse"
              label={t('Straße in Herdecke')}
              placeholder="z. B. Hauptstraße"
              required
              value={strasse}
              onChange={(e) => setStrasse(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <TextInput
              id="hnr"
              name="hnr"
              label={t('Nr.')}
              placeholder="12"
              value={hnr}
              onChange={(e) => setHnr(e.target.value)}
            />
          </div>
        </div>
        <div className="muell-actions">
          <Button
            variant="primary"
            type="submit"
            disabled={state === 'loading'}
            icon={{ name: 'search' }}
            iconLeft={true}
            text={state === 'loading' ? t('Suche…') : t('Abfuhrtermine anzeigen')}
          />
          <Button
            variant="secondary"
            type="button"
            onClick={useMyLocation}
            disabled={geoState === 'locating'}
            text={geoState === 'locating' ? t('Standort…') : t('📍 Meinen Standort verwenden')}
          />
        </div>
        {geoMsg && (
          <div className="status err" role="alert" style={{ marginTop: 10 }}>
            <Icon name="danger" aria-hidden={true} />
            <span>{geoMsg}</span>
          </div>
        )}
      </form>

      {result?.error && (
        <div className="status err" role="alert" style={{ marginTop: 14 }}>
          <Icon name="danger" aria-hidden={true} />
          <span>{result.error}</span>
        </div>
      )}

      {result?.suggestions && result.suggestions.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <p className="hint">{t('Meintest du:')}</p>
          <div className="suggestions">
            {result.suggestions.map((s) => (
              <button
                key={s}
                type="button"
                className="suggestion"
                onClick={() => {
                  setStrasse(s);
                  void lookup(s, hnr);
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {days.length > 0 && (
        <>
          <p className="hint" style={{ marginTop: 16 }}>
            Nächste Abfuhrtermine für <strong>{result?.street}</strong>:
          </p>
          <ul className="muell-list">
            {days.map(([date, types], i) => (
              <li key={date} className={i === 0 ? 'next' : undefined}>
                <div className="muell-date">
                  <span className="muell-day">{fmtDate(date)}</span>
                  {relative(date) && <span className="muell-rel">{relative(date)}</span>}
                </div>
                <div className="muell-types">
                  {types.map((t, k) => {
                    const f = fraction(t);
                    return (
                      <span key={k} className={`frac frac-${f.cls}`}>
                        {f.emoji} {t}
                      </span>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {days.length > 0 &&
        (process.env.NEXT_PUBLIC_SUBSCRIPTIONS_ENABLED === 'true' ? (
        <form className="muell-reminder" onSubmit={subscribeReminder}>
          <p className="muell-reminder-title">📧 Erinnerung am Vorabend</p>
          <p className="hint" style={{ marginTop: 0 }}>
            Wir schicken dir am Abend vorher eine E-Mail, wenn am nächsten Morgen abgeholt wird — für{' '}
            <strong>
              {result?.street} {hnr}
            </strong>
            .
          </p>
          <div className="muell-fields">
            <div style={{ flex: 1 }}>
              <EmailInput
                id="remEmail"
                name="remEmail"
                label="E-Mail-Adresse"
                placeholder="du@example.com"
                required
                value={remEmail}
                onChange={(e) => setRemEmail(e.target.value)}
              />
            </div>
          </div>
          <Button
            variant="primary"
            type="submit"
            disabled={remState === 'sending'}
            text={remState === 'sending' ? 'Wird gesendet…' : 'Erinnerung aktivieren'}
          />
          {remMsg && (
            <div className={`status ${remState === 'ok' ? 'ok' : 'err'}`} role={remState === 'ok' ? 'status' : 'alert'} style={{ marginTop: 10 }}>
              <Icon name={remState === 'ok' ? 'success' : 'danger'} aria-hidden={true} />
              <span>{remMsg}</span>
            </div>
          )}
          <p className="hint">
            Double-Opt-In, jederzeit mit einem Klick abbestellbar. Siehe{' '}
            <a className="hd-link" href="/datenschutz">
              Datenschutz
            </a>
            .
          </p>
        </form>
        ) : (
          <p className="hint" style={{ marginTop: 18 }}>
            📧 E-Mail-Erinnerungen am Vorabend folgen bald.
          </p>
        ))}
    </div>
  );
}
