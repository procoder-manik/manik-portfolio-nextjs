import 'server-only';
import { Page, Landing, PitchSite } from './models';
import { SYSTEM_PAGES } from './system-pages';

/* Pitch websites (Admin > Pitch websites): one-page sites made for one prospect, shown at yoursite.com/<slug>.
   The page is the saved HTML exactly as written. Nothing of this site (header, footer, styles, scripts) is added, and the page runs
   in a browser sandbox, so its code cannot read this site's cookies or call the admin, and this site's code never touches it.
   The only addition is a small credit strip at the end, drawn inside its own shadow root so neither side's CSS can reach the other. */

/* Top-level addresses this site already uses. A pitch website can never take one of them. */
const RESERVED = new Set(['admin', 'api', 'account', 'apps', 'blog', 'case-studies', 'checkout', 'contact', 'faq', 'forms', 'help', 'invoice', 'order',
  'portfolio', 'pricing', 'resume', 'service-areas', 'media', 'og', 'seed', 'docs', '_next', 'feed.xml', 'sitemap.xml', 'robots.txt', 'llms.txt',
  'llms-full.txt', 'icon.svg', 'favicon.ico', 'support', 'help-center', 'helpcenter', 'knowledge-base', 'home']);

const fail = (msg) => { throw Object.assign(new Error(msg), { status: 400 }); };

/* Throws when the address is taken by this site or by another page, landing page or pitch website. */
export async function assertFreeAddress(slug, { kind, id } = {}) {
  const s = String(slug || '').trim();
  if (!s) fail('Give the website an address (URL slug).');
  if (kind === 'pitch-sites' && (RESERVED.has(s) || SYSTEM_PAGES.some((d) => d.slug === s))) fail(`The address /${s} is used by your own site. Pick another URL slug.`);
  const not = (k) => (kind === k && id ? { _id: { $ne: id } } : {});
  const [page, landing, pitch] = await Promise.all([
    kind === 'pages' ? null : Page.exists({ slug: s, trashedAt: null }),
    kind === 'landings' ? null : Landing.exists({ trashedAt: null, $or: [{ slug: s }, { aliases: s }] }),
    PitchSite.exists({ slug: s, trashedAt: null, ...not('pitch-sites') }),
  ]);
  if (page) fail(`The address /${s} belongs to one of your pages. Pick another URL slug.`);
  if (landing) fail(`The address /${s} belongs to one of your landing pages. Pick another URL slug.`);
  if (pitch) fail(`The address /${s} belongs to a pitch website. Pick another URL slug.`);
}

/* Link-preview fetchers and crawlers. They open the link when you paste it in a chat, which is not the client looking at it. */
export const isBot = (ua = '') => /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|slack|discord|linkedin|skype|embedly|vkshare|headless|lighthouse|curl|wget|python|node-fetch/i.test(ua);
export const deviceOf = (ua = '') => (/ipad|tablet/i.test(ua) ? 'Tablet' : /mobi|android|iphone/i.test(ua) ? 'Phone' : 'Computer');

const esc = (v = '') => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const LS = String.fromCharCode(0x2028); const PS = String.fromCharCode(0x2029);
const BS = String.fromCharCode(92);
const json = (v) => JSON.stringify(v).replace(/</g, BS + 'u003c').split(LS).join(BS + 'u2028').split(PS).join(BS + 'u2029');

