import Link from 'next/link';
import { ArrowUpRight, Clock3 } from 'lucide-react';
import ScrollShot from './ScrollShot';
import { projectDuration } from '@/lib/utils';

export function platformLabel(p) {
  return p.platformType === 'custom' ? 'Custom code' : p.cms || 'CMS';
}

export default function ProjectCard({ project: p, priority }) {
  const img = p.scrollImage || p.bannerImage;
  const tech = (p.technologies || []).slice(0, 4);
  const dur = projectDuration(p);
  return (
    <article className="group relative flex flex-col">
      <Link href={`/portfolio/${p.slug}`} className="block rounded-2xl" aria-label={`${p.title}: view project`}>
        <ScrollShot src={img} alt={`${p.title} full-page screenshot`} url={p.liveUrl} direction={p.scrollDirection} accent={p.accent} eager={priority}
          className="transition-[transform,box-shadow,border-color] duration-500 ease-out group-hover:-translate-y-1 group-hover:border-ink/25 group-hover:shadow-[0_40px_80px_-40px_rgb(var(--signal)/.45)]" />
      </Link>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-[1.35rem] font-semibold">
            <Link href={`/portfolio/${p.slug}`}>{p.title}</Link>
          </h3>
          <p className="mt-1 text-[0.95rem] text-muted">{p.industry}</p>
        </div>
        {p.liveUrl && (
          <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line text-ink transition hover:border-signal hover:bg-signal hover:text-white" aria-label={`Visit ${p.title} live site`}>
            <ArrowUpRight size={17} />
          </a>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="chip border-transparent font-semibold text-white" style={{ background: p.accent || 'rgb(var(--signal))' }}>{platformLabel(p)}</span>
        {tech.map((t) => <span key={t} className="chip">{t}</span>)}
        {dur && <span className="chip"><Clock3 size={12} />{dur}</span>}
      </div>
    </article>
  );
}
