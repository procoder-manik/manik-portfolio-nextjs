# 07 AI guide

## The AI features

| Feature | Where | What it does |
| --- | --- | --- |
| AI writer | AI > AI writer | Plans and writes a full SEO blog post, with keyword research, meta, slug, FAQ, image prompts and a 0 to 100 score |
| AI project writer | Portfolio > Add new (or Write with AI on a project) | Writes a portfolio project from the website, the kind of work and its stage: description, story, tags, meta title and description, alt text; banner prompts from your screenshot |
| AI news | AI > AI news | Fresh story ideas from RSS feeds you choose; one click turns a story into a post topic |
| AI IQ | AI > AI IQ | Teach the chatbot: generate answers, see unanswered questions, test the bot |
| Taught answers | AI > Taught answers | The list of every answer (feeds the chatbot, FAQ and Help center) |
| AI email replies | Messages | Drafts replies to contact messages |
| Chatbot | The chat bubble on the site | Answers visitors from taught answers, optionally with AI |

## Providers and keys

The writer uses **free AI** and never needs a paid subscription. Providers:

| Provider | Free? | Get a key |
| --- | --- | --- |
| Google Gemini | free tier | aistudio.google.com/apikey |
| Groq | free | console.groq.com/keys |
| OpenRouter | free models | openrouter.ai/keys |
| ChatGPT (OpenAI) | paid, optional | platform.openai.com |
| Claude (Anthropic) | paid, optional | console.anthropic.com |

### Adding a key

**Admin > AI writer > Settings > API keys.** Paste the key and press Save; it is tested at once. Keys saved here are stored **encrypted** (AES-256-GCM, derived from `JWT_SECRET`), are never shown again in full, work immediately without a redeploy, and win over the same variable in the environment. Remove a key with the bin icon to fall back to the environment value. Only administrators can manage keys. If `JWT_SECRET` ever changes, saved keys show "cannot be read" and must be pasted again. Without a database, put keys in the environment instead (`GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`).

### Automatic failover

In **Automatic** mode the writer tries Gemini, then Groq, then OpenRouter. For each provider it asks for the live list of models and tries the best ones first (free providers rename and retire models often; the names in the code are only a backup). A busy provider is retried once after a short wait, then skipped. Adding two or three keys gives the best reliability. If everything is busy the writer shows a countdown and retries by itself, and your progress is kept.

You can choose one provider first, "Same as the chat", or a paid one in **Settings > Which AI writes your posts**. Free providers still back it up unless you turn that off. A paid provider is used only if you choose it.

## Writing a post

1. **Pick a topic**: type one, or press **Write a post** on a news item. Keywords are researched and the **primary** and **secondary** keywords are filled in for you.
2. **Keyword research (free):** suggestions from Google, Bing, DuckDuckGo and YouTube (phrases suggested by more than one engine rank higher), related words, questions people ask, and AI ideas. Real volume and difficulty need a paid tool; add `SEMRUSH_API_KEY` later if you ever want that (optional).
3. **Choose tone and language.** Tones: Friendly expert, Professional, Techy (tech enthusiast), Developer (technical), Beginner friendly, Conversational, Storytelling, Persuasive, Authoritative analysis, or your own. Language: English or Bengali.
4. Add **your own notes** (a real case you handled). Real experience is the biggest quality boost.
5. Press **Write the whole post**. Steps: plan (title, meta title and description, slug, category, tags, outline, FAQ, related terms), image plan, then intro, each section and the FAQ one by one.
6. If it stops (busy, limit), a red box above the article shows why, with **Continue writing**, which carries on from the last finished section.
7. Review the tabs: **Article**, **Title, meta and URL** (with length meters and a Google preview), **Images**, **Outline and FAQ**. The **content score** updates as you edit; **Make it more human** and **Add missing keywords** improve it section by section.
8. **Save as draft** or **Publish now**.

### Images, infographics, charts, tables

The **Images** tab says how many visuals to use and why. Image 1 is the featured image (16:9, also the social picture). Each card has a paste-ready prompt for ChatGPT, Nano Banana (Gemini), Midjourney or similar, the exact text to put on the image, alt text, file name, caption, a suggested free tool and short how-to steps. Charts include the data to plot (marked "Replace with your real numbers" when illustrative). Tables are already inside the article. Press **Add image** on a card after creating the picture.

### Sounding human

Every section is written under strict rules (concrete examples, varied sentence length, no stock AI phrases, no invented statistics or quotes). A free clean-up swaps stock AI words for plain ones and removes long dashes. With **Auto-polish** on, a section that still looks machine-made is rewritten once. No tool can promise that a detector will never flag text; adding your own notes and reading the post once before publishing is what works best. Bengali posts use separate rules; review them before publishing.

## Portfolio projects

A new project opens with a short form: website name and address, what you did (new build, redesign, new pages, maintenance, store, speed, SEO, local SEO, migration, fixes, custom features), where the work is now (finished, still building, ongoing care), the full-page screenshot and optional notes. Then three steps run: the live website is read (no AI, also detects WordPress, Elementor, Shopify, Webflow, Next.js and more), the screenshot is read by an AI that can see images (colours, alt text, banner prompts), and the project is written. Nothing is saved until you press Create.

- Numbers and results come only from your notes. Anything the AI adds that is not there is dropped.
- On a saved project, **Write with AI** can fill only empty fields or replace everything; the slug never changes.
- **Images > Banner prompts from your screenshot** gives three prompts for a 1600 x 840 banner (attach the screenshot in ChatGPT or Nano Banana) and an upload slot for the finished banner.
- Full how-to: `docs/GUIDE-V4.8.md`.

## AI IQ and the chatbot

- The chat mode is chosen in **Analytics and integrations > Chat**. Built-in mode answers from taught answers; AI can be added on top with any provider.
- **Generate answers** with AI, or from a web page URL or pasted text; nothing is saved until you review it.
- **Questions the bot could not answer** lists real visitor questions; answer one to teach it.
- **Test** asks the bot exactly like a visitor and shows which answers matched.

## Limits and good habits

- Free plans limit requests per minute and per day; a full post is about 10 to 14 requests.
- Never trust numbers, quotes or claims written by AI without checking.
- Do not paste private customer data into prompts.
- If an error names every provider, open Settings > API keys and press **Test** on each key; failed tests list exactly what each provider answered.
