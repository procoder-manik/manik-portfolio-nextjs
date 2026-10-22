import { NextResponse } from 'next/server';
import { dbConnect, hasDB } from '@/lib/db';
import { Message, Pitch } from '@/lib/models';
import { mailEnabled } from '@/lib/mail';
import { explainError } from '@/lib/explain-error';
import { rateLimit, clientIp } from '@/lib/ratelimit';
import { touchContact } from '@/lib/crm';
import { sendThanks, alertNewMessage } from '@/lib/notifications';

export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  if (b.website) return NextResponse.json({ ok: true }); // honeypot
  if (!(await rateLimit(`contact:${await clientIp()}`, 5, 600))) return NextResponse.json({ error: 'Too many messages in a short time. Try again in a few minutes.' }, { status: 429 });

  const name = String(b.name || '').trim().slice(0, 100); const email = String(b.email || '').trim().slice(0, 160); const message = String(b.message || '').trim();
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10)
    return NextResponse.json({ error: 'Add your name, a valid email and a message of at least 10 characters.' }, { status: 400 });

  const clip = (v, n = 120) => (v ? String(v).slice(0, n) : undefined);
  const doc = { name, email, phone: clip(b.phone, 40), subject: clip(b.subject), budget: clip(b.budget), service: clip(b.service), message: message.slice(0, 5000) };
  let saved = null; let dbError = null;

  if (hasDB()) {
    try {
      await dbConnect(); saved = await Message.create(doc);
      const pc = String(b.pitch || '').toLowerCase();
      if (/^[a-z0-9-]{4,40}$/.test(pc)) await Pitch.updateOne({ code: pc }, { $set: { status: 'enquired', enquiredAt: new Date() } }).catch(() => {});
      await touchContact({ email, name, phone: doc.phone, source: b.source === 'chat' ? 'chat' : 'contact form', message: true, activity: `${doc.service ? `${doc.service}: ` : ''}${message.slice(0, 140)}` });
    } catch (e) { dbError = e; console.error('[contact] database', e); }
  }

  if (saved || mailEnabled()) {
    const [thanks] = await Promise.all([sendThanks(doc), alertNewMessage(doc)]);
    if (saved && thanks?.ok) await Message.updateOne({ _id: saved._id }, { autoReplied: true }).catch(() => {});
    return NextResponse.json({ ok: true });
  }
  if (dbError) return NextResponse.json({ error: explainError(dbError) }, { status: 500 });
  return NextResponse.json({ error: 'The form is not connected yet (no database or email set). Email me directly instead.' }, { status: 503 });
}
