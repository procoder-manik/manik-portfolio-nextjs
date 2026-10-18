import 'server-only';
import { getAllSettings, getServicesWithPackages } from './data';
import { money, BILLING } from './utils';
import { PAYMENT_METHODS } from './options';

const words = (s) => String(s).toLowerCase().replace(/[^a-z0-9\u0980-\u09ff\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2);
const STOP = new Set(['the', 'and', 'you', 'your', 'for', 'can', 'what', 'how', 'does', 'with', 'are', 'there', 'this', 'that', 'have', 'need', 'want', 'much', 'any', 'about', 'will', 'from']);

export async function knowledge() {
  const [{ site, home, payments }, services] = await Promise.all([getAllSettings(), getServicesWithPackages()]);
  return { site, faq: home.faq?.items || [], services, methods: PAYMENT_METHODS.filter((m) => payments[m.id]?.enabled).map((m) => m.name) };
}

export function priceList(services) {
  return services.map((s) => `${s.name}: ${s.packages.slice(0, 3).map((p) => `${p.name} from ${money(p.price, p.currency)}${p.billing !== 'one-time' ? ` ${BILLING[p.billing]}` : ''}`).join(', ')}`).join('\n');
}

/* Rule-based answers from your own FAQ, packages and contact details. */
export async function ruleReply(text) {
  const k = await knowledge();
  const q = String(text).toLowerCase();
  const actions = [];
  const qw = words(q).filter((w) => !STOP.has(w));
  let best = null; let score = 0;
  for (const f of k.faq) {
    const fw = new Set(words(`${f.q} ${f.q} ${f.a}`));
    const sc = qw.reduce((n, w) => n + (fw.has(w) ? 1 : 0), 0);
    if (sc > score) { score = sc; best = f; }
  }
  if (best && score >= 2 && !/(price|cost|how much|দাম|খরচ)/.test(q)) return { reply: best.a, actions: [{ label: 'More answers', href: '/#faq' }] };
  if (/\b(hi|hello|hey|salam|assalamu)/.test(q) && q.length < 25) return { reply: `Hello! I can answer questions about services, prices, timelines and payment. What are you working on?`, actions: [{ label: 'See pricing', href: '/pricing' }, { label: 'See work', href: '/portfolio' }] };
  if (/(price|cost|budget|charge|rate|how much|দাম|খরচ)/.test(q)) return { reply: `Here are the starting prices:\n${priceList(k.services)}\n\nFinal prices depend on scope. You can buy a package directly or ask for a quote.`, actions: [{ label: 'Open pricing', href: '/pricing' }, { label: 'Get a quote', href: '/contact' }] };
  if (/(pay|payment|bkash|nagad|rocket|paypal|payoneer|card|bank)/.test(q)) return { reply: `You can pay with ${k.methods.join(', ')}. Choose the method at checkout after picking a package.`, actions: [{ label: 'Pick a package', href: '/pricing' }] };
  if (/(human|talk|call|meeting|whatsapp|contact|email|phone)/.test(q)) {
    if (k.site.whatsapp) actions.push({ label: 'WhatsApp', href: k.site.whatsapp });
    if (k.site.calendly) actions.push({ label: 'Book a call', href: k.site.calendly });
    return { reply: `You can reach Manik at ${k.site.email} or ${k.site.phone}. He replies ${String(k.site.replyTime || '').toLowerCase()}. Or leave your email here and he will get back to you.`, actions, lead: true };
  }
  if (/(portfolio|examples?|samples?|case stud|your work|previous work|past project|কাজ দেখ)/.test(q)) return { reply: 'Recent projects include law firms, clinics, agencies and online stores on WordPress, Shopify, Webflow and custom code.', actions: [{ label: 'Browse portfolio', href: '/portfolio' }] };

  if (best && score >= 1) return { reply: best.a, actions: [{ label: 'More answers', href: '/#faq' }] };
  return { reply: "I'm not sure about that one. Leave your email and a short note, and Manik will reply personally.", lead: true };
}

function systemPrompt(k) {
  return `You are the website assistant for ${k.site.name}, ${k.site.role}. Answer briefly (max 90 words), friendly and specific, in the visitor's language (Bengali or English).
Only use these facts. If unsure, suggest leaving an email or booking a call. Never invent prices, dates or promises.
Contact: ${k.site.email}, ${k.site.phone}, WhatsApp ${k.site.whatsapp}, booking ${k.site.calendly}. Reply time: ${k.site.replyTime}.
Payment methods: ${k.methods.join(', ')}.
Packages:\n${priceList(k.services)}
FAQ:\n${k.faq.map((f) => `Q: ${f.q}\nA: ${f.a}`).join('\n')}
Pages: /pricing, /portfolio, /contact, /resume, /blog.`;
}

export const AI_DEFAULTS = { gemini: 'gemini-flash-latest', openai: 'gpt-5-mini', claude: 'claude-haiku-5-5' };
export const KEYS = { gemini: 'GEMINI_API_KEY', openai: 'OPENAI_API_KEY', claude: 'ANTHROPIC_API_KEY' };

export async function callGemini(model, system, msgs) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: msgs.map((m) => ({ role: m.role === 'bot' ? 'model' : 'user', parts: [{ text: m.text }] })), generationConfig: { maxOutputTokens: globalThis.__aiMax || 400, temperature: 0.4 } }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || `Gemini ${r.status}`);
  return j.candidates?.[0]?.content?.parts?.map((p) => p.text).join('').trim();
}

export async function callOpenAI(model, system, msgs) {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model, max_completion_tokens: globalThis.__aiMax || 600, messages: [{ role: 'system', content: system }, ...msgs.map((m) => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.text }))] }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || `OpenAI ${r.status}`);
  return j.choices?.[0]?.message?.content?.trim();
}

export async function callClaude(model, system, msgs) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST', headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model, max_tokens: globalThis.__aiMax || 400, system, messages: msgs.map((m) => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.text })) }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || `Claude ${r.status}`);
  return j.content?.filter((c) => c.type === 'text').map((c) => c.text).join('\n').trim();
}

/* AI answers with the provider chosen in Admin > SEO and integrations > Chat.
   The API key stays in the environment (never in the database or the browser).
   Any error, missing key or "off" falls back to the free rule-based answers. */
export async function aiReply(history, ai = {}) {
  const provider = ai.provider;
  if (!provider || provider === 'off' || !process.env[KEYS[provider]]) return null;
  const k = await knowledge();
  const model = (ai.model || '').trim() || AI_DEFAULTS[provider];
  let msgs = history.slice(-10).map((m) => ({ role: m.role, text: String(m.text).slice(0, 1500) }));
  while (msgs.length && msgs[0].role === 'bot') msgs = msgs.slice(1);
  try {
    const fn = { gemini: callGemini, openai: callOpenAI, claude: callClaude }[provider];
    const text = await fn(model, systemPrompt(k), msgs);
    if (!text) return null;
    return { reply: text, actions: /price|cost|package|দাম|খরচ/i.test(msgs.at(-1)?.text || '') ? [{ label: 'Open pricing', href: '/pricing' }] : [] };
  } catch (e) { console.error('[chat ai]', provider, e.message); return null; }
}
