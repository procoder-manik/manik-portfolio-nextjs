export async function api(path, { method = 'GET', body } = {}) {
  const r = await fetch(path, { method, headers: body instanceof FormData ? undefined : { 'Content-Type': 'application/json' }, body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j.error || `Request failed (${r.status})`), { status: r.status });
  return j;
}

/* Uploads files. With Cloudinary configured the browser sends files straight to
   Cloudinary (no size cap from the hosting platform); otherwise they go to the server disk. */
export async function upload(files) {
  const list = [...files];
  const cfg = await api('/api/admin/upload');
  if (cfg.mode === 'none') throw new Error(cfg.error);
  if (cfg.mode === 'cloudinary') {
    const out = [];
    for (const f of list) {
      const fd = new FormData();
      fd.append('file', f); fd.append('api_key', cfg.apiKey); fd.append('timestamp', String(cfg.timestamp));
      fd.append('folder', cfg.folder); fd.append('signature', cfg.signature);
      const r = await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloudName}/auto/upload`, { method: 'POST', body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error?.message || `Upload of ${f.name} failed.`);
      const record = { url: j.secure_url, name: f.name, type: f.type, size: f.size };
      await api('/api/admin/upload', { method: 'POST', body: { record } });
      out.push(record);
    }
    return out;
  }
  const fd = new FormData();
  list.forEach((f) => fd.append('file', f));
  return (await api('/api/admin/upload', { method: 'POST', body: fd })).files;
}
