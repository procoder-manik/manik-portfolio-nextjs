import fs from 'fs/promises';
import path from 'path';
import { UPLOAD_DIR } from '@/lib/upload';

const TYPES = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', avif: 'image/avif', gif: 'image/gif', svg: 'image/svg+xml', pdf: 'application/pdf', mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime' };

export async function GET(req, props) {
  const params = await props.params;
  const rel = params.path.join('/');
  const file = path.normalize(path.join(UPLOAD_DIR, rel));
  if (!file.startsWith(UPLOAD_DIR)) return new Response('Not found', { status: 404 });
  try {
    const stat = await fs.stat(file);
    const type = TYPES[rel.split('.').pop().toLowerCase()] || 'application/octet-stream';
    const range = req.headers.get('range');
    if (range && type.startsWith('video')) {
      const [s, e] = range.replace('bytes=', '').split('-');
      const start = Number(s); const end = e ? Number(e) : Math.min(start + 4 * 1024 * 1024, stat.size - 1);
      const fh = await fs.open(file); const buf = Buffer.alloc(end - start + 1);
      await fh.read(buf, 0, buf.length, start); await fh.close();
      return new Response(buf, { status: 206, headers: { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': String(buf.length) } });
    }
    const data = await fs.readFile(file);
    return new Response(data, { headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=31536000, immutable', 'Accept-Ranges': 'bytes' } });
  } catch { return new Response('Not found', { status: 404 }); }
}
