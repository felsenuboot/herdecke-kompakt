/**
 * Impressum / responsible-party contact data.
 *
 * Read from environment variables so the **public repository contains no
 * personal data** (name, address, phone, e-mail live only in the Vercel project
 * env, never in git). Set these in Vercel → Settings → Environment Variables.
 * Locally, put them in `.env.local` (git-ignored) — see `.env.example`.
 */
export const contact = {
  name: process.env.IMPRESSUM_NAME ?? '[IMPRESSUM_NAME nicht gesetzt]',
  street: process.env.IMPRESSUM_STREET ?? '[IMPRESSUM_STREET nicht gesetzt]',
  city: process.env.IMPRESSUM_CITY ?? '[IMPRESSUM_CITY nicht gesetzt]',
  phone: process.env.IMPRESSUM_PHONE ?? '',
  email: process.env.IMPRESSUM_EMAIL ?? '',
};

/** base64 of a UTF-8 string — so no clean value ends up in the served HTML. */
export const b64 = (s: string): string => Buffer.from(s, 'utf8').toString('base64');

/** Human-readable, scraper-unfriendly e-mail (for the no-JS fallback). */
export const emailFallback = (e: string): string =>
  e ? e.replace(/@/g, ' [at] ').replace(/\./g, ' [punkt] ') : '';

/** Phone grouped in pairs with spaces, so there is no long digit run to harvest. */
export const phoneFallback = (p: string): string =>
  p ? p.replace(/\D/g, '').replace(/(\d{2})(?=\d)/g, '$1 ').trim() : '';
