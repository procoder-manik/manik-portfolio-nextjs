export const dynamic = 'force-dynamic';
import { getSettings } from '@/lib/data';
import { buildLlms } from '@/lib/llms';

export async function GET() {
  const seo = await getSettings('seo');
  if (seo.ai?.llms === false || seo.noindex) return new Response('Not found', { status: 404 });
  return new Response(await buildLlms(false), { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=900' } });
}
