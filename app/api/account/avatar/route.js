import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Customer } from '@/lib/models';
import { rateLimit } from '@/lib/ratelimit';
import { saveUpload, cloud } from '@/lib/upload';
import { getCustomer } from '@/lib/customers';

const TYPES = { png: [0x89, 0x50, 0x4e, 0x47], jpg: [0xff, 0xd8, 0xff], webp: [0x52, 0x49, 0x46, 0x46] };
const MIME = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' };

/* Profile photo: JPG, PNG or WebP up to 2 MB. Checked by its bytes, not its name. */
export async function POST(req) {
  const me = await getCustomer();
  if (!me) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  if (!(await rateLimit(`cavatar:${me._id}`, 10, 3600))) return NextResponse.json({ error: 'Too many uploads. Try again later.' }, { status: 429 });
  if (process.env.VERCEL && !cloud()) return NextResponse.json({ error: 'Photo uploads are not set up on this site yet.' }, { status: 503 });
  const fd = await req.formData().catch(() => null);
  const file = fd?.get('file');
  if (!file || typeof file !== 'object') return NextResponse.json({ error: 'Choose a photo.' }, { status: 400 });
  if (file.size > 2 * 1024 * 1024) return NextResponse.json({ error: 'Use a photo under 2 MB.' }, { status: 400 });
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const kind = Object.keys(TYPES).find((k) => TYPES[k].every((b, i) => head[i] === b) && (k !== 'webp' || String.fromCharCode(...head.slice(8, 12)) === 'WEBP'));
  if (!kind) return NextResponse.json({ error: 'Use a JPG, PNG or WebP image.' }, { status: 400 });
  const clean = new File([await file.arrayBuffer()], `avatar-${String(me._id).slice(-6)}.${kind}`, { type: MIME[kind] });
  const up = await saveUpload(clean);
  await dbConnect();
  await Customer.updateOne({ _id: me._id }, { $set: { avatar: up.url } });
  return NextResponse.json({ ok: true, url: up.url });
}

export async function DELETE() {
  const me = await getCustomer();
  if (!me) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  await dbConnect();
  await Customer.updateOne({ _id: me._id }, { $unset: { avatar: 1 } });
  return NextResponse.json({ ok: true });
}
