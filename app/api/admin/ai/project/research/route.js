import { NextResponse } from 'next/server';
import { adminRoute as guard } from '@/lib/server-auth';
import { rateLimit } from '@/lib/ratelimit';
import { siteFacts } from '@/lib/project-ai';
const adminRoute = (h) => guard(h, 'content');
export const maxDuration = 30;
export const dynamic = 'force-dynamic';

/* Step 1 of "Write with AI" for a project: reads the live website (title, headings, text, platform). No AI, no key needed. */
export const POST = adminRoute(async (req, ctx, admin) => {
  if (!(await rateLimit(`aiproj-read:${admin.email}`, 60, 3600))) throw new Error('Too many websites read this hour. Try again later.');
  const { url } = await req.json();
  if (!String(url || '').trim()) throw new Error('Add the website address.');
  try { return NextResponse.json({ ok: true, facts: await siteFacts(url) }); }
  catch (e) { return NextResponse.json({ ok: false, error: `${e.name === 'TimeoutError' ? 'The website took too long to answer.' : e.message} The AI will write from your answers only.` }); }
});
