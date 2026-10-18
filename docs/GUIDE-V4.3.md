# Update guide: version 4.3 (free AI blog writer)

The AI blog writer now works with **free AI only**, researches keywords with **free tools**, writes in **English or Bengali** in the **tone you pick**, and gives you image, infographic, chart and table prompts. Paid options stay available but are never used unless you choose them.

---

## 1. Why it showed an error, and what changed

The old writer used one AI provider and sent about ten requests in a row. Free plans limit requests per minute, so it stopped with an error, or showed "AI is off" when the chat provider was off.

Now:

- **Automatic mode** tries every free provider that has a key (Gemini, then Groq, then OpenRouter), and several models of each. If one is busy or out of its free quota, the next one answers.
- If every free provider is resting, the writer **waits and retries by itself** (a countdown is shown) and keeps what it has already written.
- The plan is split into small steps (SEO plan, image plan, then section by section), so even small free models answer reliably.
- The error messages now say exactly what to do.

## 2. One-time setup: paste free keys in the admin (5 minutes, no card)

You do **not** need the environment file. Open **Admin > AI writer > Settings**. At the top there is an **API keys** box:

1. Press **Get key** next to a provider, create a free key.
2. Paste it in the box and press **Save**. It is tested at once ("Works. Answered by Gemini...").
3. Add two or three providers for automatic backup.

| Provider | Free? | Key page |
| --- | --- | --- |
| Google Gemini | free | aistudio.google.com/apikey |
| Groq | free | console.groq.com/keys |
| OpenRouter | free models | openrouter.ai/keys |
| ChatGPT, Claude | optional, paid | platform.openai.com, console.anthropic.com |
| Semrush | optional, paid, not needed | semrush.com/api-analytics |

How the keys are kept safe:

- Saved **encrypted** (AES-256-GCM) in your database. The browser only ever sees the last 4 characters.
- A key saved here works immediately, with no redeploy, and **wins over** the same key in the environment. Remove it with the bin icon to fall back to the environment value.
- Only **administrators** can add or remove keys.
- They are encrypted with your `JWT_SECRET`. If you ever change `JWT_SECRET`, saved keys show "cannot be read" and you paste them again.
- The same keys also power the chat, email replies and AI IQ.
- Needs MongoDB connected. Without a database, use the environment file (`GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`) instead; both ways work.

Leave "Which AI writes your posts" on **Automatic (free, with backup)**.

## 3. Writing a post, step by step

1. **Admin > AI writer.**
2. **Pick a topic.** Type one, or click **Write a post** on any item in the AI news list (the news feeds are unchanged).
3. **Keywords are chosen for you.** When you pick a news item, keywords are researched and the **primary keyword** and **secondary keywords** are filled in automatically. You can click any suggestion to add or remove it. Sources, all free: Google, Bing, DuckDuckGo and YouTube suggestions (a phrase suggested by several engines ranks higher), related words (Datamuse), questions people ask, and AI ideas.
4. **Choose tone and language.**
   - Tones: Friendly expert, Professional, **Techy (tech enthusiast)**, **Developer (technical)**, Beginner friendly, Conversational (general readers), Storytelling, Persuasive (sales), Authoritative analysis, or Custom (describe it yourself).
   - Language: English or Bengali (বাংলা).
5. Optional: add your own notes (a real case you handled). Real experience makes the post far more original.
6. Press **Write the whole post**. You get:
   - **Title (H1)**, **meta title**, **meta description** with live length meters and a Google preview, and a **suggested URL slug** (always in English letters, even for Bengali posts).
   - The full article, with H2/H3 headings, FAQ (also saved as FAQ schema), internal links to your own posts, category and tags.
   - **Content score 0 to 100** in the right column (keyword targeting, depth, structure, readability, media and links, human voice), updated live as you edit. The buttons **Make it more human** and **Add missing keywords** improve it section by section.
7. If the AI stops part-way (busy, limit), a red box appears **above the article** with the reason and a **Continue writing** button. It carries on from the section where it stopped, nothing is lost. The same button appears if you press Stop. The plan always uses your keywords, the questions found in keyword research, the FAQ and the outline.
8. Open the **Images** tab (see below), then **Save as draft** or **Publish now**.

## 4. Images, infographics, charts and tables

The **Images** tab starts with a summary such as "Use 6 images and 1 table: 1 featured, 3 inline, 1 infographic, 1 chart, 1 table", and then one card for each:

- **Featured image** (always image 1, 16:9): exactly what it should show. It is used as the post cover and the social share picture.
- **Inline images, infographics and charts:** a ready prompt (70 to 140 words) to paste into ChatGPT, Nano Banana (Gemini), Midjourney or similar, the exact text to put on the image (with copy buttons), alt text, file name, caption, a suggested free tool and short how-to instructions.
- **Charts:** the chart type and the data table to plot. If the numbers are illustrative the card says **Replace with your real numbers**.
- **Tables:** the finished table is already inserted into the article (edit it in the article tab). No image needed.
- After you create a picture, press **Add image** on its card and it is placed in the post at the right spot.
- **Make new image prompts** asks for a fresh plan whenever you want one.

## 5. Making it read like a human wrote it

Every section is written by a "specialist content writer" prompt with strict rules (concrete examples, varied sentence length, no stock AI phrases, no invented statistics or quotes), then:

