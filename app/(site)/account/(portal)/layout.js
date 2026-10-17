import { notFound, redirect } from 'next/navigation';
import { getSettings } from '@/lib/data';
import { accountsOn } from '@/lib/features';
import { getCustomer, messageFilter } from '@/lib/customers';
import { dbConnect } from '@/lib/db';
import { Message } from '@/lib/models';
import { AccountNav } from '@/components/account/Forms';
import { refSettings } from '@/lib/referrals';

export const metadata = { title: { default: 'My account', template: '%s | My account' }, robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function PortalLayout({ children }) {
  if (!accountsOn(await getSettings('site'))) notFound();
  const me = await getCustomer();
  if (!me) redirect('/account/login');
  await dbConnect();
  // Threads with a reply newer than the customer's last visit to Messages.
  const unread = await Message.countDocuments({ ...messageFilter(me), 'replies.0': { $exists: true }, ...(me.messagesSeenAt ? { updatedAt: { $gt: me.messagesSeenAt } } : {}) }).catch(() => 0);
  const r = await refSettings();
  return (
    <section className="pb-24 pt-28 sm:pt-32">
      <div className="shell">
        <AccountNav name={me.name} avatar={me.avatar} unread={unread} referral={Boolean(r.referral?.enabled)} affiliate={Boolean(r.affiliate?.enabled || me.affiliate?.status === 'approved')} />
        <div className="pt-8 sm:pt-10">{children}</div>
      </div>
    </section>
  );
}
