'use client';

import { useState } from 'react';

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = typeof window !== 'undefined' ? window.location.origin : 'https://digital.herdecke';
    const data = {
      title: 'Digital.Herdecke',
      text: 'Digital.Herdecke — das Wichtigste aus Herdecke auf einen Blick',
      url,
    };
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user cancelled or clipboard blocked */
    }
  }

  return (
    <button type="button" className="linklike" onClick={share}>
      {copied ? 'Link kopiert ✓' : 'Teilen'}
    </button>
  );
}
