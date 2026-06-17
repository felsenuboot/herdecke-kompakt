import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// On-demand reverse geocoding via OpenStreetMap/Nominatim (keyless). Called only
// when the user taps "use my location", so it stays well within Nominatim's
// fair-use policy (identify with a User-Agent, ≤1 req/s). For heavy use, swap in
// the BKG/NRW geocoder.
const UA = 'Digital.Herdecke/0.1 (open civic-tech; +https://github.com/felsenuboot/herdecke-digital)';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lat = Number(url.searchParams.get('lat'));
  const lon = Number(url.searchParams.get('lon'));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: 'Ungültige Koordinaten.' }, { status: 400 });
  }

  try {
    const nominatim =
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}` +
      `&format=jsonv2&addressdetails=1&zoom=18&accept-language=de`;
    const res = await fetch(nominatim, {
      headers: { 'User-Agent': UA, Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { address?: Record<string, string> };
    const a = data.address ?? {};

    const strasse = a.road ?? a.pedestrian ?? a.residential ?? a.footway ?? '';
    const hnr = a.house_number ?? '';
    const ort = a.city ?? a.town ?? a.village ?? a.municipality ?? '';
    const plz = a.postcode ?? '';

    if (!/herdecke/i.test(ort) && plz !== '58313') {
      return NextResponse.json({ error: 'Dein Standort liegt außerhalb von Herdecke.' }, { status: 200 });
    }
    if (!strasse) {
      return NextResponse.json({ error: 'Straße konnte nicht bestimmt werden.' }, { status: 200 });
    }
    return NextResponse.json({ strasse, hnr, ort });
  } catch {
    return NextResponse.json({ error: 'Standort konnte nicht bestimmt werden.' }, { status: 502 });
  }
}
