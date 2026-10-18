# Routes that are not pages (API, feeds, files)

> Generated from the code by `scripts/gen-docs.ts`. Do not edit by hand; run the script again after changing the code.

"Access" shows who may call it: an admin permission area, or public.

| Address | Methods | Access | Notes |
| --- | --- | --- | --- |
| `/api/account/affiliate` | POST | public, rate-limited | action: apply \| payout-details \| request-payout |
| `/api/account/auth` | POST, DELETE | public, rate-limited | Customer sign in |
| `/api/account/avatar` | POST, DELETE | public, rate-limited | Profile photo: JPG, PNG or WebP up to 2 MB. Checked by its bytes, not its name. |
| `/api/account/claim` | POST | public, rate-limited | Add an order to the signed-in account using its private order link. |
| `/api/account/forgot` | POST | public, rate-limited |  |
| `/api/account/messages` | POST | public, rate-limited | A signed-in customer writes to you. It lands in Admin > Messages; your replies show in their account. |
| `/api/account/profile` | PUT | public, rate-limited | Update profile details, or change the password ({ currentPassword, newPassword }). |
| `/api/account/register` | POST | public, rate-limited |  |
| `/api/account/reset` | POST | public, rate-limited |  |
| `/api/account/verify` | GET, POST | public, rate-limited | Link from the confirmation email |
| `/api/admin/:resource` | GET, POST | admin | ?view=all (default, not trashed) \| live \| draft \| trash. Also returns counts for the tabs. |
| `/api/admin/:resource/:id` | GET, PUT, PATCH, DELETE | admin | PATCH { action: 'restore' \| 'draft' \| 'trash' } |
| `/api/admin/:resource/bulk` | POST | admin | POST { action: trash \| restore \| draft \| publish \| delete \| empty, ids: [] } |
| `/api/admin/account` | PUT | admin |  |
| `/api/admin/affiliates` | GET, POST | shop | Affiliates, payout requests and the rewards ledger in one view. |
| `/api/admin/ai-iq` | GET | content | Overview for the AI IQ page: answers per group, questions the bot could not answer, and AI status. |
| `/api/admin/ai-iq/gaps` | DELETE | content |  |
| `/api/admin/ai-iq/generate` | POST | content | POST { category, count, mode: 'ai' \| 'url' \| 'text', url?, text? } -> { items } (not saved yet) |
| `/api/admin/ai-iq/save` | POST | content | POST { items: [{ question, answer, category, keywords, source }], resolveGap? } saves taught answers, skipping questions that already exist. |
| `/api/admin/ai-iq/test` | POST | content | Asks the bot a question exactly like a visitor would, and shows which taught answers matched. |
| `/api/admin/ai/keys` | GET, POST, PUT | system | PUT { name, value }  saves (empty value removes the saved key) POST { name }        sends one tiny request to check that the key works |
| `/api/admin/ai/keywords` | POST | blog | POST { topic, audience, language } -> free search suggestions (Google, Bing, DuckDuckGo, YouTube), related words, AI ideas (free AI) and a ready pick of primary and seco... |
| `/api/admin/ai/news` | GET | blog |  |
| `/api/admin/ai/plan` | POST | blog | Step 1 of writing: title, meta, URL, category, keywords, outline, FAQ and related terms. (Image prompts come from /visuals.) |
| `/api/admin/ai/rewrite` | POST | blog | Rewrites one section: more human, or with missing keywords and terms worked in. Keeps the meaning, headings and links. |
| `/api/admin/ai/section` | POST | blog | Step 2: writes one part (intro, a section, or the FAQ) so each call stays short. Every part is cleaned for free (stock AI words swapped, long dashes removed). If it stil... |
| `/api/admin/ai/status` | GET | blog | Which AI keys exist on the server (never the keys themselves). |
| `/api/admin/ai/visuals` | POST | blog | Step 1b: how many images, the featured image, infographics, charts and tables, each with a ready prompt and instructions. |
| `/api/admin/auth` | POST, DELETE | public, rate-limited |  |
| `/api/admin/entries` | GET, PATCH, DELETE | entries | GET ?form=<id>&status=&q=&format=csv |
| `/api/admin/mail` | GET, POST | shop | One endpoint for every email the admin sends by hand. kind: invoice \| status \| custom ; target: orderId \| messageId \| contactId \| to |
| `/api/admin/mail/draft` | POST | shop | POST { messageId \| orderId \| contactId, tone?, note? } -> { body, source: 'ai' \| 'template', warning? } |
| `/api/admin/media` | GET | media |  |
| `/api/admin/not-found` | GET, DELETE | marketing |  |
| `/api/admin/schema-preview` | POST | seo | POST { resource, doc, rebuild } -> the page's schema built from the current form (saved or not), with what each part means. rebuild:true also refreshes the live page so... |
| `/api/admin/seed` | POST | system |  |
| `/api/admin/seo-overview` | GET | seo | One row per page on the site with its SEO health, so you can see and fix everything in one place. |
| `/api/admin/settings/:key` | GET, PUT | admin |  |
| `/api/admin/stats` | GET | admin |  |
| `/api/admin/upload` | GET, POST | media | GET: tells the admin how to upload. With Cloudinary set, the browser uploads directly. |
| `/api/admin/users` | GET, POST, PUT, DELETE | system | PUT { id, name?, role?, disabled?, password? }. You cannot lock yourself out or remove the last administrator. |
| `/api/chat` | POST | public, rate-limited |  |
| `/api/contact` | POST | public, rate-limited |  |
| `/api/coupons/check` | POST | public, rate-limited | Checkout preview: { code, package, email } -> discount. The order route checks again. |
| `/api/cron/subscriptions` | GET | public | Daily subscription check: reminders before a plan ends, and switching ended plans off. Vercel Cron calls this once a day with the header  Authorization: Bearer <CRON_SEC... |
| `/api/forms/:slug` | GET, POST | public, rate-limited | Public: the form definition (used by popups and the form block). Never includes private settings. |
| `/api/forms/upload` | POST | public, rate-limited | Public upload for "File upload" fields. Checks the form, the allowed types and the size you set. |
| `/api/health` | GET | public | Open /api/health to check setup. Shows only whether values exist, never the values. |
| `/api/orders` | POST | public, rate-limited |  |
| `/api/orders/:number` | POST | public, rate-limited | Buyer submits the transaction ID for a manual payment (bKash, Nagad, Rocket, bank, PayPal, Payoneer). |
| `/api/payments/paypal` | GET | public |  |
| `/api/payments/sslcommerz` | POST | public | SSLCommerz posts form data to success, fail, cancel and IPN. Every success is re-checked with the validation API before the order is marked paid. |
| `/api/popups/event` | POST | public, rate-limited | Counts popup views, clicks and conversions. Fire and forget from the browser. |
| `/api/redirect-rules` | GET, POST | public, rate-limited | Read by the middleware to know which addresses to redirect. Rules are not secret: visitors see them anyway. |
| `/api/ref` | POST | public, rate-limited | A visitor arrived with ?ref=CODE. Remembers the code in a cookie and counts the click. |
| `/feed.xml` | GET | public | RSS feed of the blog: feed readers, aggregators and some AI tools use it to find new posts. |
| `/indexnow-key.txt` | GET | public |  |
| `/llms-full.txt` | GET | public |  |
| `/llms.txt` | GET | public |  |
| `/media/:...path` | GET | public |  |
| `/robots.txt` | GET | public |  |
| `/sitemap.xml` | GET | public | Built from the database on request, so it always matches what is live. Honors every per-page setting. |
