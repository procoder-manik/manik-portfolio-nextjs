import { NextResponse } from 'next/server';
import { dbConnect, hasDB } from '@/lib/db';
import { Category } from '@/lib/models';
import { adminRoute as guard } from '@/lib/server-auth';
import { getSettingsFresh } from '@/lib/data';
import { itemGraph, schemaChecks, EXPLAIN } from '@/lib/schema-item';
import { refreshContent } from '@/lib/revalidate';
const adminRoute = (h) => guard(h, 'seo');
const OK = ['posts', 'projects', 'case-studies', 'pages', 'categories'];

/* POST { resource, doc, rebuild } -> the page's schema built from the current form (saved or not), with what each part means.
   rebuild:true also refreshes the live page so it prints the new schema right away. */
export const POST = adminRoute(async (req) => {
  const { resource, doc, rebuild } = await req.json();
  if (!OK.includes(resource)) throw new Error('Schema preview is not available here.');
  const [site, seo] = await Promise.all([getSettingsFresh('site'), getSettingsFresh('seo')]);
  let category = null;
  if (resource === 'posts' && doc?.category && hasDB()) { await dbConnect(); category = await Category.findOne({ name: doc.category }).select('name slug').lean(); }
  const graph = itemGraph(resource, doc, { site, seo, category });
  if (rebuild) refreshContent();
  const parts = (graph?.['@graph'] || []).map((n) => { const t = Array.isArray(n['@type']) ? n['@type'][0] : n['@type']; return { type: t, explain: EXPLAIN[t] || '', count: t === 'FAQPage' ? (n.mainEntity || []).length : undefined }; });
  return NextResponse.json({ graph, parts, checks: schemaChecks(graph, resource, doc), rebuilt: !!rebuild, at: Date.now() });
});
