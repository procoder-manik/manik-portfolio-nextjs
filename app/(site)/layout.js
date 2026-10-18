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
import { getAllSettings, getNavPages, getApps, getPopups } from '@/lib/data';
import { caseStudiesOn, isCaseStudyLink, accountsOn, backToTopOn, backToTopSide, chatSide } from '@/lib/features';

export default async function SiteLayout({ children }) {
  const [{ site, navigation, integrations, announcement, popups: popupRules }, pages, apps, popups] = await Promise.all([getAllSettings(), getNavPages(), getApps({ footer: true }), getPopups()]);
  const chat = integrations.chat || {};
  const cs = caseStudiesOn(site);
  const auto = cs && site.features?.caseStudiesInMenu !== false;
  // Case-study links disappear everywhere when the feature is off, and are added automatically when it is on.
  let header = (navigation.header || []).filter((l) => cs || !isCaseStudyLink(l.href));
  if (auto && !header.some((l) => isCaseStudyLink(l.href))) {
    const at = header.findIndex((l) => /portfolio|#work/.test(l.href || ''));
    header = [...header.slice(0, at + 1), { label: 'Case studies', href: '/case-studies' }, ...header.slice(at + 1)];
  }
  const headerLinks = [...header, ...pages.filter((p) => p.showInHeader).map((p) => ({ label: p.title, href: `/${p.slug}` }))];
  let footerColumns = (navigation.footerColumns || []).map((c) => ({ ...c, links: (c.links || []).filter((l) => cs || !isCaseStudyLink(l.href)) }));
  if (auto && footerColumns[0] && !footerColumns.some((c) => c.links.some((l) => isCaseStudyLink(l.href)))) {
    const links = [...footerColumns[0].links]; const at = links.findIndex((l) => /portfolio/.test(l.href || ''));
    links.splice(at + 1, 0, { label: 'Case studies', href: '/case-studies' });
    footerColumns = [{ ...footerColumns[0], links }, ...footerColumns.slice(1)];
  }
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-signal focus:px-4 focus:py-2 focus:text-white">Skip to content</a>
      {announcement?.enabled && <AnnouncementBar cfg={announcement} />}
      <Header site={site} links={headerLinks} cta={navigation.cta} account={accountsOn(site)} />
      <main id="main">{children}</main>
      <Footer site={site} nav={{ ...navigation, footerColumns }} pages={navigation.showPagesInFooter ? pages.filter((p) => p.showInFooter) : []} apps={navigation.showAppsInFooter ? apps : []} />
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
