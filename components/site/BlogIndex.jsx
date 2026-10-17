import Link from 'next/link';
import PostCard from './PostCard';
import { fmtDate } from '@/lib/utils';

export default function BlogIndex({ posts, updates, cats, active, title, intro }) {
  const catMap = Object.fromEntries(cats.map((c) => [c.slug, c]));
  const featured = posts.find((p) => p.featured) || posts[0];
  const rest = posts.filter((p) => p !== featured);
  return (
    <>
      <section className="relative overflow-hidden pb-12 pt-36 sm:pt-44">
        <div className="grid-paper pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_80%_at_20%_0%,#000,transparent)]" />
        <div className="shell relative">
          <h1 className="h-display max-w-[14ch]">{title}</h1>
          {intro && <p className="lede mt-6">{intro}</p>}
          <nav className="mt-10 flex flex-wrap gap-2" aria-label="Categories">
            <Pill href="/blog" on={!active}>All posts</Pill>
            {cats.map((c) => <Pill key={c.slug} href={`/blog/category/${c.slug}`} on={active === c.slug} color={c.color}>{c.name}</Pill>)}
          </nav>
        </div>
      </section>
      <section className="pb-28">
        <div className="shell grid gap-16 lg:grid-cols-[2.2fr_1fr]">
          <div>
            {featured ? <PostCard post={featured} cats={catMap} large /> : <p className="text-muted">No posts here yet.</p>}
            {rest.length > 0 && <div className="mt-16 grid gap-x-8 gap-y-14 border-t border-line pt-14 sm:grid-cols-2">{rest.map((p) => <PostCard key={p.slug} post={p} cats={catMap} />)}</div>}
          </div>
          <aside className="space-y-10 lg:sticky lg:top-28 lg:self-start">
            {updates?.length > 0 && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold">Daily updates</h2>
                <p className="mt-1 text-sm text-muted">Short notes on what I shipped.</p>
                <ol className="mt-6 space-y-6 border-l border-line">
                  {updates.map((u) => (
                    <li key={u.slug} className="relative pl-5">
                      <span className="absolute -left-[4.5px] top-2 h-2 w-2 rounded-full bg-amber" />
                      <p className="text-xs text-muted">{fmtDate(u.publishedAt, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      <Link href={`/blog/${u.slug}`} className="mt-1 block font-medium leading-snug text-ink hover:text-signal">{u.title}</Link>
                      {u.excerpt && <p className="mt-1 line-clamp-2 text-sm text-muted">{u.excerpt}</p>}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <div className="rounded-[22px] border border-line bg-gradient-to-br from-signal/15 to-transparent p-6">
              <p className="font-display text-xl font-semibold text-ink">Need a hand with your site?</p>
              <p className="mt-2 text-sm text-muted">Most of these posts started as a client problem. Yours could be next.</p>
              <Link href="/contact" className="btn-primary btn-sm mt-5">Get in touch</Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function Pill({ href, on, color, children }) {
  return (
    <Link href={href} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[0.92rem] font-medium transition ${on ? 'border-ink bg-ink text-base' : 'border-line text-body hover:border-ink/40 hover:text-ink'}`}>
      {color && <span className="h-2 w-2 rounded-full" style={{ background: color }} />}{children}
    </Link>
  );
}
