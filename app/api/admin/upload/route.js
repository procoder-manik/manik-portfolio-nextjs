import { NextResponse } from 'next/server';
import { adminRoute as guard } from '@/lib/server-auth';
const adminRoute = (h) => guard(h, 'media');
import { saveUpload, cloud, cloudinarySignature } from '@/lib/upload';
import { dbConnect, hasDB } from '@/lib/db';
import { Media } from '@/lib/models';

export const maxDuration = 60;

/* GET: tells the admin how to upload. With Cloudinary set, the browser uploads directly. */
export const GET = adminRoute(async () => {
  if (cloud()) return NextResponse.json(cloudinarySignature());
  if (process.env.VERCEL) return NextResponse.json({ mode: 'none', error: 'Uploads on Vercel need Cloudinary. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in Vercel, then redeploy.' });
  return NextResponse.json({ mode: 'local' });
});

/* POST multipart: local disk upload. POST JSON { record }: save a finished Cloudinary upload in the media library. */
export const POST = adminRoute(async (req) => {
  if ((req.headers.get('content-type') || '').includes('application/json')) {
    const { record } = await req.json();
    if (!record?.url?.startsWith('https://res.cloudinary.com/')) throw new Error('Invalid upload record.');
    if (hasDB()) { await dbConnect(); await Media.create({ url: record.url, name: record.name, type: record.type, size: record.size }); }
    return NextResponse.json({ files: [record] });
  }
  if (process.env.VERCEL && !cloud()) throw new Error('Uploads on Vercel need Cloudinary. Add the three CLOUDINARY_* variables, then redeploy.');
  const fd = await req.formData();
  const files = fd.getAll('file').filter((f) => typeof f === 'object');
  if (!files.length) throw new Error('Choose a file to upload.');
  const out = [];
  for (const f of files) {
    if (f.size > 250 * 1024 * 1024) throw new Error(`${f.name} is over 250 MB.`);
    const saved = await saveUpload(f);
    if (hasDB()) { await dbConnect(); await Media.create(saved); }
    out.push(saved);
  }
  return NextResponse.json({ files: out });
});
