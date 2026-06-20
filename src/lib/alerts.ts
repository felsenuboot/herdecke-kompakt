/**
 * The alert pipeline, shared by the cron route and the local CLI.
 *
 * For every upcoming meeting's agenda item, match it against each confirmed
 * subscription's keywords. Send one bundled email per subscriber, and record
 * each (subscriber, item) in `sent_alerts` so it's never re-sent.
 */

import { getCouncilProvider, type MeetingAgenda } from './providers/council';
import { prepareKeywords, matchKeywords } from '../match';
import { hashSubject } from './tokens';
import { sendEmail } from './email';
import { renderAlertEmail, type AlertMatch } from './render-email';
import { getStore } from './store';
import { config } from './config';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface ScanResult {
  meetings: number;
  itemsScanned: number;
  subscribers: number;
  emailsSent: number;
  matches: number;
  errors: string[];
}

export async function runScan(opts: { months?: number; delayMs?: number } = {}): Promise<ScanResult> {
  const council = getCouncilProvider();
  const months = opts.months ?? config.scanMonths;
  const delayMs = opts.delayMs ?? 300;
  const store = await getStore();
  const subs = (await store.listConfirmed()).filter((s) => s.kind === 'council');

  const result: ScanResult = {
    meetings: 0,
    itemsScanned: 0,
    subscribers: subs.length,
    emailsSent: 0,
    matches: 0,
    errors: [],
  };

  // No subscribers → don't scrape the council portal at all.
  if (subs.length === 0) return result;

  // Pre-compute folded keywords once per subscriber.
  const prepared = subs.map((sub) => ({ sub, keywords: prepareKeywords(sub.keywords) }));

  const perSub = new Map<string, AlertMatch[]>();
  const meetings = await council.listUpcomingMeetings({ months });
  result.meetings = meetings.length;

  for (const m of meetings) {
    let agenda: MeetingAgenda;
    try {
      agenda = await council.fetchMeetingAgenda(m);
    } catch (err) {
      result.errors.push(`${m.committee} ${m.date}: ${(err as Error).message}`);
      continue;
    }

    for (const item of agenda.items) {
      if (!item.subject) continue;
      result.itemsScanned++;
      const itemKey = `${item.ksinr}:${hashSubject(item.subject)}`;
      const haystack = `${item.top} ${item.subject}`;

      for (const { sub, keywords } of prepared) {
        if (sub.committees?.length && !sub.committees.includes(agenda.committee)) continue;
        const hits = matchKeywords(haystack, keywords);
        if (!hits.length) continue;
        if (await store.alreadySent(sub.id, itemKey)) continue;
        await store.markSent(sub.id, itemKey);
        const list = perSub.get(sub.id) ?? [];
        list.push({ meeting: agenda, item, keywords: hits });
        perSub.set(sub.id, list);
      }
    }
    await sleep(delayMs);
  }

  for (const { sub } of prepared) {
    const matches = perSub.get(sub.id);
    if (!matches?.length) continue;
    try {
      const mail = renderAlertEmail(sub, matches);
      await sendEmail({ to: sub.email, ...mail });
      result.emailsSent++;
      result.matches += matches.length;
    } catch (err) {
      result.errors.push(`email ${sub.email}: ${(err as Error).message}`);
    }
  }

  return result;
}
