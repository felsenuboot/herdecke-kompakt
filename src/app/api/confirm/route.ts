import { getStore } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token') ?? '';
  let ok = false;
  try {
    const store = await getStore();
    ok = token ? Boolean(await store.confirm(token)) : false;
  } catch (err) {
    console.error('[confirm] failed:', (err as Error).message);
  }
  return Response.redirect(new URL(ok ? '/confirmed' : '/confirmed?ok=0', req.url), 302);
}
