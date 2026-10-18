import 'server-only';
import { getSettingsFresh } from './data';
import { AI_DEFAULTS, KEYS } from './chatbot';

/* One place that talks to Gemini, OpenAI or Claude. The key stays in the environment.
   Provider: the AI writer setting, or (when set to "chat") the chat provider. */
export async function aiConfig() {
  const [w, ig] = await Promise.all([getSettingsFresh('aiwriter'), getSettingsFresh('integrations')]);
  const chat = ig.chat?.ai || {};
  const provider = w.provider && w.provider !== 'chat' ? w.provider : chat.provider;
  const model = (w.model || (w.provider === 'chat' || !w.provider ? chat.model : '') || '').trim() || AI_DEFAULTS[provider];
  return { provider, model, settings: w };
}
export const aiReady = (provider) => Boolean(provider && provider !== 'off' && process.env[KEYS[provider]]);

export async function askAI({ system, user, json = false, maxTokens = 4000, temperature = 0.7, cfg }) {
  cfg = cfg || (await aiConfig());
  const { provider, model } = cfg;
  if (!provider || provider === 'off') throw new Error('AI is switched off. Choose a provider in AI writer settings (Admin > AI writer > Settings) and add its API key.');
  if (!process.env[KEYS[provider]]) throw new Error(`The ${provider} API key is missing on the server. Add ${KEYS[provider]} to your environment and restart.`);
  const signal = AbortSignal.timeout(55000);
  let r; let j;
  if (provider === 'gemini') {
    r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST', signal, headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: user }] }], generationConfig: { maxOutputTokens: maxTokens, temperature, ...(json ? { responseMimeType: 'application/json' } : {}) } }),
    });
    j = await r.json(); if (!r.ok) throw new Error(j.error?.message || `Gemini ${r.status}`);
    return String(j.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '').trim();
  }
  if (provider === 'openai') {
    r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', signal, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model, max_completion_tokens: maxTokens, ...(json ? { response_format: { type: 'json_object' } } : {}), messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }),
    });
    j = await r.json(); if (!r.ok) throw new Error(j.error?.message || `OpenAI ${r.status}`);
    return String(j.choices?.[0]?.message?.content || '').trim();
  }
  r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST', signal, headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model, max_tokens: maxTokens, temperature, system: json ? `${system}\n\nReturn only valid JSON. No text before or after it.` : system, messages: [{ role: 'user', content: user }] }),
  });
  j = await r.json(); if (!r.ok) throw new Error(j.error?.message || `Claude ${r.status}`);
  return String(j.content?.filter((c) => c.type === 'text').map((c) => c.text).join('\n') || '').trim();
}

/* Reads JSON from a model answer, even with code fences or a stray sentence around it. */
export function parseJson(text = '') {
  const t = String(text).trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  try { return JSON.parse(t); } catch {}
  const a = t.indexOf('{'); const b = t.lastIndexOf('}');
  if (a >= 0 && b > a) { try { return JSON.parse(t.slice(a, b + 1)); } catch {} }
  const c = t.indexOf('['); const d = t.lastIndexOf(']');
  if (c >= 0 && d > c) { try { return JSON.parse(t.slice(c, d + 1)); } catch {} }
  throw new Error('The AI answer was not in the expected format. Try again.');
}
