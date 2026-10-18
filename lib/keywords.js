import 'server-only';
import { askAI, parseJson } from './ai';

/* Real search suggestions from Google Autocomplete (free, no key). Returns phrases people actually type. */
export async function autocomplete(seed, lang = 'en') {
  const q = String(seed).trim().slice(0, 80); if (!q) return [];
  const variants = [q, `${q} for`, `how to ${q}`, `best ${q}`, `${q} vs`, `${q} cost`, `${q} tips`, `what is ${q}`, `${q} examples`, `${q} 2026`];
  const res = await Promise.allSettled(variants.map(async (v) => {
    const r = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&hl=${lang}&q=${encodeURIComponent(v)}`, { signal: AbortSignal.timeout(5000), headers: { 'User-Agent': 'Mozilla/5.0' } });
    const j = await r.json(); return Array.isArray(j?.[1]) ? j[1] : [];
  }));
  return [...new Set(res.flatMap((r) => (r.status === 'fulfilled' ? r.value : [])).map((x) => String(x).trim().toLowerCase()).filter((x) => x && x !== q.toLowerCase()))].slice(0, 40);
}

/* Optional: Semrush "related phrases" with real volume and difficulty. Needs SEMRUSH_API_KEY (paid plan with API units). */
export async function semrushRelated(seed, database = 'us') {
  const key = process.env.SEMRUSH_API_KEY; if (!key) return null;
  const u = `https://api.semrush.com/?type=phrase_related&key=${encodeURIComponent(key)}&phrase=${encodeURIComponent(seed)}&database=${encodeURIComponent(database)}&export_columns=Ph,Nq,Kd,Cp&display_limit=25&display_sort=nq_desc`;
  const r = await fetch(u, { signal: AbortSignal.timeout(9000) }); const t = await r.text();
  if (!r.ok || /^ERROR/i.test(t)) throw new Error(t.slice(0, 120) || `Semrush ${r.status}`);
  return t.trim().split('\n').slice(1).map((l) => { const [kw, vol, kd, cpc] = l.split(';'); return { keyword: kw, volume: Number(vol) || 0, difficulty: Number(kd) || 0, cpc: Number(cpc) || 0 }; }).filter((x) => x.keyword);
}

/* AI keyword ideas. These are estimates of intent and competition, not measured search volume. */
export async function aiIdeas(topic, { audience = '', language = 'English', real = [] } = {}) {
  const system = 'You are a senior SEO strategist. Return JSON only.';
  const user = `Topic: "${topic}". Audience: ${audience || 'general'}. Language: ${language}.\n${real.length ? `Real Google suggestions to build on: ${real.slice(0, 25).join('; ')}\n` : ''}Return JSON: {"primary":[{"keyword":"","intent":"informational|commercial|transactional|navigational","why":"one short reason","competition":"low|medium|high"}] (3 options, best first),"secondary":[{"keyword":"","intent":""}] (10),"questions":["8 real questions people ask"],"longTail":["8 specific long-tail phrases"],"entities":["10 related terms or entities a thorough article should mention"]}. Prefer phrases a real person types. Do not invent search volumes.`;
  return parseJson(await askAI({ system, user, json: true, maxTokens: 2500, temperature: 0.5 }));
}
