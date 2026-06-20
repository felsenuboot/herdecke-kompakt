import { config } from './config';
import type { Subscription } from './store';
import type { AgendaItem, MeetingAgenda } from './providers/council';
import type { Pickup } from './sources/waste-ahe';
import { wordmarkText } from '../config/city';

export interface AlertMatch {
  meeting: MeetingAgenda;
  item: AgendaItem;
  keywords: string[];
}

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const shell = (title: string, body: string, unsubUrl: string): string => `<!doctype html>
<html lang="de"><body style="font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;color:#1a1a1a;line-height:1.5;max-width:640px;margin:0 auto;padding:16px">
<h1 style="font-size:20px;margin:0 0 4px">${wordmarkText}</h1>
<p style="color:#555;font-size:13px;margin:0 0 20px">${esc(title)}</p>
${body}
<hr style="border:none;border-top:1px solid #eee;margin:24px 0">
<p style="color:#888;font-size:12px">Du erhältst diese E-Mail, weil du dich bei ${wordmarkText} angemeldet hast.
<a href="${unsubUrl}" style="color:#888">Abmelden</a> · <a href="${config.appUrl}" style="color:#888">${wordmarkText}</a></p>
</body></html>`;

/** Double opt-in confirmation email. */
export function renderConfirmEmail(sub: Subscription): { subject: string; html: string; text: string } {
  const confirmUrl = `${config.appUrl}/api/confirm?token=${sub.confirmToken}`;
  const unsubUrl = `${config.appUrl}/api/unsubscribe?token=${sub.unsubToken}`;
  const kw = sub.keywords.join(', ');
  const subject = `Bitte bestätige deine Anmeldung bei ${wordmarkText}`;
  const body = `
<p>Fast geschafft! Bestätige deine Anmeldung, dann benachrichtigen wir dich, sobald eines deiner Stichwörter auf einer Tagesordnung des Herdecker Rats erscheint.</p>
<p><strong>Deine Stichwörter:</strong> ${esc(kw)}</p>
<p><a href="${confirmUrl}" style="display:inline-block;background:#1f6feb;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">Anmeldung bestätigen</a></p>
<p style="color:#888;font-size:12px">Falls du das nicht warst, ignoriere diese E-Mail einfach.</p>`;
  const text = `${wordmarkText} — Anmeldung bestätigen

Bestätige deine Anmeldung: ${confirmUrl}

Deine Stichwörter: ${kw}

Falls du das nicht warst, ignoriere diese E-Mail.
Abmelden: ${unsubUrl}`;
  return { subject, html: shell('Anmeldung bestätigen', body, unsubUrl), text };
}

/** Alert email bundling all of a subscriber's new matches from one scan. */
export function renderAlertEmail(sub: Subscription, matches: AlertMatch[]): { subject: string; html: string; text: string } {
  const unsubUrl = `${config.appUrl}/api/unsubscribe?token=${sub.unsubToken}`;
  const n = matches.length;
  const subject =
    n === 1
      ? '1 neues Thema auf einer Herdecker Tagesordnung'
      : `${n} neue Themen auf Herdecker Tagesordnungen`;

  // Group matches by meeting.
  const byMeeting = new Map<number, { meeting: MeetingAgenda; items: AlertMatch[] }>();
  for (const m of matches) {
    const g = byMeeting.get(m.meeting.ksinr) ?? { meeting: m.meeting, items: [] };
    g.items.push(m);
    byMeeting.set(m.meeting.ksinr, g);
  }

  const htmlParts: string[] = [];
  const textParts: string[] = [];
  for (const { meeting, items } of byMeeting.values()) {
    htmlParts.push(
      `<h2 style="font-size:16px;margin:20px 0 6px">${esc(meeting.committee)} — ${esc(meeting.date)}</h2>`,
    );
    textParts.push(`\n${meeting.committee} — ${meeting.date}\n${meeting.url}`);
    for (const { item, keywords } of items) {
      const link = item.vorlageUrl ?? meeting.url;
      htmlParts.push(
        `<p style="margin:0 0 12px"><span style="background:#fff3cd;border-radius:3px;padding:0 4px">${esc(keywords.join(', '))}</span><br>
<strong>TOP ${esc(item.top)}</strong> — <a href="${link}">${esc(item.subject)}</a></p>`,
      );
      textParts.push(`  • [${keywords.join(', ')}] TOP ${item.top}: ${item.subject}\n    ${link}`);
    }
  }

  const body = `<p>Es gibt neue Tagesordnungspunkte zu deinen Stichwörtern:</p>${htmlParts.join('\n')}`;
  const text = `${wordmarkText} — neue Treffer zu deinen Stichwörtern:\n${textParts.join('\n')}\n\nAbmelden: ${unsubUrl}`;
  return { subject, html: shell('Neue Treffer zu deinen Stichwörtern', body, unsubUrl), text };
}

