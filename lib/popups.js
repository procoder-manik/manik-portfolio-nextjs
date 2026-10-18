/* Popups: defaults, ready-made templates and the targeting rules. Pure, used in admin and on the site. */

export const POPUP_DEFAULTS = {
  active: false, priority: 0, template: 'blank', layout: 'modal', position: 'center', size: 'md', contentType: 'builder',
  content: { badge: '', heading: 'Your headline', body: 'One or two sentences that make the offer clear.', image: '', imagePosition: 'none', icon: '', coupon: '', countdownTo: '', countdownLabel: 'Offer ends in', form: '', note: '', primary: { label: 'Get started', action: 'link', href: '/contact' }, secondary: { label: '', action: 'close', href: '' }, html: '', css: '' },
  design: { theme: 'site', bg: '#0C1526', text: '#ECF1F8', accent: '#6391FF', radius: 'round', overlay: true, overlayOpacity: 60, blur: true, closeButton: true, closeOnOverlay: true, animation: 'zoom', align: 'center' },
  trigger: { load: { enabled: true, delay: 5 }, scroll: { enabled: false, percent: 50 }, exit: { enabled: false }, idle: { enabled: false, seconds: 30 }, click: { enabled: false, selector: '' }, pageviews: { enabled: false, count: 2 } },
  target: { pages: 'all', paths: [], devices: { desktop: true, tablet: true, mobile: true }, visitors: 'all', referrer: '', startAt: '', endAt: '' },
  frequency: { mode: 'days', days: 7, stopAfterConversion: true },
};

const T = (id, name, desc, doc) => ({ id, name, desc, doc });
const inDays = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 16);

