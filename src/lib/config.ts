/** Runtime configuration, read from the environment with dev-friendly defaults. */
export const config = {
  /** Public base URL, used to build confirm/unsubscribe links in emails. */
  appUrl: (process.env.APP_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
  /** Postgres connection string. If empty, a local JSON file store is used. */
  databaseUrl: process.env.DATABASE_URL ?? '',
  /** Resend API key. If empty, emails are logged to the console (dev mode). */
  resendApiKey: process.env.RESEND_API_KEY ?? '',
  /** From address for outgoing mail. Resend's sandbox sender works for testing. */
  emailFrom: process.env.EMAIL_FROM ?? 'Ratswatch Herdecke <onboarding@resend.dev>',
  /** Shared secret the Vercel cron must present (Authorization: Bearer …). */
  cronSecret: process.env.CRON_SECRET ?? '',
  /** How many months ahead to scan for meetings. */
  scanMonths: Number(process.env.SCAN_MONTHS ?? 4),
  /** Max keywords per subscription (abuse guard). */
  maxKeywords: 30,
};

export const emailEnabled = Boolean(config.resendApiKey);
export const usingPostgres = Boolean(config.databaseUrl);
