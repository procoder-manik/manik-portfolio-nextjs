import './globals.css';
import { getSettings } from '@/lib/data';
import { siteUrl } from '@/lib/utils';

export const revalidate = 600;

export async function generateMetadata() {
  const [s, i] = await Promise.all([getSettings('site'), getSettings('integrations')]);
  const seo = i.seo || {};
  const verification = {};
  if (i.searchConsole?.enabled && i.searchConsole.code) verification.google = i.searchConsole.code.replace(/.*content="([^"]+)".*/, '$1').trim();
  if (i.bing?.enabled && i.bing.code) verification.other = { 'msvalidate.01': i.bing.code.replace(/.*content="([^"]+)".*/, '$1').trim() };
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: s.seoTitle, template: seo.titleTemplate || `%s | ${s.name}` },
    description: s.seoDescription,
    keywords: seo.keywords || undefined,
    verification,
    robots: seo.noindex ? { index: false, follow: false } : { index: true, follow: true, googleBot: { 'max-image-preview': 'large' } },
    openGraph: { siteName: s.name, type: 'website', images: s.ogImage ? [s.ogImage] : [] },
    twitter: { card: 'summary_large_image' },
    alternates: { canonical: '/' },
  };
}

export const viewport = { themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#0C1526' }, { media: '(prefers-color-scheme: light)', color: '#F4F6FA' }] };

const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(!t)t='dark';document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
