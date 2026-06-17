import { NextResponse } from 'next/server';
import { getWastePickups } from '@/lib/sources/waste-ahe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const strasse = (url.searchParams.get('strasse') ?? '').slice(0, 80).trim();
  const hnr = (url.searchParams.get('hnr') ?? '').slice(0, 10).trim();
  if (!strasse) return NextResponse.json({ error: 'Bitte gib eine Straße an.' }, { status: 400 });

  const result = await getWastePickups(strasse, hnr);
  return NextResponse.json(result);
}
