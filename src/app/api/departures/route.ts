import { NextResponse } from 'next/server';
import { getTransitProvider } from '@/lib/providers/transit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const transit = getTransitProvider();
  const stop = (new URL(req.url).searchParams.get('stop') ?? transit.defaultStop.id).slice(0, 40);
  const board = await transit.getDepartures(stop, 8);
  return NextResponse.json(board ?? { stop: '', departures: [] });
}
