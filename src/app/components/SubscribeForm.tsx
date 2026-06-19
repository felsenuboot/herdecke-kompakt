'use client';

import { useState } from 'react';
import { useT } from './i18n';
import { TextInput, EmailInput, Button, Icon } from './kern';

const SUGGESTIONS = ['Bahnhofstraße', 'Radweg', 'Kita', 'Hengsteysee', 'Klimaschutz'];

export function SubscribeForm() {
  const { t } = useT();
  const [email, setEmail] = useState('');
  const [keywords, setKeywords] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const [message, setMessage] = useState('');

  function addKeyword(word: string) {
    setKeywords((prev) => {
      const parts = prev
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.some((p) => p.toLowerCase() === word.toLowerCase())) return prev;
      return [...parts, word].join(', ');
    });
  }

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
        <TextInput
          id="keywords"
          name="keywords"
          label={t('Deine Stichwörter')}
          hintText={t('Mehrere mit Komma trennen. Groß-/Kleinschreibung und Umlaute sind egal.')}
          placeholder={t('z. B. Bahnhofstraße, Radweg, Kita, Hengsteysee')}
          required
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
        />
        <div className="suggestions" style={{ marginTop: 10 }}>
          {SUGGESTIONS.map((w) => (
            <button key={w} type="button" className="suggestion" onClick={() => addKeyword(w)}>
              + {w}
            </button>
          ))}
        </div>
      </div>

      <EmailInput
        id="email"
        name="email"
        label={t('E-Mail-Adresse')}
        placeholder="du@example.com"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <div>
        <Button
          variant="primary"
          type="submit"
          disabled={state === 'sending'}
          icon={{ name: 'arrow-forward' }}
          text={state === 'sending' ? t('Wird gesendet…') : t('Benachrichtigungen abonnieren')}
        />
      </div>

      {message && (
        <div className={`status ${state === 'ok' ? 'ok' : 'err'}`} role={state === 'ok' ? 'status' : 'alert'}>
          <Icon name={state === 'ok' ? 'success' : 'danger'} aria-hidden={true} />
          <span>{message}</span>
        </div>
      )}

      <p className="hint">
        {t(
          'Doppelte Bestätigung (Double-Opt-In). Du kannst dich jederzeit mit einem Klick wieder abmelden. Wir speichern nur deine E-Mail und Stichwörter — siehe',
        )}{' '}
        <a className="hd-link" href="/datenschutz">
          {t('Datenschutz')}
        </a>
        .
      </p>
    </form>
  );
}
