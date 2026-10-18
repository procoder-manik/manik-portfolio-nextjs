import { NextResponse } from 'next/server';
import { dbConnect, hasDB } from '@/lib/db';
import { Form, FormEntry } from '@/lib/models';
import { adminRoute as guard } from '@/lib/server-auth';
import { serialize } from '@/lib/utils';
import { display } from '@/lib/forms';
const adminRoute = (h) => guard(h, 'entries');

const csvCell = (v) => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; return `"${s.replace(/"/g, '""')}"`; };

/* GET ?form=<id>&status=&q=&format=csv */
export const GET = adminRoute(async (req) => {
  if (!hasDB()) return NextResponse.json({ items: [], forms: [], noDB: true });
  await dbConnect();
  const sp = req.nextUrl.searchParams; const formId = sp.get('form'); const status = sp.get('status'); const q = (sp.get('q') || '').trim().toLowerCase();
  const filter = {}; if (/^[a-f0-9]{24}$/.test(formId || '')) filter.formId = formId; if (status && status !== 'all') filter.status = status; else filter.status = { $ne: 'trash' };
  const [forms, itemsRaw] = await Promise.all([Form.find().select('name slug fields entries trashedAt').lean(), FormEntry.find(filter).sort({ createdAt: -1 }).limit(2000).lean()]);
  const items = q ? itemsRaw.filter((e) => JSON.stringify([e.data, e.name, e.email]).toLowerCase().includes(q)) : itemsRaw;
  if (sp.get('format') === 'csv') {
    const form = forms.find((f) => String(f._id) === formId);
    const cols = form ? (form.fields || []).filter((f) => f.key && !['heading', 'html', 'divider', 'page', 'total'].includes(f.type)) : [...new Set(items.flatMap((e) => Object.keys(e.data || {}).filter((k) => !k.endsWith('__qty'))))].map((k) => ({ key: k, label: items.find((e) => e.labels?.[k])?.labels[k] || k }));
    const head = ['Date', ...(form ? [] : ['Form']), 'Status', ...cols.map((c) => c.label), 'Order', 'Amount', 'Page'];
    const lines = [head.map(csvCell).join(',')];
    for (const e of items) lines.push([new Date(e.createdAt).toISOString(), ...(form ? [] : [e.formName]), e.status, ...cols.map((c) => display(c, e.data?.[c.key])), e.payment?.orderNumber || '', e.payment?.amount ?? '', e.page || ''].map(csvCell).join(','));
    return new NextResponse('\uFEFF' + lines.join('\r\n'), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${(form?.name || 'form-answers').replace(/[^\w-]+/g, '-')}.csv"` } });
  }
  return NextResponse.json({ items: serialize(items), forms: serialize(forms.filter((f) => !f.trashedAt || f.entries)) });
});

/* PATCH { ids, status: new | read | starred | spam | trash } */
export const PATCH = adminRoute(async (req) => {
  await dbConnect();
  const { ids = [], status } = await req.json();
  if (!['new', 'read', 'starred', 'spam', 'trash'].includes(status)) throw new Error('Unknown status.');
  await FormEntry.updateMany({ _id: { $in: ids.slice(0, 500) } }, { status });
  return NextResponse.json({ ok: true });
});

/* DELETE { ids } removes answers for good. Only entries already in the trash, or { all: true } for the trash. */
export const DELETE = adminRoute(async (req) => {
  await dbConnect();
  const { ids = [], emptyTrash } = await req.json().catch(() => ({}));
  const r = emptyTrash ? await FormEntry.deleteMany({ status: 'trash' }) : await FormEntry.deleteMany({ _id: { $in: ids.slice(0, 500) } });
  const forms = await Form.find().select('_id').lean();
  await Promise.all(forms.map(async (f) => Form.updateOne({ _id: f._id }, { entries: await FormEntry.countDocuments({ formId: f._id, status: { $ne: 'trash' } }) })));
  return NextResponse.json({ ok: true, count: r.deletedCount });
});
