# File index

> Generated from the code by `scripts/gen-docs.ts`. Do not edit by hand; run the script again after changing the code.

The first comment of each source file, so you can find where something lives.

## `lib/`

| File | What it is |
| --- | --- |
| `admin-schema.js` | ---------- Search, social, schema, advanced and code tabs (Yoast / Rank Math style) ---------- |
| `ai-iq.js` | Q and A pairs for one service (or from a page or pasted text). |
| `ai-mail.js` | Writes a reply to a customer email. |
| `ai-writer.js` | Step 1: the SEO plan (title, meta, slug, keywords, outline, FAQ, terms). |
| `ai.js` | One place that talks to every AI provider. |
| `auth.js` |  |
| `base-url.js` | The address of the site that is running right now. |
| `blocks.js` | Pre-built page sections. |
| `card-templates.js` | Card templates for the "Cards" section, the home Services and Process sections and the Features and Steps sections. |
| `chatbot.js` | Best taught answers (AI IQ) for a question: word overlap on the question, keywords and answer. |
| `content-score.js` | NeuronWriter style content score: 0 to 100 from six weighted groups. |
| `content-updates.js` | Adds the extra knowledge-base answers and applies the safe answer updates to a live database. |
| `coupons.js` | Checks a code against a package and buyer. |
| `crm.js` | Creates or updates a CRM contact from any touchpoint (message, chat, order, payment). |
| `customers.js` | The signed-in customer (fresh from the database) or null. |
| `data.js` | The same database error would otherwise be printed for every setting on every page. |
| `db.js` | mongodb+srv:// needs a DNS "SRV" lookup. |
| `duplicate-server.js` | Builds a copy of one document: new title and slug, switched off so it is not live until you check it, counters at zero, nothing that must stay unique repeated. |
| `explain-error.js` | Turns low-level server errors (mostly MongoDB) into a message that says what to fix. |
| `features.js` | Feature switches from Admin > Site and contact > Features. |
| `field-info.js` | Plain explanations shown behind the (i) icon next to every admin field. |
| `form-meta.js` |  |
| `forms.js` | Form builder core. |
| `help.js` | Turns the taught answers into Help center articles and topics. |
| `humanize.js` | Patterns that make text read like generic AI output. |
| `indexnow.js` | IndexNow tells Bing, Yandex, Seznam and Naver about new or changed pages within minutes. |
| `keywords.js` | Free suggestion sources. |
| `llms.js` | The text of /llms.txt (short guide) and /llms-full.txt (key pages in full) for AI assistants. |
| `log404.js` | Remembers a missing address so you can redirect it (Marketing > 404 log). |
| `mail.js` | Sends email through Resend (RESEND_API_KEY) or SMTP (SMTP_HOST ...). |
| `markdown.js` |  |
| `notifications.js` | status: placed \| paid \| in_progress \| completed \| cancelled. |
| `options.js` | Payment methods. |
| `orders.js` |  |
| `plan-normalize.js` | Free AI models sometimes answer with the right idea in a slightly different shape (an object where a word was expected, a list instead of text). |
| `plans.js` | Monthly / yearly plan maths, shared by the pricing cards, checkout, the order API and emails. |
| `popups.js` | Popups: defaults, ready-made templates and the targeting rules. |
| `project-ai-options.js` | Shared by the admin (the "Write with AI" window) and the server (the prompts). |
| `project-ai.js` | Platform and tools, read from the page source (no AI needed). |
| `ratelimit.js` | Fixed-window limiter. |
| `redirects.js` | Redirect rules. |
| `referrals.js` | Converts an order amount to the store currency (credit and payouts are kept in it). |
| `revalidate.js` |  |
| `roles.js` | Admin user roles. |
| `rss.js` | Headlines from the feeds you choose. |
| `safe-fetch.js` | Fetches a public web page as plain text. |
| `schema-extra.js` | Extends the base graph (lib/schema.js) with the business details from SEO settings, the page's own schema choice and any custom JSON-LD. |
| `schema-item.js` | What each part of a page's schema means, in plain words. |
| `schema.js` | One combined JSON-LD @graph per page: Person, ProfessionalService, WebSite, plus whatever the page adds (BreadcrumbList, BlogPosting, CreativeWork, FAQPage, OfferCatalog). |
| `secrets.js` | API keys you paste into Admin > AI writer > Settings. |
| `seed-data.js` | Default content. |
| `seed-run.js` | Adds the starter content. |
| `seo-analysis.js` | On-page SEO analysis in the style of Rank Math and Yoast. |
| `seo.js` | Builds Next.js metadata from an item's SEO fields with sensible fallbacks. |
| `server-auth.js` | The signed-in admin, re-checked against the database on every call so a removed, blocked or re-roled user loses access at once (not only when the 7-day cookie ends). |
| `subscriptions.js` | Called when an order becomes paid. |
| `tones.js` | Writing tones for the AI writer. |
| `track.js` | Fires conversion events to whatever is switched on. |
| `trash-server.js` | Moves one document to the Trash: remembers its live switch, then hides it from the site. |
| `trash.js` | Draft and Trash rules for each admin list. |
| `upload.js` | Signed parameters so the browser can upload straight to Cloudinary. |
| `utils.js` |  |

## `components/site/`

