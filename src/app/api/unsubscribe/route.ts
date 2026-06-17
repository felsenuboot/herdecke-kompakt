import { getStore } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token') ?? '';
  try {
    const store = await getStore();
    if (token) await store.unsubscribe(token);
  } catch (err) {
    console.error('[unsubscribe] failed:', (err as Error).message);
  }
  return Response.redirect(new URL('/unsubscribed', req.url), 302);
}
