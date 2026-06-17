import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getStore } from '@/lib/store';
import { sendEmail } from '@/lib/email';
import { renderConfirmEmail } from '@/lib/render-email';
import { config } from '@/lib/config';

export const runtime = 'nodejs';

const Body = z.object({
  email: z.string().email().max(200),
  keywords: z.string().min(1).max(1000),
});

function parseKeywords(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(/[,;\n]/)) {
    const k = part.trim();
    if (k.length < 2 || k.length > 60) continue;
    const key = k.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(k);
    if (out.length >= config.maxKeywords) break;
  }
  return out;
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 });
  }

  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Bitte gib eine gültige E-Mail-Adresse und mindestens ein Stichwort an.' },
      { status: 400 },
    );
  }

  const keywords = parseKeywords(parsed.data.keywords);
  if (keywords.length === 0) {
    return NextResponse.json({ error: 'Bitte gib mindestens ein Stichwort an (mind. 2 Zeichen).' }, { status: 400 });
  }

  const store = await getStore();
  const sub = await store.createPending({ email: parsed.data.email.trim().toLowerCase(), keywords });

  try {
    await sendEmail({ to: sub.email, ...renderConfirmEmail(sub) });
  } catch (err) {
    console.error('[subscribe] confirm email failed:', (err as Error).message);
    return NextResponse.json(
      { error: 'Die Bestätigungs-E-Mail konnte nicht gesendet werden. Bitte versuche es später erneut.' },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: 'Fast geschafft! Bitte bestätige den Link, den wir dir gerade per E-Mail geschickt haben.',
  });
}
