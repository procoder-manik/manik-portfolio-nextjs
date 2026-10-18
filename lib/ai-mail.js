import 'server-only';
import { knowledge, priceList, callGemini, callOpenAI, callClaude, ruleReply, AI_DEFAULTS, KEYS } from './chatbot';
import { getSettingsFresh } from './data';

const TONES = {
  friendly: 'warm, friendly and personal, like a helpful freelancer who cares',
  professional: 'polite, clear and professional, no slang',
  short: 'very short (3 to 5 sentences), direct and kind',
  detailed: 'thorough: answer every question, explain the next steps in a short list',
};

/* Writes a reply to a customer email. Uses the AI provider chosen in Emails > AI reply (or the chat provider).
   Without a key or on any error it falls back to a template built from your own FAQ and prices, and says so. */
export async function draftReply({ message, replies = [], tone = 'friendly', note = '', context = '' }) {
  const [email, ig] = await Promise.all([getSettingsFresh('email'), getSettingsFresh('integrations')]);
  const cfg = email.aiReply || {}; const chat = ig.chat?.ai || {};
  const provider = cfg.provider && cfg.provider !== 'chat' ? cfg.provider : chat.provider;
  const model = (cfg.model || chat.model || '').trim() || AI_DEFAULTS[provider];
  const k = await knowledge();
  const first = String(message.name || '').trim().split(/\s+/)[0] || 'there';

  await (await import('./secrets')).applySecrets();
  if (provider && provider !== 'off' && process.env[KEYS[provider]]) {
    const system = `You write email replies for ${k.site.name}, ${k.site.role}. Read the customer's whole message and write ONE reply the owner can send as is.
Rules:
- Write only the email body. No subject line, no signature or sign-off name (it is added automatically), no markdown, no placeholders like [name].
- Start with "Hi ${first}," (or the matching greeting in the customer's language). Reply in the same language as the customer (Bengali or English).
- Tone: ${TONES[tone] || TONES.friendly}.
- Answer every question they asked. Mention their service, budget or deadline if they gave one. Be specific, not generic.
- Use only these facts. Never invent prices, dates, discounts or promises. If something is unknown, say you will confirm it, or suggest a short call.
- End with one clear next step (reply with details, book a call, or place an order).
${cfg.instructions ? `Owner's standing instructions: ${cfg.instructions}\n` : ''}Contact: ${k.site.email}, ${k.site.phone}, WhatsApp ${k.site.whatsapp}, booking ${k.site.calendly}. Reply time: ${k.site.replyTime}.
Payment methods: ${k.methods.join(', ')}.
Packages:\n${priceList(k.services)}
FAQ:\n${k.faq.map((f) => `Q: ${f.q}\nA: ${f.a}`).join('\n')}`;
    const thread = [
      `From: ${message.name} <${message.email}>`, message.service && `Service: ${message.service}`, message.budget && `Budget: ${message.budget}`, context,
      `Their message:\n${String(message.message || '').slice(0, 4000)}`,
      ...replies.slice(-3).map((r) => `Your earlier reply (${r.subject || ''}):\n${String(r.message || '').slice(0, 1200)}`),
      note ? `What the owner wants to say in this reply: ${note}` : '',
    ].filter(Boolean).join('\n\n');
    try {
      globalThis.__aiMax = 900;
      const fn = { gemini: callGemini, openai: callOpenAI, claude: callClaude }[provider];
      const text = await fn(model, system, [{ role: 'user', text: thread }]);
      globalThis.__aiMax = undefined;
      if (text) return { ok: true, source: 'ai', provider, body: text.replace(/^\s*(subject:.*\n+)/i, '').trim() };
    } catch (e) { globalThis.__aiMax = undefined; console.error('[ai mail]', provider, e.message); return { ...(await template(k, first, message, note)), warning: `The AI service returned an error (${e.message}). A template reply was used instead.` }; }
  }
  const t = await template(k, first, message, note);
  return { ...t, warning: provider && provider !== 'off' ? `The ${provider} API key is missing on the server. A template reply was used.` : 'AI is switched off. A template reply was used. Choose a provider in Emails > AI reply and add its API key to get smart replies.' };
}

async function template(k, first, message, note) {
  const r = await ruleReply(`${message.message || ''}`).catch(() => null);
  const answer = r?.reply && !/not sure about that one/i.test(r.reply) ? r.reply : '';
  const body = [`Hi ${first},`, `Thank you for your message${message.service ? ` about ${message.service}` : ''}. I read it carefully.`, note, answer, `The quickest next step is a short call so I can understand the scope and give you an exact price${k.site.calendly ? `: ${k.site.calendly}` : '.'} Or just reply here with any details you have.`, 'Looking forward to helping you.'].filter(Boolean).join('\n\n');
  return { ok: true, source: 'template', body };
}
