import 'server-only';
import { getSettingsFresh } from './data';
import { AI_DEFAULTS, KEYS } from './chatbot';
import { applySecrets } from './secrets';

/* One place that talks to every AI provider. Keys stay in the environment.

   FREE providers (no card needed):  gemini (Google AI Studio), groq, openrouter (":free" models)
   PAID providers (optional):         openai, claude

   Default "auto" mode: tries the free providers that have a key, in order, and moves on to the next one
   when a provider is busy, out of free quota, or fails. Several models per provider are tried too. */
export const FREE = ['gemini', 'groq', 'openrouter'];
export const PAID = ['openai', 'claude'];
export const ALL_KEYS = { ...KEYS, groq: 'GROQ_API_KEY', openrouter: 'OPENROUTER_API_KEY' };
export const LABEL = { gemini: 'Google Gemini', groq: 'Groq', openrouter: 'OpenRouter', openai: 'ChatGPT', claude: 'Claude' };
export const SIGNUP = { gemini: 'aistudio.google.com/apikey', groq: 'console.groq.com/keys', openrouter: 'openrouter.ai/keys' };

/* Models to try, best first. Edit them in Admin > AI writer > Settings if a provider renames one. */
export const MODELS = {
  gemini: ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-flash-latest'],
  groq: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
  openrouter: ['meta-llama/llama-3.3-70b-instruct:free', 'deepseek/deepseek-chat-v3-0324:free', 'google/gemma-3-27b-it:free'],
  openai: [AI_DEFAULTS.openai], claude: [AI_DEFAULTS.claude],
};

const has = (p) => Boolean(process.env[ALL_KEYS[p]]);
export const aiReady = (provider) => (provider === 'auto' ? FREE.some(has) : Boolean(provider && provider !== 'off' && has(provider)));

/* The ordered list of providers to try. */
export async function aiConfig() {
  await applySecrets(); // keys saved in the admin
  const [w, ig] = await Promise.all([getSettingsFresh('aiwriter'), getSettingsFresh('integrations')]);
  const chat = ig.chat?.ai || {};
  let pick = w.provider || 'auto';
  if (pick === 'chat') pick = chat.provider && chat.provider !== 'off' ? chat.provider : 'auto';
  const custom = (txt) => String(txt || '').split(/[\n,]+/).map((x) => x.trim()).filter(Boolean);
  const models = {
    gemini: custom(w.geminiModels).length ? custom(w.geminiModels) : MODELS.gemini,
    groq: custom(w.groqModels).length ? custom(w.groqModels) : MODELS.groq,
    openrouter: custom(w.openrouterModels).length ? custom(w.openrouterModels) : MODELS.openrouter,
    openai: [(w.model && pick === 'openai' ? w.model : '') || MODELS.openai[0]],
    claude: [(w.model && pick === 'claude' ? w.model : '') || MODELS.claude[0]],
  };
  if (w.model && FREE.includes(pick)) models[pick] = [w.model.trim(), ...models[pick].filter((m) => m !== w.model.trim())];
  // Chosen provider first, then the other free ones as backups (a paid provider is only used when you choose it).
  const chain = pick === 'auto' ? [...FREE] : [pick, ...(w.fallback === false ? [] : FREE.filter((p) => p !== pick))];
  return { provider: pick, chain: chain.filter((p) => p !== 'off'), models, settings: w };
}

const kindOf = (status, msg = '') => {
  if (status === 401 || status === 403 || /api key|permission|unauthor|invalid.*key|billing/i.test(msg)) return 'auth';
  if (status === 429 || /quota|rate.?limit|resource.?exhausted|too many/i.test(msg)) return 'quota';
  if (status === 404 || /not found|no such model|unsupported model|does not exist|decommission/i.test(msg)) return 'model';
  return 'other';
};
const fail = (provider, status, msg, retryAfter) => Object.assign(new Error(msg || `${provider} ${status}`), { provider, status, kind: kindOf(status, msg), retryAfter });

