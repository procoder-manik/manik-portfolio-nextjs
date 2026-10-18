import 'server-only';
import { askAI, parseJson } from './ai';
import { getAllSettings, getServicesWithPackages } from './data';
import { priceList } from './chatbot';

const RULES = `Rules for every answer you write:
- Plain, friendly, direct. 1 to 4 sentences, under 90 words. Start with the answer, not a restatement of the question.
- Only use facts you were given. Never invent prices, timelines, guarantees or client names. If a fact is missing, say it is confirmed after a short call.
- No em dashes. No markdown. No filler openers such as "Great question". Write like the owner talking to a client.
- Questions must sound like a real visitor typed them (short, specific). Include a mix: price, time, process, what is included, risks, results.`;

/* Q and A pairs for one service (or from a page or pasted text). Returns [{ question, answer, category, keywords }]. */
export async function generateQA({ category, count = 8, text = '', source = '' }) {
  const [{ site }, services] = await Promise.all([getAllSettings(), getServicesWithPackages()]);
  const system = `You write FAQ entries for the website of ${site.name}, ${site.role}.\n${RULES}\nReturn JSON: {"items":[{"question":"","answer":"","keywords":["3 to 6 short words people use for this topic"]}]}`;
  const facts = `Owner contact: ${site.email}, ${site.phone}. Reply time: ${site.replyTime}.\nServices and packages (real prices):\n${priceList(services)}\nProject facts: 7+ years, 550+ websites, 14 countries, 30 days free support after launch.`;
  const user = text
    ? `Read this text${source ? ` from ${source}` : ''} and write up to ${count} FAQ entries a visitor of ${site.name}'s website would find useful for the category "${category}". Use the text only as inspiration for topics and facts; do not copy sentences, and do not use facts about another business as if they were ours.\n\nTEXT:\n${text.slice(0, 14000)}\n\nOUR FACTS:\n${facts}`
    : `Write ${count} different FAQ entries for the category "${category}".\n\nFACTS:\n${facts}`;
  const out = parseJson(await askAI({ system, user, json: true, maxTokens: 3500, temperature: 0.6 }));
  return (out.items || out.faq || []).filter((x) => x?.question && x?.answer).slice(0, count).map((x) => ({ question: String(x.question).trim(), answer: String(x.answer).trim(), category, keywords: (x.keywords || []).map(String).slice(0, 8), source: text ? 'import' : 'ai' }));
}
