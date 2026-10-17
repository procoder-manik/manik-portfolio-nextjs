import Link from 'next/link';
import { fmtDate, readingTime } from '@/lib/utils';

export default function PostCard({ post: p, cats = {}, large }) {
  const c = cats[p.category];
  return (
    <article className="group relative flex flex-col">
      <Link href={`/blog/${p.slug}`} className={`block overflow-hidden rounded-2xl border border-line bg-raised ${large ? 'aspect-[16/9]' : 'aspect-[16/10]'}`}>
        {p.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.cover} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]" />
        ) : (
          <div className="grid-paper grid h-full place-items-center p-8"><span className="font-display text-2xl font-semibold text-ink/80">{p.title}</span></div>
        )}
      </Link>
      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
        {c && <Link href={`/blog/category/${c.slug}`} className="relative z-10 inline-flex items-center gap-1.5 font-medium text-ink hover:text-signal"><span className="h-2 w-2 rounded-full" style={{ background: c.color }} />{c.name}</Link>}
        <span>{fmtDate(p.publishedAt, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        <span>{readingTime(p.content)} min read</span>
      </div>
      <h3 className={`mt-2 font-semibold ${large ? 'text-[1.9rem] sm:text-[2.3rem]' : 'text-[1.3rem]'}`}>
        <Link href={`/blog/${p.slug}`} className="transition group-hover:text-signal">{p.title}</Link>
      </h3>
      {p.excerpt && <p className="mt-2 line-clamp-3 text-muted">{p.excerpt}</p>}
    </article>
  );
}