async function callOne(provider, model, { system, user, json, maxTokens, temperature }, ms) {
  const signal = AbortSignal.timeout(Math.max(4000, ms));
  const key = process.env[ALL_KEYS[provider]];
  let r; let j;
  try {
    if (provider === 'gemini') {
      const body = (think) => JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: user }] }], generationConfig: { maxOutputTokens: maxTokens, temperature, topP: 0.95, ...(json ? { responseMimeType: 'application/json' } : {}), ...(think && /2\.5/.test(model) ? { thinkingConfig: { thinkingBudget: 0 } } : {}) } });
      const go = (think) => fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, { method: 'POST', signal, headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: body(think) });
      r = await go(true); j = await r.json().catch(() => ({}));
      if (r.status === 400 && /thinking/i.test(j.error?.message || '')) { r = await go(false); j = await r.json().catch(() => ({})); }
      if (!r.ok) { const ra = Number(String(j.error?.details?.find?.((d) => d.retryDelay)?.retryDelay || '').replace('s', '')) || 0; throw fail(provider, r.status, j.error?.message, ra); }
      const c = j.candidates?.[0];
      const text = String(c?.content?.parts?.map((p) => p.text || '').join('') || '').trim();
      if (!text) throw fail(provider, 0, j.promptFeedback?.blockReason ? `Blocked: ${j.promptFeedback.blockReason}` : 'Empty answer');
      return { text, truncated: c?.finishReason === 'MAX_TOKENS' };
    }
    if (provider === 'groq' || provider === 'openrouter' || provider === 'openai') {
      const url = { groq: 'https://api.groq.com/openai/v1/chat/completions', openrouter: 'https://openrouter.ai/api/v1/chat/completions', openai: 'https://api.openai.com/v1/chat/completions' }[provider];
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`, ...(provider === 'openrouter' ? { 'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost', 'X-Title': 'AI writer' } : {}) };
      const body = { model, messages: [{ role: 'system', content: system }, { role: 'user', content: user }], ...(provider === 'openai' ? { max_completion_tokens: maxTokens } : { max_tokens: maxTokens, temperature }), ...(json && provider !== 'openrouter' ? { response_format: { type: 'json_object' } } : {}) };
      r = await fetch(url, { method: 'POST', signal, headers, body: JSON.stringify(body) }); j = await r.json().catch(() => ({}));
      if (!r.ok) throw fail(provider, r.status, j.error?.message || (typeof j.error === 'string' ? j.error : ''), Number(r.headers.get('retry-after')) || 0);
      const c = j.choices?.[0]; const text = String(c?.message?.content || '').trim();
      if (!text) throw fail(provider, 0, 'Empty answer');
      return { text, truncated: c?.finish_reason === 'length' };
    }
    r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', signal, headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }, body: JSON.stringify({ model, max_tokens: maxTokens, temperature, system: json ? `${system}\n\nReturn only valid JSON. No text before or after it.` : system, messages: [{ role: 'user', content: user }] }) });
    j = await r.json().catch(() => ({}));
    if (!r.ok) throw fail(provider, r.status, j.error?.message);
    return { text: String(j.content?.filter((c) => c.type === 'text').map((c) => c.text).join('\n') || '').trim(), truncated: j.stop_reason === 'max_tokens' };
  } catch (e) {
    if (e.provider) throw e;
    throw fail(provider, 0, e.name === 'TimeoutError' || e.name === 'AbortError' ? 'Took too long to answer' : e.message);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Asks the AI and returns { text, via }. Walks through providers and models until one answers.
   budgetMs: total time allowed (stays under the 60 second limit of a Vercel function). */
export async function askAIx({ system, user, json = false, maxTokens = 4000, temperature = 0.7, cfg, budgetMs = 52000 }) {
  cfg = cfg || (await aiConfig());
  const t0 = Date.now(); const notes = []; let sawQuota = false; let tried = 0; let waited = false;
  const usable = cfg.chain.filter((p) => has(p));
  if (!usable.length) {
    throw Object.assign(new Error(`No AI key is set on the server. Add one free key: GEMINI_API_KEY (${SIGNUP.gemini}), GROQ_API_KEY (${SIGNUP.groq}) or OPENROUTER_API_KEY (${SIGNUP.openrouter}), then redeploy. All three are free and need no card.`), { status: 400, setup: true });
  }
  for (const provider of usable) {
    let skip = false;
    for (const model of cfg.models[provider] || []) {
      if (skip) break;
      for (let attempt = 0; attempt < 2; attempt++) {
        const left = budgetMs - (Date.now() - t0);
        if (left < 5000) { notes.push('out of time'); throw summary(); }
        tried += 1;
        try {
          const out = await callOne(provider, model, { system, user, json, maxTokens, temperature }, Math.min(left - 500, 42000));
          if (out.truncated && json) throw fail(provider, 0, 'The answer was cut off');
          return { text: out.text, via: `${LABEL[provider]} (${model})` };
        } catch (e) {
          if (e.kind === 'quota') {
            sawQuota = true;
            const wait = Math.min(7000, (e.retryAfter || 0) * 1000 || 3500);
            if (attempt === 0 && !waited && budgetMs - (Date.now() - t0) > wait + 12000) { waited = true; await sleep(wait); continue; }
          }
          notes.push(`${LABEL[provider]} ${e.kind === 'quota' ? 'is at its free limit for now' : e.kind === 'auth' ? 'key was refused' : e.kind === 'model' ? `model ${model} is not available` : e.message}`);
          if (e.kind === 'auth') skip = true;
          break;
        }
      }
    }
  }
  throw summary();
  function summary() {
    const e = new Error(`${sawQuota ? 'The free AI is busy right now (free limits reached).' : 'The AI could not answer.'} ${[...new Set(notes)].join('. ')}. ${sawQuota ? 'Wait a minute and press the button again; your progress is kept. Adding a second free key (Groq or OpenRouter) gives you more room.' : 'Check the key in your environment and try again.'}`.replace(/\.\./g, '.'));
    e.status = sawQuota ? 429 : 502; e.retryable = sawQuota; return e;
  }
}

export async function askAI(opts) { return (await askAIx(opts)).text; }

/* Reads JSON from a model answer, even with code fences, smart quotes, trailing commas or a stray sentence around it. */
export function parseJson(text = '') {
  const clean = (s) => s.replace(/[\u201C\u201D]/g, '"').replace(/,\s*([}\]])/g, '$1');
  const t = String(text).trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const tries = [t];
  const a = t.indexOf('{'); const b = t.lastIndexOf('}'); if (a >= 0 && b > a) tries.push(t.slice(a, b + 1));
  const c = t.indexOf('['); const d = t.lastIndexOf(']'); if (c >= 0 && d > c) tries.push(t.slice(c, d + 1));
  for (const x of tries) { try { return JSON.parse(x); } catch {} try { return JSON.parse(clean(x)); } catch {} }
  throw new Error('The AI answer was not in the expected format. Press the button again.');
}
