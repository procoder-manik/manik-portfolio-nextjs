'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Sparkles, Brain, Newspaper, HelpCircle, ClipboardList, MessageSquareText, Megaphone, ArrowRightLeft, SearchCheck, Unlink, UserCog, Bell, Trophy, Users, UserRoundCheck, TicketPercent, Handshake, Gift, AppWindow, Plug, PanelsTopLeft, MailCheck, LayoutDashboard, Briefcase, PenSquare, Tags, Layers, Package, ShoppingBag, Inbox, FileText, Image, Home, User, Settings, CreditCard, ScrollText, LogOut, ExternalLink, Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/site/Header';
import { cn } from '@/lib/utils';
import { can, areaForPath, ROLES } from '@/lib/roles';

const NAV = [
  ['Overview', [['/admin', 'Dashboard', LayoutDashboard]]],
  ['Content', [['/admin/projects', 'Portfolio', Briefcase], ['/admin/case-studies', 'Case studies', Trophy], ['/admin/posts', 'Blog posts', PenSquare], ['/admin/categories', 'Categories', Tags], ['/admin/pages', 'Pages', FileText], ['/admin/apps', 'Products', AppWindow], ['/admin/media', 'Media', Image]]],
  ['AI', [['/admin/ai-writer', 'AI writer', Sparkles], ['/admin/ai-news', 'AI news', Newspaper], ['/admin/ai-iq', 'AI IQ (chatbot brain)', Brain], ['/admin/knowledge', 'Taught answers', HelpCircle]]],
  ['Marketing', [['/admin/forms', 'Forms', ClipboardList], ['/admin/entries', 'Form answers', MessageSquareText], ['/admin/popups', 'Popups', Megaphone], ['/admin/settings/announcement', 'Announcement bar', Bell], ['/admin/redirects', 'Redirects', ArrowRightLeft], ['/admin/not-found-log', '404 log', Unlink]]],
  ['SEO', [['/admin/seo-overview', 'SEO overview', SearchCheck], ['/admin/settings/seo', 'SEO settings', Settings]]],
  ['Shop', [['/admin/services', 'Services', Layers], ['/admin/packages', 'Packages', Package], ['/admin/orders', 'Orders', ShoppingBag], ['/admin/customers', 'Customers', UserRoundCheck], ['/admin/coupons', 'Coupons', TicketPercent], ['/admin/affiliates', 'Referrals and affiliates', Handshake], ['/admin/messages', 'Messages', Inbox], ['/admin/crm', 'CRM', Users]]],
  ['Site', [['/admin/settings/home', 'Home page', Home], ['/admin/settings/resume', 'Resume', ScrollText], ['/admin/settings/site', 'Site and contact', Settings], ['/admin/settings/navigation', 'Header and footer', PanelsTopLeft], ['/admin/settings/popups', 'Popup rules', Megaphone], ['/admin/settings/payments', 'Payments', CreditCard], ['/admin/settings/referrals', 'Referral settings', Gift], ['/admin/settings/email', 'Emails', MailCheck], ['/admin/settings/integrations', 'Analytics and integrations', Plug], ['/admin/users', 'Users', UserCog], ['/admin/account', 'Account', User]]],
];

export default function Sidebar({ role = 'administrator', name = '' }) {
  const path = usePathname(); const router = useRouter(); const [open, setOpen] = useState(false);
  const active = (h) => (h === '/admin' ? path === h : path.startsWith(h));
  const logout = async () => { await fetch('/api/admin/auth', { method: 'DELETE' }); router.replace('/admin/login'); };
  return (
    <>
      <button onClick={() => setOpen(true)} className="fixed left-4 top-4 z-40 grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface lg:hidden" aria-label="Open menu"><Menu size={18} /></button>
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={cn('fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-surface transition-transform lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex items-center justify-between px-5 py-5">
          <Link href="/admin" className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-signal font-display text-sm font-bold text-white">MH</span><span className="font-display font-semibold text-ink">Admin</span></Link>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {NAV.map(([g, all]) => { const items = all.filter(([h]) => can(role, areaForPath(h))); return !items.length ? null : (
            <div key={g} className="mb-4">
              <p className="px-3 pb-1.5 text-xs font-medium text-muted">{g}</p>
              {items.map(([h, l, I]) => (
                <Link key={h} href={h} onClick={() => setOpen(false)} className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition', active(h) ? 'bg-signal/15 font-medium text-ink' : 'text-body hover:bg-raised hover:text-ink')}>
                  <I size={16} className={active(h) ? 'text-signal' : 'text-muted'} />{l}
                </Link>
              ))}
            </div>
          ); })}
        </nav>
        <p className="truncate border-t border-line px-5 pt-3 text-xs text-muted">{name ? `${name}, ` : ''}{ROLES[role]?.label}</p>
        <div className="flex items-center gap-2 p-3">
          <a href="/" target="_blank" className="btn-ghost btn-sm flex-1"><ExternalLink size={14} />View site</a>
          <ThemeToggle className="h-9 w-9" />
          <button onClick={logout} className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted hover:text-bad" aria-label="Sign out" title="Sign out"><LogOut size={15} /></button>
        </div>
      </aside>
    </>
  );
}