// ── Müll-Wecker (waste reminders) ───────────────────────────────────────────

function fractionEmoji(type: string): string {
  const t = type.toLowerCase();
  if (t.includes('rest')) return '🗑️';
  if (t.includes('bio')) return '🟫';
  if (t.includes('papier')) return '📦';
  if (t.includes('gelb') || t.includes('wertstoff') || t.includes('verpack')) return '🟡';
  return '♻️';
}

function fmtDeLong(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit' });
}

/** Double opt-in confirmation for the Müll-Wecker. */
export function renderWasteConfirmEmail(sub: Subscription): { subject: string; html: string; text: string } {
  const confirmUrl = `${config.appUrl}/api/confirm?token=${sub.confirmToken}`;
  const unsubUrl = `${config.appUrl}/api/unsubscribe?token=${sub.unsubToken}`;
  const addr = `${sub.street ?? ''} ${sub.hnr ?? ''}`.trim();
  const subject = 'Bitte bestätige deinen Müll-Wecker';
  const body = `
<p>Fast geschafft! Bestätige deine Anmeldung, dann erinnern wir dich am Vorabend an die Abfuhrtermine für <strong>${esc(addr)}</strong>.</p>
<p><a href="${confirmUrl}" style="display:inline-block;background:#1f6feb;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">Müll-Wecker bestätigen</a></p>
<p style="color:#888;font-size:12px">Falls du das nicht warst, ignoriere diese E-Mail einfach.</p>`;
  const text = `${wordmarkText} — Müll-Wecker bestätigen

Bestätige deine Anmeldung: ${confirmUrl}

Adresse: ${addr}

Falls du das nicht warst, ignoriere diese E-Mail.
Abmelden: ${unsubUrl}`;
  return { subject, html: shell('Müll-Wecker bestätigen', body, unsubUrl), text };
}

/** The evening-before reminder. */
export function renderWasteReminderEmail(
  sub: Subscription,
  pickups: Pickup[],
  dateISO: string,
): { subject: string; html: string; text: string } {
  const unsubUrl = `${config.appUrl}/api/unsubscribe?token=${sub.unsubToken}`;
  const addr = `${sub.street ?? ''} ${sub.hnr ?? ''}`.trim();
  const types = pickups.map((p) => p.type);
  const subject = `Morgen: ${types.join(' + ')} 🗑️`;
  const list = pickups.map((p) => `${fractionEmoji(p.type)} ${esc(p.type)}`).join('<br>');
  const body = `
<p><strong>${esc(fmtDeLong(dateISO))}</strong> wird in <strong>${esc(addr)}</strong> abgeholt:</p>
<p style="font-size:17px;line-height:1.8">${list}</p>
<p style="color:#888;font-size:12px">Bitte die Tonnen heute Abend bereitstellen.</p>`;
  const text = `${wordmarkText} — Müll-Wecker

Morgen (${fmtDeLong(dateISO)}) wird in ${addr} abgeholt:
${types.map((t) => `  • ${t}`).join('\n')}

Abmelden: ${unsubUrl}`;
  return { subject, html: shell('Erinnerung an die Müllabfuhr', body, unsubUrl), text };
}
