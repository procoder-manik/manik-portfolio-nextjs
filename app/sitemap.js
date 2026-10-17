import { getProjects, getPosts, getCategories, getAllPages, getCaseStudies, getSettings } from '@/lib/data';

const live = (x) => !x?.seoNoindex;
import { caseStudiesOn } from '@/lib/features';
import { siteUrl } from '@/lib/utils';

export default async function sitemap() {
  const u = siteUrl();
  const [projects, posts, cats, pages, site, ig] = await Promise.all([getProjects(), getPosts(), getCategories(), getAllPages(), getSettings('site'), getSettings('integrations')]);
  const fixed = { '/portfolio': 'portfolio', '/blog': 'blog', '/resume': 'resume', '/pricing': 'pricing', '/contact': 'contact', '/apps': 'apps' };
  const cases = caseStudiesOn(site) ? await getCaseStudies() : [];
  const now = new Date();
  return [
    ...['', '/portfolio', '/blog', '/resume', '/pricing', '/contact', '/apps'].filter((p) => !ig.pages?.[fixed[p]]?.seoNoindex).map((p) => ({ url: `${u}${p}`, lastModified: now, changeFrequency: 'weekly', priority: p === '' ? 1 : 0.8 })),
    ...projects.filter(live).map((p) => ({ url: `${u}/portfolio/${p.slug}`, lastModified: p.updatedAt || now, priority: 0.7 })),
    ...posts.filter(live).map((p) => ({ url: `${u}/blog/${p.slug}`, lastModified: p.updatedAt || p.publishedAt || now, priority: 0.6 })),
    ...cats.filter(live).map((c) => ({ url: `${u}/blog/category/${c.slug}`, lastModified: now, priority: 0.4 })),
    ...(caseStudiesOn(site) && !ig.pages?.caseStudies?.seoNoindex ? [{ url: `${u}/case-studies`, lastModified: now, priority: 0.8 }] : []),
    ...cases.filter(live).map((c) => ({ url: `${u}/case-studies/${c.slug}`, lastModified: c.updatedAt || now, priority: 0.7 })),
    ...pages.filter(live).map((p) => ({ url: `${u}/${p.slug}`, lastModified: p.updatedAt || now, priority: 0.5 })),
  ];
}
