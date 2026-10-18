import CodeInjector from './CodeInjector';
import { getSettings, getPageSeo } from '@/lib/data';
import { enhanceGraph } from '@/lib/schema-extra';

const safe = (css = '') => String(css).replace(/<\/?style[^>]*>/gi, '');

/* The page's single combined JSON-LD graph, plus this page's own head, body and CSS code from its SEO > Code tab.
   Pass item (the page, post, project...) or builtin ("home", "blog"...) so the page's own SEO settings apply. */
export default async function JsonLd({ data, item, builtin }) {
  const [seo, site, own] = await Promise.all([getSettings('seo'), getSettings('site'), builtin ? getPageSeo(builtin) : null]);
  const page = item || own || {};
  const graph = seo.schema?.enabled === false ? null : enhanceGraph(data, { seo, site, page });
  const code = page.code || {};
  return (
    <>
      {graph && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, '\\u003c') }} />}
      {code.css?.trim() && <style dangerouslySetInnerHTML={{ __html: safe(code.css) }} />}
      {code.head?.trim() && <CodeInjector html={code.head} where="head" />}
      {code.bodyStart?.trim() && <CodeInjector html={code.bodyStart} where="bodyStart" />}
      {code.bodyEnd?.trim() && <CodeInjector html={code.bodyEnd} where="bodyEnd" />}
    </>
  );
}
