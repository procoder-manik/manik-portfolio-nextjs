import { NextResponse } from 'next/server';
import { adminRoute as guard } from '@/lib/server-auth';
import { generateQA } from '@/lib/ai-iq';
import { fetchPageText } from '@/lib/safe-fetch';
import { rateLimit } from '@/lib/ratelimit';
const adminRoute = (h) => guard(h, 'content');
export const maxDuration = 60;

/* POST { category, count, mode: 'ai' | 'url' | 'text', url?, text? } -> { items } (not saved yet) */
export const POST = adminRoute(async (req, ctx, admin) => {
  if (!(await rateLimit(`aiiq:${admin.email}`, 40, 3600))) throw new Error('Too many AI requests this hour. Try again later.');
  const b = await req.json(); const category = String(b.category || 'General').slice(0, 80); const count = Math.max(1, Math.min(15, Number(b.count) || 8));
  let text = ''; let source = '';
  if (b.mode === 'url') { const p = await fetchPageText(String(b.url || '')); text = p.text; source = b.url; if (text.length < 200) throw new Error('That page has too little text to learn from.'); }
  if (b.mode === 'text') { text = String(b.text || '').trim(); if (text.length < 60) throw new Error('Paste at least a few sentences.'); }
  return NextResponse.json({ items: await generateQA({ category, count, text, source }) });
});
