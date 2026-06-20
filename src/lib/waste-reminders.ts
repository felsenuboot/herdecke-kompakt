/**
 * Müll-Wecker pipeline: email confirmed waste subscribers the evening before a
 * collection. Reuses the same store + idempotency as the council alerts
 * (sent_alerts keyed by `waste:<date>` so a reminder is never sent twice).
 */
import { getStore } from './store';
import { getWasteProvider } from './providers/waste';
import { sendEmail } from './email';
import { renderWasteReminderEmail } from './render-email';

export interface WasteReminderResult {
  subscribers: number;
  emailsSent: number;
  errors: string[];
}

export async function runWasteReminders(): Promise<WasteReminderResult> {
  const store = await getStore();
  const subs = (await store.listConfirmed()).filter((s) => s.kind === 'waste' && s.street);
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

  const result: WasteReminderResult = { subscribers: subs.length, emailsSent: 0, errors: [] };

  for (const sub of subs) {
    try {
      const key = `waste:${tomorrow}`;
      if (await store.alreadySent(sub.id, key)) continue;

      const res = await getWasteProvider().getPickups(sub.street!, sub.hnr ?? '');
      const due = res.pickups.filter((p) => p.date === tomorrow);
      if (!due.length) continue;

      await sendEmail({ to: sub.email, ...renderWasteReminderEmail(sub, due, tomorrow) });
      await store.markSent(sub.id, key);
      result.emailsSent++;
    } catch (err) {
      result.errors.push(`${sub.email}: ${(err as Error).message}`);
    }
  }
  return result;
}