export const POPUP_TEMPLATES = [
  T('offer-split', 'Discount offer', 'Image on the left, a big offer, a coupon code with copy button and a countdown.', {
    layout: 'modal', size: 'lg', content: { badge: 'Limited offer', heading: 'Get 20% off your new website', body: 'Order any website package this week and use the code at checkout.', image: '/seed/work/work-jslaw.svg', imagePosition: 'left', coupon: 'WELCOME20', countdownTo: inDays(5), countdownLabel: 'Offer ends in', primary: { label: 'See packages', action: 'link', href: '/pricing' }, secondary: { label: 'No thanks', action: 'close' }, note: 'One code per customer. Cannot be combined with other offers.' },
    design: { theme: 'site', animation: 'zoom', align: 'left' }, trigger: { load: { enabled: true, delay: 6 } },
  }),
  T('newsletter', 'Newsletter or lead form', 'Centred card with an icon and one of your builder forms.', {
    layout: 'modal', size: 'md', content: { icon: '✉️', heading: 'Get my best website tips', body: 'One short email a month. No spam, unsubscribe any time.', form: '', primary: { label: '' }, secondary: { label: '' }, note: 'Pick a form in Content > Form. Without one, a button is shown.' },
    design: { theme: 'site', animation: 'slide-up', align: 'center' }, trigger: { load: { enabled: false }, scroll: { enabled: true, percent: 40 } },
  }),
  T('lead-magnet', 'Free audit (image on top)', 'Wide image on top, headline, short pitch and one strong button.', {
    layout: 'modal', size: 'md', content: { image: '/seed/work/work-seoshut.svg', imagePosition: 'top', badge: 'Free', heading: 'Get a free website and SEO audit', body: 'I will record a short video review of your site with the quick wins that bring more leads.', primary: { label: 'Request my audit', action: 'link', href: '/contact?service=Website%20audit' }, secondary: { label: 'Maybe later', action: 'close' } },
    design: { theme: 'site', animation: 'zoom', align: 'center' }, trigger: { load: { enabled: true, delay: 15 } },
  }),
  T('exit-intent', 'Exit intent: wait!', 'Small card shown when the mouse leaves the window, to win back leaving visitors.', {
    layout: 'modal', size: 'sm', content: { icon: '👋', heading: 'Before you go…', body: 'Have a project in mind? Book a free 30-minute call and get a clear plan and price.', primary: { label: 'Book a free call', action: 'link', href: '/contact' }, secondary: { label: 'No thanks', action: 'close' } },
    design: { theme: 'brand', animation: 'zoom', align: 'center' }, trigger: { load: { enabled: false }, exit: { enabled: true } }, frequency: { mode: 'days', days: 3 },
  }),
  T('slide-call', 'Book a call (corner slide-in)', 'A friendly card that slides in at the bottom corner without blocking the page.', {
    layout: 'slidein', position: 'bottom-right', size: 'sm', content: { image: '/seed/img/manik-portrait.jpg', imagePosition: 'left', heading: 'Questions about your site?', body: 'I reply within one working day.', primary: { label: 'Chat on WhatsApp', action: 'link', href: 'https://wa.me/8801650043801', newTab: true }, secondary: { label: '' } },
    design: { theme: 'site', overlay: false, animation: 'slide-up', align: 'left' }, trigger: { load: { enabled: false }, scroll: { enabled: true, percent: 60 } },
  }),
  T('bottom-bar', 'Bottom notice bar', 'A slim full-width bar at the bottom, for news, offers or a cookie notice.', {
    layout: 'bar', position: 'bottom', size: 'md', content: { icon: '🚀', heading: 'New: Website care plans from $49/month.', body: '', primary: { label: 'Learn more', action: 'link', href: '/pricing' }, secondary: { label: '' } },
    design: { theme: 'brand', overlay: false, animation: 'slide-up', align: 'center' }, trigger: { load: { enabled: true, delay: 2 } },
  }),
  T('fullscreen', 'Full-screen welcome', 'A bold full-screen takeover with a background image. Use sparingly.', {
    layout: 'fullscreen', size: 'xl', content: { image: '/seed/work/work-bmccentre.svg', imagePosition: 'background', badge: 'Now booking', heading: 'Websites that turn visitors into clients', body: '550+ websites delivered for clients in 14 countries.', primary: { label: 'Start a project', action: 'link', href: '/contact' }, secondary: { label: 'Look around first', action: 'close' } },
    design: { theme: 'dark', animation: 'fade', align: 'center' }, trigger: { load: { enabled: true, delay: 1 } }, frequency: { mode: 'once' },
  }),
  T('drawer', 'Side drawer with form', 'A panel that slides in from the side, good for a quote form.', {
    layout: 'drawer', position: 'right', size: 'md', content: { heading: 'Get a quote in 24 hours', body: 'Tell me what you need and I will send a clear price.', form: '', primary: { label: 'Open the contact page', action: 'link', href: '/contact' } },
    design: { theme: 'site', animation: 'slide-left', align: 'left' }, trigger: { load: { enabled: false }, click: { enabled: true, selector: '.open-quote' } },
  }),
  T('countdown', 'Flash sale countdown', 'Bright offer card with a large live countdown.', {
    layout: 'modal', size: 'md', content: { badge: 'Flash sale', heading: '48 hours only: free SEO setup', body: 'Every website ordered before the timer ends gets on-page SEO setup free.', countdownTo: inDays(2), countdownLabel: 'Ends in', coupon: 'SEOFREE', primary: { label: 'Claim the offer', action: 'link', href: '/pricing' }, secondary: { label: 'Not now', action: 'close' } },
    design: { theme: 'brand', animation: 'zoom', align: 'center' }, trigger: { load: { enabled: true, delay: 4 } },
  }),
  T('custom-html', 'Custom HTML and CSS', 'Start from your own code. Full control over the design.', {
    layout: 'modal', size: 'md', contentType: 'html',
    content: { html: '<div class="pp-custom">\n  <h3>Your own design</h3>\n  <p>Write any HTML here. Add data-popup-close to a button to close the popup.</p>\n  <a href="/contact" class="pp-btn">Get in touch</a>\n  <button data-popup-close class="pp-link">No thanks</button>\n</div>', css: '.pp-custom{padding:40px;text-align:center}\n.pp-custom h3{font-size:28px;font-weight:700;margin-bottom:8px}\n.pp-btn{display:inline-block;margin-top:20px;padding:12px 22px;border-radius:999px;background:#6391FF;color:#fff;font-weight:600}\n.pp-link{display:block;margin:14px auto 0;opacity:.7}' },
    design: { theme: 'site', animation: 'zoom' },
  }),
];

/* "/blog/*" style patterns. "*" matches anything. */
export function pathMatches(patterns = [], path = '/') {
  const p = (path || '/').replace(/\/+$/, '') || '/';
  return patterns.filter(Boolean).some((raw) => {
    const pat = String(raw).trim().replace(/\/+$/, '') || '/';
    if (pat === '*') return true;
    const re = new RegExp(`^${pat.split('*').map((x) => x.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*')}$`, 'i');
    return re.test(p);
  });
}

/* Can this popup show here, ignoring triggers and frequency? */
export function targeted(pp, { path, device, returning, referrer = '', now = Date.now() }) {
  const t = pp.target || {};
  if (t.startAt && new Date(t.startAt).getTime() > now) return false;
  if (t.endAt && new Date(t.endAt).getTime() < now) return false;
  if (t.pages === 'include' && !pathMatches(t.paths, path)) return false;
  if (t.pages === 'exclude' && pathMatches(t.paths, path)) return false;
  if (t.devices && t.devices[device] === false) return false;
  if (t.visitors === 'new' && returning) return false;
  if (t.visitors === 'returning' && !returning) return false;
  if (t.referrer && !String(referrer).toLowerCase().includes(String(t.referrer).toLowerCase())) return false;
  return true;
}
