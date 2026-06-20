/**
 * School directory + school holidays provider.
 *
 * The directory is state-specific (NRW adapter today, selected by
 * `city.sources.schools.kind`); holidays are national (OpenHolidays, scoped by
 * `city.state.code`) but exposed through the same provider for convenience.
 * Relative imports so the build + any tsx consumer resolve it.
 */
import { city } from '../../config/city';
import * as nrw from '../sources/schools';
import type { School, Holiday } from '../sources/schools';

export type { School, Holiday };

export interface SchoolProvider {
  getSchools(): Promise<School[]>;
  getHolidays(monthsAhead?: number): Promise<Holiday[]>;
}

/** Adapter: NRW Schulgrunddaten CSV, implemented in src/lib/sources/schools.ts. */
const nrwProvider: SchoolProvider = {
  getSchools: nrw.getHerdeckeSchools,
  getHolidays: nrw.getSchoolHolidays,
};

export function getSchoolProvider(): SchoolProvider {
  switch (city.sources.schools.kind) {
    case 'nrw':
      return nrwProvider;
    default:
      throw new Error(`Unknown school provider kind: ${city.sources.schools.kind}`);
  }
}
