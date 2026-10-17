import { notFound } from 'next/navigation';
import { getSettings } from '@/lib/data';
import { accountsOn } from '@/lib/features';

export const metadata = { robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function AccountAuthLayout({ children }) {
  if (!accountsOn(await getSettings('site'))) notFound();
  return (
    <section className="relative overflow-hidden pb-24 pt-32 sm:pt-40">
      <div className="grid-paper pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_70%_at_50%_0%,#000,transparent)]" />
      <div className="shell relative grid place-items-center">{children}</div>
    </section>
  );
}