| File | What it is |
| --- | --- |
| `AnnouncementBar.jsx` | Slim strip above the header. |
| `AppCard.jsx` |  |
| `BackToTop.jsx` | Appears after you scroll down, with a ring that fills as you read. |
| `BlogIndex.jsx` |  |
| `CaseStudyCard.jsx` | variant "feature" = large horizontal card, default = grid card |
| `ChatWidget.jsx` | Built-in assistant. |
| `CheckoutForm.jsx` |  |
| `CodeInjector.jsx` | Inserts admin-provided HTML (scripts included) into <head>, the top or the bottom of <body>. |
| `ContactForm.jsx` |  |
| `CountUp.jsx` | Counts the number part of values like "550+", "100%" or "7+" up when it scrolls into view. |
| `Countdown.jsx` | Live countdown to a date. |
| `Faq.jsx` |  |
| `FaqExplorer.jsx` | FAQ with a search box and a chip for each service. |
| `Footer.jsx` |  |
| `FormView.jsx` | Public form. |
| `Header.jsx` |  |
| `HelpSearch.jsx` | Search across every Help center answer. |
| `HeroShowcase.jsx` | The hero's one orchestrated motion: a stack of real client sites, the front one scrolling top to bottom, rotating to the next every few seconds. |
| `HtmlBlock.jsx` | Renders admin HTML inside its own box and lets embedded scripts run. |
| `Icon.jsx` |  |
| `InfoTip.jsx` | Small (i) button with an explanation. |
| `Integrations.jsx` | Tracking and custom code from Admin > Integrations. |
| `JsonLd.jsx` | The page's single combined JSON-LD graph, plus this page's own head, body and CSS code from its SEO > Code tab. |
| `Marquee.jsx` |  |
| `Motion.jsx` | Site-wide motion for the public pages: - scroll reveal (headings rise word by word, cards and screenshots fade up in sequence) - pointer spotlight on cards and magnetic primary buttons (mou... |
| `OrderTracker.jsx` | Fires the purchase conversion once per order when it is paid. |
| `PaymentProof.jsx` |  |
| `PopupManager.jsx` | Decides when each live popup may show: page rules, device, visitor, schedule, triggers and how often. |
| `PopupView.jsx` | The popup itself: layout, colours and animation. |
| `PortfolioGrid.jsx` |  |
| `PostCard.jsx` |  |
| `PostToc.jsx` | Finds the heading that is currently at the top of the reading area, on every scroll. |
| `PricingTabs.jsx` | lay: { layout: 'grid' \| 'carousel', columns, autoplay, interval } from the admin. |
| `PrintButton.jsx` |  |
| `ProjectCard.jsx` |  |
| `ReadingProgress.jsx` |  |
| `RefTracker.jsx` | Visitors who arrive with ?ref=CODE: remember the code (httpOnly cookie set by the API), count the visit once per session, then tidy the address bar. |
| `Reveal.jsx` |  |
| `ScrollShot.jsx` | A browser frame whose full-page screenshot scrolls slowly on hover (or focus/tap). |
| `ScrollSpy.jsx` | Sticky "on this page" list that highlights the section in view. |
| `SectionHead.jsx` |  |
| `ShareLinks.jsx` |  |
| `SkillBars.jsx` | Proficiency bars that fill when scrolled into view. |
| `SocialIcon.jsx` | Picks an icon from the profile URL or label. |
| `SplitText.jsx` | Splits a heading into words so each one can slide up from behind a mask. |
| `Timeline.jsx` | Animated vertical timeline. |

## `components/admin/`

| File | What it is |
| --- | --- |
| `AiIq.jsx` |  |
| `AiKeys.jsx` | Paste API keys here instead of in the environment. |
| `AiNews.jsx` | Headlines from your AI news feeds. |
| `AiWriter.jsx` | Writes the article from the plan, one part at a time. |
| `ContentScore.jsx` | NeuronWriter style score: ring, six groups with points, flagged AI phrases and one-click fixes. |
| `Dialog.jsx` | Simple modal used for the delete choices and other confirmations. |
| `Editor.jsx` |  |
| `EmailComposer.jsx` | Small composer used on orders, messages and CRM contacts. |
| `EntriesView.jsx` | Google Forms style summary: counts and bars for choices, averages for ratings, latest text answers. |
| `Fields.jsx` | The admin section (projects, payments, referrals...) so each field finds its own explanation. |
| `FormBuilder.jsx` |  |
| `List.jsx` |  |
| `NotFoundLog.jsx` |  |
| `OrderPortal.jsx` | What the buyer sees in /account: progress, due date, updates and files. |
| `ProjectAi.jsx` | ---------- helpers ---------- |
| `SchemaPanel.jsx` | Shows the schema this page prints for Google, built from the form as it is now. |
| `SeoOverview.jsx` | Every page on one screen: score, keyword, meta lengths, index state, schema and sitemap. |
| `Sidebar.jsx` |  |
| `Status.jsx` |  |
| `SubscriptionBox.jsx` | Start and end dates for monthly and yearly plans. |
| `UsersView.jsx` |  |
| `api.js` | Uploads files. |
| `seoTpl.js` | The title template from SEO settings (for example "%s \| Site name"), fetched once and reused. |

## `scripts/`

| File | What it is |
| --- | --- |
| `seed.mjs` | Fills MongoDB with the starter content. |
| `setup.mjs` | One-time local setup: creates .env.local with a random JWT secret and admin password, so `npm run dev` works right after extracting. |
