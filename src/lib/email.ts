import { config, emailEnabled } from './config';

export interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Send an email via Resend. In dev (no RESEND_API_KEY) it logs to the console
 * instead, so the whole flow is testable without an account or a domain.
 */
export async function sendEmail(msg: OutgoingEmail): Promise<void> {
  if (!emailEnabled) {
    console.log(`\n[email:dev] → ${msg.to}\n  Subject: ${msg.subject}\n${msg.text.replace(/^/gm, '  ')}\n`);
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: config.emailFrom, to: [msg.to], subject: msg.subject, html: msg.html, text: msg.text }),
  });
  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${await res.text()}`);
  }
}
