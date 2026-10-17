import 'server-only';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { slugify } from './utils';

export const UPLOAD_DIR = path.join(process.cwd(), 'storage', 'uploads');
export const cloud = () => process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

export async function saveUpload(file) {
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  const base = slugify(file.name.replace(/\.[^.]+$/, '')) || 'file';

  if (cloud()) {
    const ts = Math.floor(Date.now() / 1000);
    const folder = 'manik-portfolio';
    const sig = crypto.createHash('sha1').update(`folder=${folder}&timestamp=${ts}${process.env.CLOUDINARY_API_SECRET}`).digest('hex');
    const fd = new FormData();
    fd.append('file', new Blob([buf], { type: file.type }), file.name);
    fd.append('api_key', process.env.CLOUDINARY_API_KEY);
    fd.append('timestamp', String(ts)); fd.append('folder', folder); fd.append('signature', sig);
    const kind = file.type.startsWith('video') ? 'video' : file.type === 'application/pdf' ? 'raw' : 'image';
    const r = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${kind}/upload`, { method: 'POST', body: fd });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error?.message || 'Cloudinary upload failed');
    return { url: j.secure_url, name: file.name, type: file.type, size: buf.length };
  }

  const d = new Date();
  const rel = path.join(String(d.getFullYear()), String(d.getMonth() + 1).padStart(2, '0'));
  await fs.mkdir(path.join(UPLOAD_DIR, rel), { recursive: true });
  const fname = `${base}-${crypto.randomBytes(3).toString('hex')}.${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, rel, fname), buf);
  return { url: `/media/${rel.split(path.sep).join('/')}/${fname}`, name: file.name, type: file.type, size: buf.length };
}

/* Signed parameters so the browser can upload straight to Cloudinary.
   This skips the server, which matters on Vercel where request bodies are capped at 4.5 MB. */
export function cloudinarySignature() {
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'manik-portfolio';
  const signature = crypto.createHash('sha1').update(`folder=${folder}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`).digest('hex');
  return { mode: 'cloudinary', cloudName: process.env.CLOUDINARY_CLOUD_NAME, apiKey: process.env.CLOUDINARY_API_KEY, timestamp, folder, signature };
}
