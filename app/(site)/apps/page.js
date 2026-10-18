import { getApps, getSettings , getPageSeo } from '@/lib/data';
import { seoMeta } from '@/lib/seo';
import AppCard from '@/components/site/AppCard';
import JsonLd from '@/components/site/JsonLd';
import { buildGraph, crumbs } from '@/lib/schema';

export async function generateMetadata() {
  return seoMeta(await getPageSeo('apps'), { title: 'Products', description: 'Apps and SaaS tools built by Manik Hossain.', path: '/apps' });
}

export default async function AppsPage() {
  const [apps, site, home] = await Promise.all([getApps(), getSettings('site'), getSettings('home')]);
  return (
    <>
      <JsonLd builtin="apps" data={buildGraph(site, [crumbs([['Home', '/'], ['Products', '/apps']]), ...apps.map((a) => ({ '@type': 'SoftwareApplication', name: a.name, description: a.tagline, url: a.url || undefined, applicationCategory: a.category || 'BusinessApplication', operatingSystem: 'Web', author: { '@id': `${process.env.NEXT_PUBLIC_SITE_URL || ''}/#person` } }))])} />
      <section className="relative overflow-hidden pb-10 pt-36 sm:pt-44">
        <div className="grid-paper pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_80%_at_20%_0%,#000,transparent)]" />
        <div className="shell relative"><h1 className="h-display max-w-[12ch]">{home.apps?.heading || 'Products'}</h1><p className="lede mt-6">{home.apps?.intro}</p></div>
      </section>
      <section className="pb-28"><div className="shell">
        {apps.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{apps.map((a) => <AppCard key={a.slug} app={a} />)}</div>
          : <p className="rounded-2xl border border-dashed border-line p-12 text-center text-muted">New products are on the way.</p>}
      </div></section>
    </>
  );
}
