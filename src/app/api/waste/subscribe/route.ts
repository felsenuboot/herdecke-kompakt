import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getStore } from '@/lib/store';
import { sendEmail } from '@/lib/email';
import { renderWasteConfirmEmail } from '@/lib/render-email';
import { getWastePickups } from '@/lib/sources/waste-ahe';
import { config } from '@/lib/config';

export const runtime = 'nodejs';

const Body = z.object({
  email: z.string().email().max(200),
  strasse: z.string().min(2).max(80),
  hnr: z.string().max(10).optional(),
});

export async function POST(req: Request) {
  if (!config.subscriptionsEnabled) {
    return NextResponse.json({ error: 'E-Mail-Benachrichtigungen sind derzeit deaktiviert.' }, { status: 503 });
  }
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 });
  }

  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Bitte gib eine gültige E-Mail-Adresse und deine Straße an.' }, { status: 400 });
  }
  const hnr = parsed.data.hnr ?? '';

  // Only subscribe addresses that actually resolve to a collection schedule.
  const check = await getWastePickups(parsed.data.strasse, hnr);
  if (check.error || check.pickups.length === 0) {
    return NextResponse.json(
      { error: check.error ?? 'Für diese Adresse wurden keine Termine gefunden — bitte Straße/Hausnummer prüfen.' },
      { status: 400 },
    );
  }

  const store = await getStore();
  const sub = await store.createPending({
    email: parsed.data.email.trim().toLowerCase(),
    kind: 'waste',
    street: check.street, // canonical AHE street name
    hnr,
  });

  try {
    await sendEmail({ to: sub.email, ...renderWasteConfirmEmail(sub) });
  } catch (err) {
    console.error('[waste subscribe] confirm email failed:', (err as Error).message);
    return NextResponse.json({ error: 'Bestätigungs-E-Mail konnte nicht gesendet werden.' }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    message: 'Fast geschafft! Bitte bestätige den Link, den wir dir gerade per E-Mail geschickt haben.',
  });
}
