import { buildGraph, crumbs, faqNode, faqFromMarkdown, postNode, projectNode, caseNode, serviceAreaNode } from './schema';
import { enhanceGraph } from './schema-extra';

/* What each part of a page's schema means, in plain words. Shown in the admin so the schema is easy to learn. */
export const EXPLAIN = {
  BlogPosting: 'Tells Google this page is a blog article: its headline, image, author and dates. Can help it appear as an article result.',
  Article: 'Tells Google this page is an article or case study: headline, image, author and dates.',
  CreativeWork: 'Tells Google this page describes a piece of work you made (a project): name, summary, image, technologies.',
  WebPage: 'Tells Google this is a normal web page and what it is called.',
  FAQPage: 'Lists the questions and answers on the page. Google can show them under your result as expandable questions.',
  BreadcrumbList: 'The path to this page (Home, Blog, Post). Google shows it instead of a long URL.',
  Person: 'You: your name, job, photo and profiles. Helps Google connect your pages to one real person.',
  ProfessionalService: 'Your business: name, contact details, area served. Helps local and brand searches.',
  WebSite: 'The whole website, so Google knows who publishes it.',
  Service: 'Describes a service you sell, with an optional price.', Product: 'Describes something people can buy, with price and rating.',
  SoftwareApplication: 'Describes an app: category, system and price.', Event: 'An event with date, place and price.', HowTo: 'A numbered how-to guide with steps.',
  Course: 'A course you teach.', VideoObject: 'A video on the page.', LocalBusiness: 'Your local business details.',
};

const NODE = (g) => g['@type'];

/* The same graph the live page prints, built from a saved item. resource: posts | projects | case-studies | pages | categories. */
export function itemGraph(resource, doc, { site, seo, category }) {
  const d = doc || {}; const slug = d.slug || 'your-page';
  let extras = [];
  if (resource === 'posts') {
    const faq = faqFromMarkdown(d.content);
    extras = [crumbs([['Home', '/'], ['Blog', '/blog'], ...(category ? [[category.name, `/blog/category/${category.slug}`]] : []), [d.title || 'Post', `/blog/${slug}`]]), postNode({ ...d, slug }), faqNode(faq.length ? faq : (d.aiMeta?.faq || []).map((f) => ({ q: f.q, a: f.a })))];
  } else if (resource === 'projects') extras = [crumbs([['Home', '/'], ['Portfolio', '/portfolio'], [d.title || 'Project', `/portfolio/${slug}`]]), projectNode({ ...d, slug })];
  else if (resource === 'case-studies') extras = [crumbs([['Home', '/'], ['Case studies', '/case-studies'], [d.client || d.title || 'Case study', `/case-studies/${slug}`]]), caseNode({ ...d, slug })];
  else if (resource === 'service-areas') {
    const faqs = (d.blocks || []).filter((b) => b && !b.hidden && b.type === 'faq' && !b.useSite).flatMap((b) => b.items || []);
    extras = [crumbs([['Home', '/'], ['Service areas', '/service-areas'], [d.title || 'Service area', `/service-areas/${slug}`]]), serviceAreaNode({ ...d, slug }, null), faqNode(faqs)];
  } else if (resource === 'area-categories') extras = [crumbs([['Home', '/'], ['Service areas', '/service-areas'], [d.name || 'Place', `/service-areas/${slug}`]])];
  else if (resource === 'pages') {
    const blocks = (d.blocks || []).filter((b) => b && !b.hidden);
    const faqs = [...blocks.filter((b) => b.type === 'faq' && !b.useSite).flatMap((b) => b.items || []), ...faqFromMarkdown(d.content)];
    extras = [crumbs([['Home', '/'], [d.title || 'Page', `/${slug}`]]), faqNode(faqs), { '@type': 'WebPage', name: d.seoTitle || d.title, description: d.seoDescription }];
  } else if (resource === 'categories') extras = [crumbs([['Home', '/'], ['Blog', '/blog'], [d.name || 'Category', `/blog/category/${slug}`]])];
  const data = buildGraph(site, extras);
  return seo?.schema?.enabled === false ? null : enhanceGraph(data, { seo: seo || {}, site, page: d });
}

/* Plain checks on the main node so you know what to fix. */
export function schemaChecks(graph, resource, doc) {
  const out = []; const g = graph?.['@graph'] || [];
  const main = g.find((n) => ['BlogPosting', 'Article', 'CreativeWork', 'Service', 'Product', 'SoftwareApplication', 'Event', 'HowTo', 'Course', 'VideoObject'].includes(NODE(n)));
  if (!graph) { out.push({ level: 'bad', text: 'Schema is switched off for the whole site (SEO settings > Schema). Turn it on so Google can read it.' }); return out; }
  if (main) {
    if (!(main.description || '').toString().trim()) out.push({ level: 'warn', text: 'No description in the schema. Write a meta description or short summary.' });
    if (!main.image) out.push({ level: 'warn', text: 'No image in the schema. Add a cover or social share image: articles with an image qualify for more search features.' });
    if (['BlogPosting', 'Article'].includes(NODE(main)) && !main.datePublished) out.push({ level: 'warn', text: 'No publish date yet. It is added when you publish.' });
    if (NODE(main) === 'BlogPosting' && !main.headline) out.push({ level: 'bad', text: 'The article has no headline. Add a title.' });
  }
  if (resource === 'posts' && !g.some((n) => NODE(n) === 'FAQPage')) out.push({ level: 'info', text: 'No FAQ schema. Add a "Frequently asked questions" section with a question heading and answer under each to get it automatically.' });
  if (!out.length) out.push({ level: 'good', text: 'Looks complete. Test it any time with Google Rich Results Test.' });
  return out;
}
