import './globals.css';
import { Inter } from 'next/font/google';
import { getSettings } from '@/lib/data';
import { siteUrl } from '@/lib/utils';

export const revalidate = 600;

/* SF Pro on Apple devices; Inter (served from this site, no extra request to Google) everywhere else. */
const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

export async function generateMetadata() {
  const [s, i, seo] = await Promise.all([getSettings('site'), getSettings('integrations'), getSettings('seo')]);
  const verification = {};
  if (i.searchConsole?.enabled && i.searchConsole.code) verification.google = i.searchConsole.code.replace(/.*content="([^"]+)".*/, '$1').trim();
  if (i.bing?.enabled && i.bing.code) verification.other = { 'msvalidate.01': i.bing.code.replace(/.*content="([^"]+)".*/, '$1').trim() };
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: s.seoTitle, template: seo.titleTemplate || `%s | ${s.name}` },
    description: s.seoDescription,
    keywords: seo.keywords || undefined,
    verification,
    robots: seo.noindex ? { index: false, follow: false } : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': seo.defaults?.maxImagePreview || 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
    openGraph: { siteName: s.name, type: 'website', locale: seo.social?.locale || 'en_US', images: s.ogImage ? [s.ogImage] : [] },
    twitter: { card: seo.defaults?.twitterCard || 'summary_large_image', ...(seo.social?.twitter ? { site: seo.social.twitter, creator: seo.social.twitter } : {}) },
    ...(seo.social?.facebookAppId ? { facebook: { appId: seo.social.facebookAppId } } : {}),
    alternates: { canonical: '/', types: { 'application/rss+xml': '/feed.xml' } },
  };
}

export const viewport = { themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#121317' }, { media: '(prefers-color-scheme: light)', color: '#F5F5F7' }] };

/* Runs before the page paints. The visitor's choice (theme: system | light | dark, tone) is read from localStorage;
   with no choice yet it follows the device (system). data-theme is always the resolved light or dark. */
const themeScript = `(function(){var d=document.documentElement;try{var s=localStorage,m=s.getItem('theme');if(m!=='light'&&m!=='dark'&&m!=='system')m='system';var r=m==='system'?(window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):m;d.dataset.mode=m;d.dataset.theme=r;var t=s.getItem('tone');if(t)d.dataset.tone=t;}catch(e){d.dataset.theme='light';d.dataset.mode='system';}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light" data-mode="system" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Browser extensions sometimes add attributes to this tag before React loads; this stops the harmless mismatch warning in development. */}
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
