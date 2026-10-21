import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import Integrations from '@/components/site/Integrations';
import ChatWidget from '@/components/site/ChatWidget';
import BackToTop from '@/components/site/BackToTop';
import CodeInjector from '@/components/site/CodeInjector';
import Motion from '@/components/site/Motion';
import RefTracker from '@/components/site/RefTracker';
import AnnouncementBar from '@/components/site/AnnouncementBar';
import PopupManager from '@/components/site/PopupManager';
import { getAllSettings, getNavPages, getApps, getPopups, getHiddenPaths } from '@/lib/data';
import { dropPaths } from '@/lib/menu';
import { samePath } from '@/lib/system-pages';
import { caseStudiesOn, isCaseStudyLink, accountsOn, backToTopOn, backToTopSide, chatSide } from '@/lib/features';

export default async function SiteLayout({ children }) {
  const [{ site, navigation, integrations, announcement, popups: popupRules }, pages, apps, popups, hidden] = await Promise.all([getAllSettings(), getNavPages(), getApps({ footer: true }), getPopups(), getHiddenPaths()]);
  const chat = integrations.chat || {};
  const cs = caseStudiesOn(site);
  // Menus come only from Header and footer (each page's Menus switches write there). Case-study links hide when the feature is off.
  const header = (navigation.header || []).filter((l) => cs || !isCaseStudyLink(l.href));
  const extra = pages.filter((p) => p.showInHeader && !header.some((l) => samePath(l.href, `/${p.slug}`))).map((p) => ({ label: p.title, href: `/${p.slug}` }));
  const headerLinks = dropPaths([...header, ...extra], hidden);
  let footerColumns = (navigation.footerColumns || []).map((c) => ({ ...c, links: (c.links || []).filter((l) => cs || !isCaseStudyLink(l.href)) }));
  footerColumns = footerColumns.map((c) => ({ ...c, links: dropPaths(c.links, hidden) }));
  const inColumns = (p) => footerColumns.some((c) => c.links.some((l) => samePath(l.href, `/${p.slug}`)));
  const cta = navigation.cta && hidden.some((h) => samePath(navigation.cta.href, h)) ? { ...navigation.cta, show: false } : navigation.cta;
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-signal focus:px-4 focus:py-2 focus:text-white">Skip to content</a>
      {announcement?.enabled && <AnnouncementBar cfg={announcement} />}
      <Header site={site} links={headerLinks} cta={cta} account={accountsOn(site)} />
      <main id="main">{children}</main>
      <Footer site={site} nav={{ ...navigation, footerColumns }} pages={navigation.showPagesInFooter ? pages.filter((p) => p.showInFooter && !inColumns(p)) : []} apps={navigation.showAppsInFooter ? apps : []} />
      <Integrations cfg={integrations} />
      <Motion />
      <RefTracker />
      {popupRules?.enabled !== false && popups.length > 0 && <PopupManager popups={popups} rules={popupRules} />}
      {backToTopOn(site) && <BackToTop side={backToTopSide(site)} stack={chat.mode === 'builtin' && chatSide(chat) === backToTopSide(site)} />}
      {chat.mode === 'builtin' && <ChatWidget cfg={chat} site={{ avatar: site.avatar, email: site.email, whatsapp: site.whatsapp, replyTime: site.replyTime }} />}
      {chat.mode === 'embed' && <CodeInjector html={chat.embedCode} where="bodyEnd" />}
    </>
  );
}
