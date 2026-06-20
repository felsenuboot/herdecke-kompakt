/**
 * Waste-collection provider (the "Müll-Wecker").
 *
 * The AHE/atino client is the first adapter, selected by `city.sources.waste.kind`.
 * Germany has dozens of incompatible municipal waste backends — each becomes an
 * adapter behind this interface. Relative imports for tsx/cron resolvability.
 */
import { city } from '../../config/city';
import * as ahe from '../sources/waste-ahe';
import { wasteInfo } from '../sources/waste';
import type { Pickup, WasteResult } from '../sources/waste-ahe';

export type { Pickup, WasteResult };

export interface WasteProvider {
  /** Static provider name + official calendar/PDF links. */
  readonly info: typeof wasteInfo;
  getPickups(strasse: string, hnr: string | number, limit?: number): Promise<WasteResult>;
}

/** Adapter: AHE Ennepe-Ruhr (atino backend), in src/lib/sources/waste-ahe.ts. */
const aheProvider: WasteProvider = {
  info: wasteInfo,
  getPickups: ahe.getWastePickups,
};

export function getWasteProvider(): WasteProvider {
  switch (city.sources.waste.kind) {
    case 'ahe':
      return aheProvider;
    default:
      throw new Error(`Unknown waste provider kind: ${city.sources.waste.kind}`);
  }
}
