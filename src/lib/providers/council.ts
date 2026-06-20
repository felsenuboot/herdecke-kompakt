/**
 * Council / Ratsinformationssystem (RIS) provider.
 *
 * The interface is the stable contract the app + the scan job depend on;
 * concrete RIS systems are adapters selected by `city.sources.council.kind`
 * (SessionNet today; ALLRIS, OParl, Session/More-Rubin, … later). This is what
 * lets a second city run a different council portal without touching consumers.
 *
 * Relative imports (not the `@/` alias) so the tsx CLI (scan/pipeline) resolves it.
 */
import { city } from '../../config/city';
import * as sessionnet from '../../sessionnet';
import type { Meeting, AgendaItem, MeetingAgenda, RssItem } from '../../sessionnet';

export type { Meeting, AgendaItem, MeetingAgenda, RssItem };

export interface CouncilProvider {
  /** Public portal URL, for "view in the council information system" links. */
  readonly portalUrl: string;
  listMeetingsForMonth(year: number, month: number): Promise<Meeting[]>;
  listAnnouncedMeetings(from?: string): Promise<Meeting[]>;
  listUpcomingMeetings(opts?: { months?: number; from?: string }): Promise<Meeting[]>;
  fetchMeetingAgenda(meeting: Meeting | number): Promise<MeetingAgenda>;
  fetchRss(): Promise<RssItem[]>;
}

/** Adapter: Somacos SessionNet ("Bürgerinfo"), implemented in src/sessionnet.ts. */
const sessionNetProvider: CouncilProvider = {
  portalUrl: sessionnet.BASE_URL,
  listMeetingsForMonth: sessionnet.listMeetingsForMonth,
  listAnnouncedMeetings: sessionnet.listAnnouncedMeetings,
  listUpcomingMeetings: sessionnet.listUpcomingMeetings,
  fetchMeetingAgenda: sessionnet.fetchMeetingAgenda,
  fetchRss: sessionnet.fetchRss,
};

/** The council provider for the active city, selected by config. */
export function getCouncilProvider(): CouncilProvider {
  switch (city.sources.council.kind) {
    case 'sessionnet':
      return sessionNetProvider;
    default:
      throw new Error(`Unknown council provider kind: ${city.sources.council.kind}`);
  }
}
