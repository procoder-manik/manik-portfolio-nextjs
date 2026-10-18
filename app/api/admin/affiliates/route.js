import { NextResponse } from 'next/server';
import { adminRoute as guard } from '@/lib/server-auth';
const adminRoute = (h) => guard(h, 'shop');
import { dbConnect, hasDB } from '@/lib/db';
import { Customer, Commission, Payout } from '@/lib/models';
import { serialize } from '@/lib/utils';
import { refSettings, ensureRefCode } from '@/lib/referrals';
import { sendCustom } from '@/lib/notifications';
import { siteUrl, money } from '@/lib/utils';

/* Affiliates, payout requests and the rewards ledger in one view. */
export const GET = adminRoute(async () => {
  if (!hasDB()) return NextResponse.json({ affiliates: [], payouts: [], commissions: [], settings: await refSettings(), readOnly: true });
  await dbConnect();
  const [affiliates, payouts, commissions, settings] = await Promise.all([
    Customer.find({ 'affiliate.status': { $nin: [null, 'none'] } }).sort({ 'affiliate.appliedAt': -1 }).limit(500).lean(),
    Payout.find().sort({ createdAt: -1 }).limit(200).lean(),
    Commission.find().sort({ createdAt: -1 }).limit(300).lean(),
    refSettings(),
  ]);
  const ids = [...new Set(commissions.map((c) => String(c.customerId)))];
  const names = Object.fromEntries((await Customer.find({ _id: { $in: ids } }).select('name email').lean()).map((c) => [String(c._id), c.name || c.email]));
  const now = Date.now(); const totals = {};
  for (const c of commissions) {
    if (c.kind !== 'affiliate' || c.status === 'void') continue;
    const t = (totals[String(c.customerId)] ||= { earned: 0, available: 0, paid: 0 });
    t.earned += c.amount;
    if (c.status === 'paid') t.paid += c.amount;
    if (c.status === 'pending' && new Date(c.availableAt || 0).getTime() <= now) t.available += c.amount;
  }
  return NextResponse.json({
    affiliates: serialize(affiliates.map((a) => ({ ...a, totals: totals[String(a._id)] || { earned: 0, available: 0, paid: 0 } }))),
    payouts: serialize(payouts), commissions: serialize(commissions.map((c) => ({ ...c, earner: names[String(c.customerId)] || '' }))), settings,
  });
});

export const POST = adminRoute(async (req) => {
  if (!hasDB()) throw Object.assign(new Error('Connect MongoDB to make changes.'), { status: 503 });
  await dbConnect();
  const b = await req.json();
  const r = await refSettings();

  if (['approve', 'reject', 'pause'].includes(b.action)) {
    const c = await Customer.findById(b.customerId).lean();
    if (!c) throw new Error('Customer not found.');
    const status = { approve: 'approved', reject: 'rejected', pause: 'paused' }[b.action];
    if (status === 'approved') await ensureRefCode(c);
    await Customer.updateOne({ _id: c._id }, { $set: { 'affiliate.status': status, ...(status === 'approved' ? { 'affiliate.approvedAt': new Date() } : {}), ...(b.note !== undefined ? { 'affiliate.adminNote': String(b.note).slice(0, 500) } : {}) } });
    if (b.notify !== false && status !== 'paused') {
      await sendCustom({ to: c.email, name: c.name,
        subject: status === 'approved' ? 'You are in: affiliate account approved' : 'About your affiliate application',
        message: status === 'approved' ? `Your affiliate account is active. You earn ${c.affiliate?.rate ?? r.affiliate?.rate}% on every paid order that comes through your link. Your link and earnings are in your account.` : `Thanks for applying to the affiliate program. I cannot approve it right now.${b.note ? `\n\n${b.note}` : ''}`,
        ctaLabel: status === 'approved' ? 'Get your link' : undefined, ctaUrl: status === 'approved' ? `${siteUrl()}/account/affiliate` : undefined }).catch(() => {});
    }
    return NextResponse.json({ ok: true });
  }

  if (b.action === 'rate') {
    const rate = b.rate === '' || b.rate === null ? null : Math.max(0, Math.min(90, Number(b.rate)));
    await Customer.updateOne({ _id: b.customerId }, rate === null ? { $unset: { 'affiliate.rate': 1 } } : { $set: { 'affiliate.rate': rate } });
    return NextResponse.json({ ok: true });
  }

  if (b.action === 'payout-paid' || b.action === 'payout-reject') {
    const p = await Payout.findById(b.payoutId);
    if (!p || p.status !== 'requested') throw new Error('This payout is not waiting.');
    const paid = b.action === 'payout-paid';
    p.status = paid ? 'paid' : 'rejected'; p.reference = String(b.reference || '').slice(0, 120); p.note = String(b.note || '').slice(0, 500);
    if (paid) p.paidAt = new Date();
    await p.save();
    await Commission.updateMany({ payoutId: p._id, status: 'requested' }, paid ? { $set: { status: 'paid' } } : { $set: { status: 'pending' }, $unset: { payoutId: 1 } });
    await sendCustom({ to: p.email, name: p.name, subject: paid ? `Payout sent: ${money(p.amount, p.currency)}` : 'About your payout request',
      message: paid ? `Your affiliate payout of ${money(p.amount, p.currency)} was sent by ${p.method}.${p.reference ? ` Reference: ${p.reference}.` : ''} Thank you for the referrals.` : `Your payout request was not sent this time.${p.note ? `\n\n${p.note}` : ''} The amount is back in your available balance.`,
      ctaLabel: 'Open your account', ctaUrl: `${siteUrl()}/account/affiliate` }).catch(() => {});
    return NextResponse.json({ ok: true });
  }

  if (b.action === 'void') {
    const c = await Commission.findById(b.commissionId);
    if (!c || !['pending', 'credited'].includes(c.status)) throw new Error('Only pending or credited rewards can be voided.');
    if (c.kind === 'referral' && c.amount > 0) await Customer.updateOne({ _id: c.customerId }, { $inc: { credit: -c.amount } });
    c.status = 'void'; c.note = String(b.note || 'Voided by admin').slice(0, 300); await c.save();
    return NextResponse.json({ ok: true });
  }
  throw new Error('Unknown action.');
});
