import { NextResponse } from 'next/server';
import { getDepartures, DEFAULT_STOP } from '@/lib/sources/transit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const stop = (new URL(req.url).searchParams.get('stop') ?? DEFAULT_STOP.id).slice(0, 40);
  const board = await getDepartures(stop, 8);
  return NextResponse.json(board ?? { stop: '', departures: [] });
}
