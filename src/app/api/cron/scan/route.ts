import { runScan } from '@/lib/alerts';
import { config } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Daily scan, triggered by Vercel Cron (see vercel.json). Vercel sends
 * `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is configured.
 */
export async function GET(req: Request) {
  if (config.cronSecret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${config.cronSecret}`) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  try {
    const result = await runScan();
    console.log('[cron] scan complete:', JSON.stringify(result));
    return Response.json({ ok: true, ...result });
  } catch (err) {
    console.error('[cron] scan failed:', (err as Error).message);
    return Response.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
