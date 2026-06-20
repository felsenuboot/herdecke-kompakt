/**
 * Public-transport provider (departures + local stop directory).
 *
 * The EFA/VRR client is the first adapter, selected by `city.sources.transit.kind`
 * (other regions run different EFA/HAFAS endpoints, or a DELFI/Transitous layer).
 * Relative imports so the build + any tsx consumer resolve it.
 */
import { city } from '../../config/city';
import * as efa from '../sources/transit';
import type { Stop, Departure, DepartureBoard } from '../sources/transit';

export type { Stop, Departure, DepartureBoard };

export interface TransitProvider {
  /** Default stop shown when none is chosen. */
  readonly defaultStop: { id: string; name: string };
  getStops(): Promise<Stop[]>;
  getDepartures(stop?: string, limit?: number): Promise<DepartureBoard | null>;
}

/** Adapter: VRR EFA (rapidJSON), implemented in src/lib/sources/transit.ts. */
const efaProvider: TransitProvider = {
  defaultStop: efa.DEFAULT_STOP,
  getStops: efa.getHerdeckeStops,
  getDepartures: efa.getDepartures,
};

export function getTransitProvider(): TransitProvider {
  switch (city.sources.transit.kind) {
    case 'efa':
      return efaProvider;
    default:
      throw new Error(`Unknown transit provider kind: ${city.sources.transit.kind}`);
  }
}
