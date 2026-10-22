import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import Integrations from '@/components/site/Integrations';
import ChatWidget from '@/components/site/ChatWidget';
import BackToTop from '@/components/site/BackToTop';
import CodeInjector from '@/components/site/CodeInjector';
import Motion from '@/components/site/Motion';
import RefTracker from '@/components/site/RefTracker';
import PitchBeacon from '@/components/site/PitchBeacon';
import PitchHello from '@/components/site/PitchHello';
import AnnouncementBar from '@/components/site/AnnouncementBar';
import PopupManager from '@/components/site/PopupManager';
import { getAllSettings, getNavPages, getApps, getPopups, getHiddenPaths, getAreas, getServiceAreas } from '@/lib/data';
import { resolveMega, needsAreas } from '@/lib/mega';
import { cleanCustom, customCss, fontsHref } from '@/lib/theme';
import { dropPaths } from '@/lib/menu';
import { samePath } from '@/lib/system-pages';
import { caseStudiesOn, isCaseStudyLink, accountsOn, backToTopOn, backToTopSide, chatSide } from '@/lib/features';

export default async function SiteLayout({ children }) {
  const [{ site, navigation, integrations, announcement, popups: popupRules }, pages, apps, popups, hidden] = await Promise.all([getAllSettings(), getNavPages(), getApps({ footer: true }), getPopups(), getHiddenPaths()]);
  const chat = integrations.chat || {};
  const cs = caseStudiesOn(site);
  // Menus come only from Header and footer (each page's Menus switches write there). Case-study links hide when the feature is off.
  const customTones = cleanCustom(site.theme?.custom);
  const defaultTone = customTones.find((t) => t.makeDefault)?.id || site.theme?.defaultTone || 'blue';
  const header0 = (navigation.header || []).filter((l) => cs || !isCaseStudyLink(l.href));
  const areaData = needsAreas(header0) ? await Promise.all([getAreas(), getServiceAreas()]) : [[], []];
  const header = resolveMega(header0, { areas: areaData[0], pages: areaData[1] });
  const extra = pages.filter((p) => p.showInHeader && !header.some((l) => samePath(l.href, `/${p.slug}`))).map((p) => ({ label: p.title, href: `/${p.slug}` }));
  const headerLinks = dropPaths([...header, ...extra], hidden);
  let footerColumns = (navigation.footerColumns || []).map((c) => ({ ...c, links: (c.links || []).filter((l) => cs || !isCaseStudyLink(l.href)) }));
  footerColumns = footerColumns.map((c) => ({ ...c, links: dropPaths(c.links, hidden) }));
  const inColumns = (p) => footerColumns.some((c) => c.links.some((l) => samePath(l.href, `/${p.slug}`)));
  const cta = navigation.cta && hidden.some((h) => samePath(navigation.cta.href, h)) ? { ...navigation.cta, show: false } : navigation.cta;
  return (
    <>
      {customTones.length > 0 && <style dangerouslySetInnerHTML={{ __html: customCss(customTones) }} />}
      {fontsHref(customTones) && <link rel="stylesheet" href={fontsHref(customTones)} />}
      <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `(function(){try{var c=${JSON.stringify({ m: site.theme?.defaultMode || 'system', t: defaultTone }).replace(/</g, '\\u003c')},d=document.documentElement,s=localStorage;if(!s.getItem('theme')&&c.m!=='system'){d.dataset.mode=c.m;d.dataset.theme=c.m;}if(!s.getItem('tone')&&c.t&&c.t!=='blue'){d.dataset.tone=c.t;}}catch(e){}})();` }} />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-signal focus:px-4 focus:py-2 focus:text-white">Skip to content</a>
      {announcement?.enabled && <AnnouncementBar cfg={announcement} />}
      <Header theme={{ ...site.theme, defaultTone, custom: customTones.map((t) => ({ id: t.id, name: t.name, color: t.accentDark || t.accent })) }} site={site} links={headerLinks} cta={cta} account={accountsOn(site)} />
      <main id="main">{children}</main>
      <Footer site={site} nav={{ ...navigation, footerColumns }} pages={navigation.showPagesInFooter ? pages.filter((p) => p.showInFooter && !inColumns(p)) : []} apps={navigation.showAppsInFooter ? apps : []} />
      <Integrations cfg={integrations} />
      <Motion />
      <RefTracker />
      <PitchBeacon />
      <PitchHello />
      {popupRules?.enabled !== false && popups.length > 0 && <PopupManager popups={popups} rules={popupRules} />}
      {backToTopOn(site) && <BackToTop side={backToTopSide(site)} stack={chat.mode === 'builtin' && chatSide(chat) === backToTopSide(site)} />}
      {chat.mode === 'builtin' && <ChatWidget cfg={chat} site={{ avatar: site.avatar, email: site.email, whatsapp: site.whatsapp, replyTime: site.replyTime }} />}
      {chat.mode === 'embed' && <CodeInjector html={chat.embedCode} where="bodyEnd" />}
    </>
  );
}
