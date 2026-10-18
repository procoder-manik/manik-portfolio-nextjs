import { NextResponse } from 'next/server';
import { dbConnect, hasDB } from '@/lib/db';
import { Form } from '@/lib/models';
import { saveUpload, cloud } from '@/lib/upload';
import { rateLimit, clientIp } from '@/lib/ratelimit';

export const maxDuration = 60;
const BLOCKED = /\.(exe|bat|cmd|sh|js|mjs|php|phtml|html?|svg|msi|com|scr|jar|vbs|ps1|dll|apk)$/i;

/* Public upload for "File upload" fields. Checks the form, the allowed types and the size you set. */
export async function POST(req) {
  try {
    if (!(await rateLimit(`formfile:${await clientIp()}`, 15, 600))) return NextResponse.json({ error: 'Too many uploads. Try again in a few minutes.' }, { status: 429 });
    if (process.env.VERCEL && !cloud()) return NextResponse.json({ error: 'File uploads need Cloudinary on this host. The site owner must add the CLOUDINARY_* settings.' }, { status: 503 });
    if (!hasDB()) return NextResponse.json({ error: 'Uploads are not available yet.' }, { status: 503 });
    const fd = await req.formData();
    const file = fd.get('file'); const slug = String(fd.get('form') || ''); const fieldId = String(fd.get('field') || '');
    if (!file || typeof file !== 'object') return NextResponse.json({ error: 'Choose a file.' }, { status: 400 });
    await dbConnect();
    const form = await Form.findOne({ slug, trashedAt: null }).select('fields active').lean();
    const f = form?.active !== false && form?.fields?.find((x) => x.id === fieldId && x.type === 'file');
    if (!f) return NextResponse.json({ error: 'This upload is not allowed.' }, { status: 403 });
    const max = Math.min(Number(f.maxSizeMB) || 5, 25) * 1024 * 1024;
    if (file.size > max) return NextResponse.json({ error: `The file is larger than ${Math.round(max / 1048576)} MB.` }, { status: 400 });
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const allowed = String(f.accept || '.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx').split(',').map((x) => x.trim().toLowerCase().replace(/^\./, '')).filter(Boolean);
    if (BLOCKED.test(file.name) || !allowed.includes(ext)) return NextResponse.json({ error: `This file type is not allowed. Use: ${allowed.join(', ')}.` }, { status: 400 });
    const saved = await saveUpload(file);
    return NextResponse.json({ file: { url: saved.url, name: file.name.slice(0, 120), size: saved.size } });
  } catch (e) { console.error('[form upload]', e); return NextResponse.json({ error: 'The upload failed. Try again.' }, { status: 500 }); }
}
