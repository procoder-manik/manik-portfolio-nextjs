import Link from 'next/link';
import { getCustomer, customerOrders, ACTIVE, WAITING, DONE } from '@/lib/customers';
import { serialize, cn } from '@/lib/utils';
import { OrderCard } from '@/components/account/OrderBits';
import { ClaimForm } from '@/components/account/Forms';

export const metadata = { title: 'Orders' };

const FILTERS = [['all', 'All'], ['active', 'In progress'], ['waiting', 'Awaiting payment'], ['done', 'Completed'], ['closed', 'Cancelled']];
const MATCH = { all: () => true, active: (o) => ACTIVE.includes(o.status), waiting: (o) => WAITING.includes(o.status), done: (o) => DONE.includes(o.status), closed: (o) => o.status === 'cancelled' };

export default async function Orders(props) {
  const sp = await props.searchParams;
  const show = MATCH[sp.show] ? sp.show : 'all';
  const me = await getCustomer();
  const all = serialize(await customerOrders(me));
  const list = all.filter(MATCH[show]);
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="font-display text-[clamp(1.8rem,3.5vw,2.4rem)] font-bold tracking-[-0.03em]">Your orders</h1><p className="mt-1 text-muted">{all.length} order{all.length === 1 ? '' : 's'} in total.</p></div>
        <Link href="/pricing" className="btn-primary btn-sm">Order something new</Link>
      </div>
      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(([k, l]) => {
          const n = all.filter(MATCH[k]).length;
          return <Link key={k} href={k === 'all' ? '/account/orders' : `/account/orders?show=${k}`} className={cn('inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition', show === k ? 'border-signal bg-signal/10 text-ink' : 'border-line text-body hover:border-ink/30')}>{l} <span className="text-muted">{n}</span></Link>;
        })}
      </div>
      {list.length ? <div className="mt-6 grid gap-4 md:grid-cols-2">{list.map((o) => <OrderCard key={o.number} o={o} />)}</div>
        : <p className="mt-6 rounded-2xl border border-dashed border-line p-8 text-center text-muted">{all.length ? 'No orders in this group.' : 'No orders yet.'}</p>}
      <section className="card mt-10 max-w-2xl p-6">
        <h2 className="text-lg font-semibold">Add an order you placed earlier</h2>
        <p className="mb-4 mt-1 text-sm text-muted">{me.emailVerified ? 'Orders placed with your email are already here. For one placed with a different email, paste its order link.' : 'Confirm your email to bring in every past order automatically, or paste an order link from your confirmation email.'}</p>
        <ClaimForm />
      </section>
    </div>
  );
}
