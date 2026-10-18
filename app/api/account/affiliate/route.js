import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Customer, Commission, Payout } from '@/lib/models';
import { rateLimit } from '@/lib/ratelimit';
import { notify } from '@/lib/mail';
import { getCustomer } from '@/lib/customers';
import { refSettings, ensureRefCode, affiliateTotals } from '@/lib/referrals';
import { touchContact } from '@/lib/crm';
import { money, siteUrl } from '@/lib/utils';
import { getBaseUrl } from '@/lib/base-url';

const clip = (v, n) => String(v || '').trim().slice(0, n);

/* action: apply | payout-details | request-payout */
export async function POST(req) {
  const me = await getCustomer();
  if (!me) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  const r = await refSettings();
  if (!r.affiliate?.enabled) return NextResponse.json({ error: 'The affiliate program is closed right now.' }, { status: 403 });
  if (!(await rateLimit(`caff:${me._id}`, 20, 3600))) return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  await dbConnect();
  const st = me.affiliate?.status || 'none';

  if (b.action === 'apply') {
    if (['pending', 'approved'].includes(st)) return NextResponse.json({ error: 'You have already applied.' }, { status: 400 });
    if (!b.agree) return NextResponse.json({ error: 'Accept the program terms to apply.' }, { status: 400 });
    await ensureRefCode(me);
    const status = r.affiliate.autoApprove ? 'approved' : 'pending';
    await Customer.updateOne({ _id: me._id }, { $set: {
      'affiliate.status': status, 'affiliate.about': clip(b.about, 1000), 'affiliate.website': clip(b.website, 200),
      'affiliate.payoutMethod': clip(b.payoutMethod, 40), 'affiliate.payoutDetails': clip(b.payoutDetails, 300),
      'affiliate.appliedAt': new Date(), ...(status === 'approved' ? { 'affiliate.approvedAt': new Date() } : {}),
    } });
    await touchContact({ email: me.email, source: 'affiliate', activity: `Affiliate application (${status})` });
    notify(`New affiliate ${status === 'approved' ? 'joined' : 'application'}: ${me.name}`, `${me.name} (${me.email}) ${status === 'approved' ? 'joined' : 'applied to'} the affiliate program.\nWebsite: ${b.website || '-'}\nAbout: ${b.about || '-'}\nReview: ${(await getBaseUrl())}/admin/affiliates`);
    return NextResponse.json({ ok: true, status });
  }

  if (b.action === 'payout-details') {
    if (!['pending', 'approved'].includes(st)) return NextResponse.json({ error: 'Join the program first.' }, { status: 400 });
    await Customer.updateOne({ _id: me._id }, { $set: { 'affiliate.payoutMethod': clip(b.payoutMethod, 40), 'affiliate.payoutDetails': clip(b.payoutDetails, 300) } });
    return NextResponse.json({ ok: true, message: 'Payout details saved.' });
  }

  if (b.action === 'request-payout') {
    if (st !== 'approved') return NextResponse.json({ error: 'Your affiliate account is not active.' }, { status: 400 });
    if (!me.affiliate?.payoutMethod || !me.affiliate?.payoutDetails) return NextResponse.json({ error: 'Add your payout method and details first.' }, { status: 400 });
    if (await Payout.exists({ customerId: me._id, status: 'requested' })) return NextResponse.json({ error: 'You already have a payout request waiting.' }, { status: 400 });
    const t = await affiliateTotals(me._id);
    if (t.available < (r.affiliate.minPayout || 0)) return NextResponse.json({ error: `The minimum payout is ${money(r.affiliate.minPayout, r.base)}. You have ${money(t.available, r.base)} available.` }, { status: 400 });
    const p = await Payout.create({ customerId: me._id, name: me.name, email: me.email, amount: t.available, currency: r.base, method: me.affiliate.payoutMethod, details: me.affiliate.payoutDetails });
    const u = await Commission.updateMany({ customerId: me._id, kind: 'affiliate', status: 'pending', availableAt: { $lte: new Date() } }, { $set: { status: 'requested', payoutId: p._id } });
    const sum = (await Commission.find({ payoutId: p._id }).lean()).reduce((a, c) => a + c.amount, 0);
    await Payout.updateOne({ _id: p._id }, { amount: Math.round(sum * 100) / 100 });
    notify(`Payout request from ${me.name}`, `${me.name} asked for a payout of ${money(sum, r.base)} (${u.modifiedCount} commissions) by ${me.affiliate.payoutMethod}: ${me.affiliate.payoutDetails}\nPay it, then mark it paid: ${(await getBaseUrl())}/admin/affiliates`);
    return NextResponse.json({ ok: true, message: `Payout of ${money(sum, r.base)} requested. You will get it within a few working days.` });
  }
  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
}
