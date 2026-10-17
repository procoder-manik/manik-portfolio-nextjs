import { siteUrl } from '@/lib/utils';
export default function robots() {
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/checkout', '/order', '/invoice', '/account'] }], sitemap: `${siteUrl()}/sitemap.xml` };
}
