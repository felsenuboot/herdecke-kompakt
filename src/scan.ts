/**
 * Ratswatch CLI — scan upcoming Herdecke council agendas for keywords.
 *
 *   npm run scan -- --keywords "Radweg,Kita,Klima,Straße" --months 4
 *   npm run scan -- --list                 # just list upcoming meetings
 *   npm run scan -- --keywords "Radweg" --json
 *
 * This is the same core (sessionnet + match) the scheduled job and the web app
 * will use; the CLI lets us verify extraction against the live portal.
 */

import { listUpcomingMeetings, fetchMeetingAgenda, type MeetingAgenda } from './sessionnet';
import { prepareKeywords, matchKeywords } from './match';

const DEFAULT_KEYWORDS = ['Radweg', 'Radverkehr', 'Kita', 'Klima', 'Straße', 'Schule', 'Baum', 'Hengstey', 'Spielplatz', 'Wohnen'];

interface Args {
  keywords: string[];
  months: number;
  list: boolean;
  json: boolean;
  delayMs: number;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { keywords: [], months: 4, list: false, json: false, delayMs: 300 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--keywords' || a === '-k') args.keywords = (argv[++i] ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    else if (a === '--months' || a === '-m') args.months = Math.max(1, Number(argv[++i]) || 4);
    else if (a === '--list' || a === '-l') args.list = true;
    else if (a === '--json') args.json = true;
    else if (a === '--delay') args.delayMs = Math.max(0, Number(argv[++i]) || 0);
  }
  if (args.keywords.length === 0) args.keywords = DEFAULT_KEYWORDS;
  return args;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Hit {
  meeting: MeetingAgenda;
  matches: { item: MeetingAgenda['items'][number]; keywords: string[] }[];
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  process.stderr.write(`Listing meetings for the next ${args.months} month(s)…\n`);
  const meetings = await listUpcomingMeetings({ months: args.months });

  if (args.list) {
    if (args.json) {
      console.log(JSON.stringify(meetings, null, 2));
    } else {
      console.log(`\nUpcoming meetings (${meetings.length}):\n`);
      for (const m of meetings) console.log(`  ${m.date}  ${m.committee}  →  ${m.url}`);
    }
    return;
  }

  const keywords = prepareKeywords(args.keywords);
  process.stderr.write(`Scanning ${meetings.length} meetings for: ${keywords.map((k) => k.raw).join(', ')}\n`);

  const hits: Hit[] = [];
  let scanned = 0;
  let itemsSeen = 0;

  for (const m of meetings) {
    let agenda: MeetingAgenda;
    try {
      agenda = await fetchMeetingAgenda(m);
    } catch (err) {
      process.stderr.write(`  ! ${m.committee} ${m.date}: ${(err as Error).message}\n`);
      continue;
    }
    scanned++;
    itemsSeen += agenda.items.length;

    const matches = agenda.items
      .map((item) => ({ item, keywords: matchKeywords(`${item.top} ${item.subject}`, keywords) }))
      .filter((x) => x.keywords.length > 0);

    if (matches.length) hits.push({ meeting: agenda, matches });
    await sleep(args.delayMs);
  }

  if (args.json) {
    console.log(JSON.stringify(hits, null, 2));
    return;
  }

  console.log(`\n━━ Ratswatch Herdecke ━━`);
  console.log(`Meetings scanned: ${scanned}/${meetings.length}   agenda items read: ${itemsSeen}   keywords: ${keywords.map((k) => k.raw).join(', ')}\n`);

  if (hits.length === 0) {
    console.log('No matches in the currently published agendas. (Agendas appear a few days before each meeting.)');
    return;
  }

  for (const hit of hits) {
    console.log(`\n📅  ${hit.meeting.committee} — ${hit.meeting.date}`);
    console.log(`    ${hit.meeting.url}`);
    for (const { item, keywords: kw } of hit.matches) {
      console.log(`    • TOP ${item.top}  [${kw.join(', ')}]`);
      console.log(`        ${item.subject}`);
      if (item.vorlageUrl) console.log(`        Vorlage: ${item.vorlageUrl}`);
      if (item.documentIds.length) console.log(`        ${item.documentIds.length} document(s)`);
    }
  }

  const totalMatches = hits.reduce((n, h) => n + h.matches.length, 0);
  console.log(`\n${totalMatches} matching agenda item(s) across ${hits.length} meeting(s).`);
}

main().catch((err) => {
  console.error('Fatal:', (err as Error).message);
  process.exit(1);
});
