'use client';

import { useEffect, useState } from 'react';

/**
 * Renders a contact datum (e-mail / phone / address) **without exposing a clean
 * machine-readable form in the static HTML**:
 *  - The value arrives base64-encoded (`enc`) — no `@`, `mailto:` or digit run.
 *  - With JavaScript it is decoded and shown as a proper clickable link.
 *  - Without JavaScript, a human-readable but scraper-unfriendly fallback is
 *    rendered via `<noscript>` (so the Impressum data stays legally reachable).
 */
function decode(enc: string): string {
  try {
    const bin = atob(enc);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return '';
  }
}

export function Contact({
  kind,
  enc,
  fallback,
}: {
  kind: 'email' | 'phone' | 'address';
  enc: string;
  fallback: string;
}) {
  const [value, setValue] = useState<string | null>(null);
  useEffect(() => setValue(decode(enc)), [enc]);

  if (value) {
    if (kind === 'email') return <a href={`mailto:${value}`}>{value}</a>;
    if (kind === 'phone') return <a href={`tel:${value.replace(/[^+\d]/g, '')}`}>{value}</a>;
    return <span>{value}</span>;
  }
  // SSR + no-JS: human-readable, harvest-unfriendly fallback.
  return <noscript>{fallback}</noscript>;
}
