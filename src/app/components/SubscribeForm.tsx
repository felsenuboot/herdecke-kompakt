'use client';

import { useState } from 'react';

export function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [keywords, setKeywords] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('sending');
    setMessage('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, keywords }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string; error?: string };
      if (res.ok && data.ok) {
        setState('ok');
        setMessage(data.message ?? 'Fast geschafft — bitte bestätige den Link in deiner E-Mail.');
        setEmail('');
        setKeywords('');
      } else {
        setState('err');
        setMessage(data.error ?? 'Da ist etwas schiefgelaufen. Bitte versuche es erneut.');
      }
    } catch {
      setState('err');
      setMessage('Netzwerkfehler. Bitte versuche es erneut.');
    }
  }

  return (
    <form className="subscribe" onSubmit={onSubmit}>
      <div>
        <label htmlFor="keywords">Deine Stichwörter</label>
        <input
          id="keywords"
          type="text"
          required
          placeholder="z. B. Bahnhofstraße, Radweg, Kita, Hengsteysee"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
        />
        <p className="hint">Mehrere mit Komma trennen. Groß-/Kleinschreibung und Umlaute sind egal.</p>
      </div>
      <div>
        <label htmlFor="email">E-Mail-Adresse</label>
        <input
          id="email"
          type="email"
          required
          placeholder="du@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <button className="btn" type="submit" disabled={state === 'sending'}>
          {state === 'sending' ? 'Wird gesendet…' : 'Benachrichtigungen abonnieren'}
        </button>
      </div>
      {message && <p className={`status ${state === 'ok' ? 'ok' : 'err'}`}>{message}</p>}
      <p className="hint">
        Doppelte Bestätigung (Double-Opt-In). Du kannst dich jederzeit mit einem Klick wieder abmelden. Wir
        speichern nur deine E-Mail und Stichwörter — siehe <a href="/datenschutz">Datenschutz</a>.
      </p>
    </form>
  );
}