/* The credit strip and the floating "want this website?" card. Drawn in a closed shadow root: the page's CSS cannot restyle it and its CSS cannot leak out. */
function creditScript(cfg) {
  return `<script>(function(){var c=${json(cfg)};function e(s){return String(s==null?'':s).replace(/[&<>"']/g,function(x){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]})}
function go(){try{if(c.beacon&&navigator.sendBeacon)navigator.sendBeacon(c.beacon,'click')}catch(_){}}
var h=document.createElement('mh-credit');h.style.cssText='display:block!important;all:initial;display:block!important;position:relative;z-index:2147483000';document.body.appendChild(h);
var r=h.attachShadow?h.attachShadow({mode:'closed'}):h;
var css=':host{all:initial}*{box-sizing:border-box;margin:0;font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}'
+'.s{background:#0b0d12;color:#c9ced8;padding:22px 20px calc(22px + env(safe-area-inset-bottom));display:flex;flex-wrap:wrap;gap:12px 20px;align-items:center;justify-content:center;text-align:center;font-size:14px;line-height:1.5;border-top:1px solid rgba(255,255,255,.08)}'
+'.s b{color:#fff;font-weight:700}.s a.n{color:#fff;text-decoration:none;border-bottom:1px solid rgba(255,255,255,.35)}'
+'.b{display:inline-flex;align-items:center;gap:8px;background:'+c.accent+';color:#fff!important;text-decoration:none;font-weight:700;font-size:14px;padding:10px 18px;border-radius:999px;box-shadow:0 10px 24px -10px '+c.accent+';transition:transform .2s}.b:hover{transform:translateY(-2px)}'
+'.p{position:fixed;right:20px;bottom:20px;max-width:330px;background:rgba(11,13,18,.92);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);color:#e6e9ef;border:1px solid rgba(255,255,255,.14);border-radius:18px;padding:16px 18px 16px 16px;box-shadow:0 24px 60px -18px rgba(0,0,0,.6);font-size:14px;line-height:1.45;opacity:0;transform:translateY(16px);pointer-events:none;transition:opacity .45s,transform .45s}'
+'.p.on{opacity:1;transform:none;pointer-events:auto}.p strong{display:block;color:#fff;font-size:15px;margin-bottom:4px}.p .b{margin-top:12px}'
+'.x{position:absolute;top:8px;right:10px;background:none;border:0;color:#9aa3b2;font-size:18px;line-height:1;cursor:pointer;padding:4px}'
+'@media(max-width:899px){.p{display:none}.s{padding-bottom:calc(92px + env(safe-area-inset-bottom))}}@media(prefers-reduced-motion:reduce){.p,.b{transition:none}}';
var link='<a class="b" href="'+e(c.url)+'" target="_top" data-go>'+e(c.label)+' &rarr;</a>';
var html='<style>'+css+'</style><div class="s"><span>'+(c.client?'Website concept for <b>'+e(c.client)+'</b> &middot; ':'')+e(c.text)+' <a class="n" href="'+e(c.home)+'" target="_top">'+e(c.owner)+'</a></span>'+link+'</div>';
if(c.pill)html+='<div class="p" role="dialog" aria-label="'+e(c.ask)+'"><button class="x" type="button" aria-label="Close">&times;</button><strong>'+e(c.ask)+'</strong>'+e(c.sub)+'<br>'+link+'</div>';
r.innerHTML=html;
Array.prototype.forEach.call(r.querySelectorAll('[data-go]'),function(a){a.addEventListener('click',go)});
var p=r.querySelector('.p');if(p){var shut=false;r.querySelector('.x').addEventListener('click',function(){shut=true;p.classList.remove('on')});
var t=function(){var d=document.documentElement,max=(d.scrollHeight-innerHeight)||1;if(!shut&&scrollY/max>.3)p.classList.add('on')};addEventListener('scroll',t,{passive:true});setTimeout(t,6000)}
})();</script>`;
}

/* The page as it is sent: the saved HTML, a noindex tag, and the credit strip before </body>. */
export function buildPitchPage(site, owner) {
  const raw = String(site.html || '').trim() || `<!doctype html><html><head><meta charset="utf-8"><title>${esc(site.name)}</title></head><body></body></html>`;
  const c = site.credit || {};
  const home = owner.url.replace(/\/$/, '');
  const cfg = {
    client: site.client || site.name, owner: owner.name, home, accent: /^#[0-9a-f]{3,8}$/i.test(site.accent || '') ? site.accent : '#2563EB',
    text: c.text || 'Designed and developed by', label: c.ctaLabel || 'Get this website',
    ask: c.ctaText || 'Like this website?', sub: `It was made for ${site.client || site.name}. It can go live on your own domain, made even better.`,
    url: c.ctaUrl || `${home}/contact?ref=${encodeURIComponent(site.slug)}`, pill: c.pill !== false, beacon: `${home}/api/pitch-sites/click?s=${encodeURIComponent(site.slug)}`,
  };
  let html = raw;
  const robots = '<meta name="robots" content="noindex, nofollow">';
  html = /<head[^>]*>/i.test(html) ? html.replace(/<head([^>]*)>/i, (m) => `${m}\n${robots}`) : `${robots}\n${html}`;
  if (c.show === false) return html;
  const script = creditScript(cfg);
  return /<\/body>/i.test(html) ? html.replace(/<\/body>(?![\s\S]*<\/body>)/i, `${script}\n</body>`) : `${html}\n${script}`;
}
