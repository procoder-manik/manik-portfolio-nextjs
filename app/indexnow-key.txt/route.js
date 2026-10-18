import { indexNowKey } from '@/lib/indexnow';
export async function GET() { return new Response(await indexNowKey(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }); }
