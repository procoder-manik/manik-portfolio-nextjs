import 'server-only';
import { askAI, parseJson } from './ai';


const UA = { 'User-Agent': 'Mozilla/5.0' };
const getJson = async (url, ms = 5000) => { const r = await fetch(url, { signal: AbortSignal.timeout(ms), headers: UA }); return r.json(); };

/* Free suggestion sources. Each returns the phrases people really type in that search box. */
const SOURCES = {
  google: async (q, lang) => { const j = await getJson(`https://suggestqueries.google.com/complete/search?client=firefox&hl=${lang}&q=${encodeURIComponent(q)}`); return Array.isArray(j?.[1]) ? j[1] : []; },
  bing: async (q) => { const j = await getJson(`https://api.bing.com/osjson.aspx?query=${encodeURIComponent(q)}`); return Array.isArray(j?.[1]) ? j[1] : []; },
  duckduckgo: async (q) => { const j = await getJson(`https://duckduckgo.com/ac/?q=${encodeURIComponent(q)}&type=list`); return Array.isArray(j?.[1]) ? j[1] : Array.isArray(j) ? j.map((x) => x.phrase).filter(Boolean) : []; },
  youtube: async (q, lang) => { const j = await getJson(`https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=${lang}&q=${encodeURIComponent(q)}`); return Array.isArray(j?.[1]) ? j[1] : []; },
};

/* Free keyword research with no account and no key: Google, Bing, DuckDuckGo and YouTube suggestions.
   A phrase suggested by more than one engine ranks higher. Returns [{ keyword, sources }] best first. */
export async function suggestFree(seed, lang = 'en') {
  const q = String(seed).trim().slice(0, 80); if (!q) return { list: [], questions: [], failed: [] };
  const mods = lang === 'bn' ? ['', ' কিভাবে', ' কি', ' সেরা', ' খরচ', ' টিপস'] : ['', ' for', ' vs', ' cost', ' tips', ' examples', ' 2026', ' for beginners', ' tools'];
  const pre = lang === 'bn' ? [] : ['how to ', 'what is ', 'best ', 'why ', 'can you '];
  const queries = [...mods.map((m) => `${q}${m}`), ...pre.map((p) => `${p}${q}`)];
  const jobs = [];
  queries.forEach((v, i) => { jobs.push(['google', v]); if (i < 4) { jobs.push(['bing', v]); jobs.push(['duckduckgo', v]); if (i < 2) jobs.push(['youtube', v]); } });
  const res = await Promise.allSettled(jobs.map(([s, v]) => SOURCES[s](v, lang).then((r) => ({ s, r }))));
  const tally = new Map(); const failed = new Set(); const ok = new Set();
  res.forEach((x, i) => { if (x.status !== 'fulfilled') { failed.add(jobs[i][0]); return; } ok.add(x.value.s); x.value.r.forEach((k) => { const kw = String(k).trim().toLowerCase(); if (!kw || kw === q.toLowerCase() || kw.length > 90) return; const t = tally.get(kw) || new Set(); t.add(x.value.s); tally.set(kw, t); }); });
  const list = [...tally.entries()].map(([keyword, set]) => ({ keyword, sources: set.size, from: [...set] })).sort((a, b) => b.sources - a.sources || a.keyword.length - b.keyword.length).slice(0, 60);
  const questions = list.filter((x) => /^(how|what|why|when|where|which|who|can|does|is|are|should|do)\b/.test(x.keyword) || /^(কিভাবে|কেন|কি|কী|কোথায়)/.test(x.keyword)).map((x) => x.keyword).slice(0, 12);
  return { list, questions, failed: [...failed].filter((s) => !ok.has(s)) };
}

/* Free related words and entities (English) from Datamuse. */
export async function relatedWords(seed) {
  try {
    const q = encodeURIComponent(String(seed).trim().split(/\s+/).slice(0, 4).join(' '));
    const [a, b] = await Promise.all([getJson(`https://api.datamuse.com/words?ml=${q}&max=20`), getJson(`https://api.datamuse.com/words?rel_trg=${q}&max=15`)]);
    return [...new Set([...a, ...b].map((x) => x.word).filter((w) => w && w.length > 3))].slice(0, 24);
  } catch { return []; }
}

/* OPTIONAL PAID: Semrush related phrases with real volume and difficulty. Only used when SEMRUSH_API_KEY is set. Never needed. */
export async function semrushRelated(seed, database = 'us') {
  const key = process.env.SEMRUSH_API_KEY; if (!key) return null;
  const u = `https://api.semrush.com/?type=phrase_related&key=${encodeURIComponent(key)}&phrase=${encodeURIComponent(seed)}&database=${encodeURIComponent(database)}&export_columns=Ph,Nq,Kd,Cp&display_limit=25&display_sort=nq_desc`;
  const r = await fetch(u, { signal: AbortSignal.timeout(9000) }); const t = await r.text();
  if (!r.ok || /^ERROR/i.test(t)) throw new Error(t.slice(0, 120) || `Semrush ${r.status}`);
  return t.trim().split('\n').slice(1).map((l) => { const [kw, vol, kd, cpc] = l.split(';'); return { keyword: kw, volume: Number(vol) || 0, difficulty: Number(kd) || 0, cpc: Number(cpc) || 0 }; }).filter((x) => x.keyword);
}

/* Picks a sensible primary and secondary set without any AI, so keyword picking works even when the free AI is busy. */
export function pickKeywords(topic, free = [], ai = null) {
  const t = String(topic).toLowerCase();
  const words = new Set(t.split(/\s+/).filter((w) => w.length > 2));
  const relevant = free.filter((x) => { const k = x.keyword; return [...words].some((w) => k.includes(w)); });
  const primary = ai?.primary?.[0]?.keyword || relevant.find((x) => x.sources > 1 && x.keyword.split(' ').length >= 2 && x.keyword.split(' ').length <= 5)?.keyword || relevant[0]?.keyword || topic;
  const pool = [...(ai?.secondary || []).map((x) => x.keyword || x), ...(ai?.longTail || []), ...relevant.map((x) => x.keyword)];
  const secondary = [...new Set(pool.map((x) => String(x).trim().toLowerCase()).filter((x) => x && x !== String(primary).toLowerCase()))].slice(0, 8);
  return { primary: String(primary).toLowerCase(), secondary };
}

/* AI keyword ideas. These are estimates of intent and competition, not measured search volume. */
export async function aiIdeas(topic, { audience = '', language = 'English', real = [] } = {}) {
  const system = 'You are a senior SEO strategist. Return JSON only.';
  const user = `Topic: "${topic}". Audience: ${audience || 'general'}. Language: ${language}.\n${real.length ? `Real Google suggestions to build on: ${real.slice(0, 25).join('; ')}\n` : ''}Return JSON: {"primary":[{"keyword":"","intent":"informational|commercial|transactional|navigational","why":"one short reason","competition":"low|medium|high"}] (3 options, best first),"secondary":[{"keyword":"","intent":""}] (10),"questions":["8 real questions people ask"],"longTail":["8 specific long-tail phrases"],"entities":["10 related terms or entities a thorough article should mention"]}. Prefer phrases a real person types. Do not invent search volumes.`;
  return parseJson(await askAI({ system, user, json: true, maxTokens: 2500, temperature: 0.5, budgetMs: 26000 }));
}
