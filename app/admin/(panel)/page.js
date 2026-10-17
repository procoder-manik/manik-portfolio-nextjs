'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, PenSquare, ShoppingBag, Inbox, Plus, Package } from 'lucide-react';
import { api } from '@/components/admin/api';
import { Notice } from '@/components/admin/Editor';
import { money, fmtDate } from '@/lib/utils';
import Status from '@/components/admin/Status';
import InfoTip from '@/components/site/InfoTip';
import { SECTION_INFO } from '@/lib/field-info';

export default function Dashboard() {
  const [s, setS] = useState(null);
  useEffect(() => { api('/api/admin/stats').then(setS).catch(() => setS({ noDB: true })); }, []);
  const cards = s && !s.noDB ? [
    ['Projects', s.projects, Briefcase, '/admin/projects'], ['Posts', s.posts, PenSquare, '/admin/posts'],
    ['Open orders', s.openOrders, ShoppingBag, '/admin/orders'], ['Unread messages', s.unread, Inbox, '/admin/messages'],
  ] : [];
  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="flex items-center gap-2 text-2xl font-semibold">Dashboard<InfoTip size={16} text={SECTION_INFO.dashboard} /></h1><p className="mt-1 text-muted">Everything on the site is edited from here.</p></div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/projects/new" className="btn-primary btn-sm"><Plus size={15} />New project</Link>
          <Link href="/admin/posts/new" className="btn-ghost btn-sm"><Plus size={15} />New post</Link>
          <Link href="/admin/packages/new" className="btn-ghost btn-sm"><Package size={15} />New package</Link>
        </div>
      </div>
      {s && !s.noDB && s.projects === 0 && <SeedBox onDone={() => api('/api/admin/stats').then(setS)} />}
      {s?.noDB && <Notice>MongoDB is not connected, so the site is showing its starter content. Add MONGODB_URI to your environment, run <code>npm run seed</code>, then restart.</Notice>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([l, n, I, h]) => (
          <Link key={l} href={h} className="rounded-2xl border border-line bg-surface p-5 transition hover:border-signal">
            <I size={18} className="text-signal" /><p className="mt-4 font-display text-3xl font-bold text-ink">{n}</p><p className="text-sm text-muted">{l}</p>
          </Link>
        ))}
      </div>
      {s?.revenue?.length > 0 && <p className="mt-4 text-sm text-muted">Paid so far: {s.revenue.map((r) => money(r.total, r._id)).join(', ')}</p>}
      {s && !s.noDB && (
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Panel title="Latest orders" href="/admin/orders">
            {s.recentOrders.length ? s.recentOrders.map((o) => (
              <Link key={o._id} href={`/admin/orders/${o._id}`} className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-raised/50">
                <span className="min-w-0"><span className="block truncate font-medium text-ink">{o.package?.name}</span><span className="text-xs text-muted">{o.customer?.name}, {fmtDate(o.createdAt, { month: 'short', day: 'numeric' })}</span></span>
                <Status s={o.status} />
              </Link>
            )) : <Empty>No orders yet.</Empty>}
          </Panel>
          <Panel title="Latest messages" href="/admin/messages">
            {s.recentMessages.length ? s.recentMessages.map((m) => (
              <Link key={m._id} href="/admin/messages" className="block px-5 py-3 hover:bg-raised/50">
                <span className="flex justify-between gap-3"><span className={`truncate ${m.read ? 'text-body' : 'font-semibold text-ink'}`}>{m.name}</span><span className="shrink-0 text-xs text-muted">{fmtDate(m.createdAt, { month: 'short', day: 'numeric' })}</span></span>
                <span className="block truncate text-sm text-muted">{m.message}</span>
              </Link>
            )) : <Empty>No messages yet.</Empty>}
          </Panel>
        </div>
      )}
    </div>
  );
}

function SeedBox({ onDone }) {
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState('');
  const go = async () => { setBusy(true); try { await api('/api/admin/seed', { method: 'POST' }); setMsg('Starter content added.'); onDone(); } catch (e) { setMsg(e.message); } setBusy(false); };
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-signal/40 bg-signal/10 p-5">
      <div><p className="font-semibold text-ink">Your database is empty</p><p className="text-sm text-muted">Load your existing projects, packages, resume, FAQ and posts so you can edit them.</p>{msg && <p className="mt-1 text-sm text-ink">{msg}</p>}</div>
      <button onClick={go} disabled={busy} className="btn-primary btn-sm">{busy ? 'Loading…' : 'Load starter content'}</button>
    </div>
  );
}

const Panel = ({ title, href, children }) => <div className="overflow-hidden rounded-2xl border border-line bg-surface"><div className="flex items-center justify-between border-b border-line px-5 py-3.5"><h2 className="font-semibold">{title}</h2><Link href={href} className="text-sm text-signal">See all</Link></div><div className="divide-y divide-line">{children}</div></div>;
const Empty = ({ children }) => <p className="px-5 py-8 text-center text-sm text-muted">{children}</p>;