1. A free clean-up swaps stock AI words ("utilize", "leverage", "delve", "moreover"...) for plain words and removes long dashes.
2. With **Auto-polish** on (Settings), a section that still scores as machine-made gets one rewrite.
3. The content score has a "Human voice" group, and **Make it more human** rewrites flagged parts.

Honest note: no tool can guarantee that a detector will never flag text. This setup removes the usual AI patterns and pushes toward your own voice. The biggest single improvement is to add your **own notes** and to read the post once and change a few lines.

Bengali posts use separate rules (natural everyday Bangla, common English tech words kept in English letters, no word-by-word translation feel). Review a Bengali post before publishing; free models are good but not perfect in Bengali.

## 6. Free limits to know about

- **Model names are found automatically.** Free providers rename and retire models often, so the writer asks each provider for its live model list (cached for 30 minutes) and tries the best ones first. The names in the settings are only a backup.
- **"High demand" from Gemini** is a temporary busy signal from Google, not a problem with your key. The writer tries other models and providers and retries by itself.
- If you see an error naming every provider, open Settings > API keys and press **Test** on each key. A failed test now lists exactly what each provider answered, line by line.

- Free plans limit requests per minute and per day. A full post is about 10 to 14 requests. With one key, a long post may pause for a minute; with two or three keys it usually does not.
- Free model names change from time to time. If a model disappears, the next one is tried automatically. You can edit the model lists in **AI writer > Settings > Advanced**.
- The free search-suggestion sources have no volume numbers. Numbers (volume, difficulty) need a paid tool; connect Semrush later with `SEMRUSH_API_KEY` if you ever want that.

## 7. Settings reference (Admin > AI writer > Settings)

- **Which AI writes your posts:** Automatic (free, with backup), Gemini, Groq, OpenRouter, Same as the chat, ChatGPT (paid), Claude (paid).
- **If the chosen AI fails, try the other free ones:** on by default.
- **Auto-polish:** on by default.
- **Voice and defaults:** brand voice, audience, default tone (dropdown), default language (dropdown), default length.
- **Advanced:** model lists per provider, optional Semrush country code.
- **AI news feeds:** unchanged.

The chat settings (Analytics and integrations > Chat) also accept Groq and OpenRouter now.

## 8. Upgrade steps

1. Replace your project files with this version (keep `.env.local` and `storage`).
2. `npm install`, then `npm run build`.
3. Paste at least one free key in Admin > AI writer > Settings > API keys (section 2). No redeploy needed.
4. Admin > AI writer > Settings: check the provider is Automatic and the default tone and language.
5. Try one short post (800 words) first.

## Quick test checklist

- [ ] Paste a free key in AI writer > Settings > API keys and press Save: it says Works.
- [ ] Open AI writer: no red "No AI key" notice.
- [ ] Click Write a post on a news item: topic, primary and secondary keywords fill in.
- [ ] Choose Techy tone and write a post. Check title, meta, slug, article and the score.
- [ ] Open Images: see the summary, the featured image prompt, an infographic, a chart or table.
- [ ] Switch language to Bengali and write a short post. Check the slug is English.
- [ ] Turn off your Wi-Fi mid-way or remove one key: the writer reports the problem clearly and keeps your progress.

---

## বাংলায় সারসংক্ষেপ

1. আগে একটাই AI ব্যবহার হতো এবং পরপর অনেক request পাঠাত, তাই free limit-এ error আসত। এখন **Automatic** মোডে Gemini, Groq, OpenRouter এক এক করে চেষ্টা হয়; একটা busy থাকলে পরেরটা লেখে।
2. Env file লাগবে না। **Admin > AI writer > Settings > API keys** বক্সে free key paste করে Save চাপো (Gemini: aistudio.google.com/apikey, Groq: console.groq.com/keys, OpenRouter: openrouter.ai/keys)। Key encrypt হয়ে database-এ থাকে, redeploy লাগে না, কার্ড লাগে না। দুই-তিনটা দিলে সবচেয়ে ভালো।
3. News থেকে **Write a post** চাপলে primary ও secondary keyword নিজে থেকেই বসে যায় (Google, Bing, DuckDuckGo, YouTube suggestion দিয়ে, সম্পূর্ণ free)।
4. Tone বেছে নাও: Friendly, Professional, Techy, Developer, Beginner, Conversational, Storytelling, Persuasive, Authoritative বা নিজের লেখা tone। ভাষা: English বা বাংলা।
5. Title, meta title, meta description, slug, পুরো আর্টিকেল, FAQ আর ০-১০০ SEO score পাবে। Images ট্যাবে featured image, infographic, chart ও table-এর প্রম্পট ও নির্দেশনা আছে।
6. Semrush লাগে না। পরে চাইলে `SEMRUSH_API_KEY` দিলে real volume দেখাবে। ChatGPT/Claude paid অপশন হিসেবে আছে, তুমি বেছে না নিলে ব্যবহার হবে না।
7. কোনো টুল ১০০% "AI detect হবে না" গ্যারান্টি দিতে পারে না। নিজের অভিজ্ঞতা Notes-এ লিখে দিলে আর পোস্ট একবার পড়ে দু-একটা লাইন বদলালে সবচেয়ে ভালো ফল পাবে।
