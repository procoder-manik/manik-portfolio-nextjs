# PROJECT BRIEF: Manik Hossain Portfolio (Next.js + MongoDB)

> **কীভাবে ব্যবহার করবেন:** নতুন চ্যাটে এই পুরো ফাইলটা পেস্ট করুন (বা আপলোড করুন), সাথে প্রজেক্টের zip ফাইল দিন, তারপর লিখুন: "এখন পর্যন্ত এই হয়েছে, এখন আমি এই সমস্যার মুখোমুখি হচ্ছি / এই ফিচার চাই।" কোড বদলালে zip-টাই আসল সত্য; এই ব্রিফ শুধু মানচিত্র।
>
> **For the assistant:** This is the hand-off document for an existing, working codebase. Read it fully before editing. If the user uploads the project zip, the files win over this brief wherever they differ. Keep the conventions in section 12.

---

## 1. Owner and purpose

- **Owner:** Manik Hossain, web designer, WordPress expert and SEO specialist from Bangladesh. 7+ years, 550+ websites, 185+ clients, 14 countries. Email admin@manikhossain.in, phone +880 16500-43801, domain manikhossain.in.
- **Product:** personal portfolio + blog + live resume + service shop, with a WordPress-like admin panel so every piece of content is editable without code.
- **Origin:** rebuilt from his earlier static HTML/Tailwind site (index.html, portfolio.html, pricing.html, assets/js/data.js). All real content (projects, packages, FAQ, testimonials, education, experience) was migrated into `lib/seed-data.js`.
- **Hosting target:** Vercel (Hobby/Pro) + MongoDB Atlas (M0, Singapore) + Cloudinary. VPS also supported.

## 2. Status (what is done)

Built, production build passes, every page and the admin panel were checked in a real browser (desktop, mobile, dark, light).

Done:
1. Public site: home (one-page sections with anchor scroll), portfolio archive + single, blog archive + category + single, resume, pricing, checkout, order status, contact, custom pages, 404.
2. Hover-scroll full-page screenshots in browser frames (the signature element), plus an auto-rotating hero stack.
3. Admin panel with schema-driven CRUD for projects, posts, categories, pages, services, packages; singleton editors for site, home, resume, payments; orders, messages, media library, account.
4. Checkout + orders with bKash, Nagad, Rocket, bank, card (SSLCommerz), PayPal (REST), Payoneer.
5. SEO: combined JSON-LD @graph per page, sitemap, robots, canonical, OG.
6. Vercel readiness: `vercel.json`, direct browser to Cloudinary uploads, Vercel URL fallback, one-click "Load starter content", Next 15.5.27 (patched), security headers, `npm run setup` for local env.
7. Docs: `README.md` (GitHub, English, screenshots), `docs/SETUP-BN.md` (Bengali setup), this brief.

Not done / known gaps: see section 13.

## 3. Tech stack (exact versions)

| Package | Version | Use |
| --- | --- | --- |
| next | 15.5.27 | App Router, JS (no TypeScript); async params/cookies/headers (adminRoute awaits ctx.params) |
| react / react-dom | 18.3.1 | |
| mongoose | 8.24.4 | Models, cached connection |
| jose | 5.9.6 | JWT (edge-safe, used in middleware) |
| bcryptjs | 2.4.3 | Admin password hashing |
| framer-motion | 11.11.9 | Hero stack, tab pills, filter grid, reading progress |
| marked | 14.1.3 | Markdown to HTML (custom renderer adds heading ids for TOC) |
| lucide-react | 0.453.0 | Icons |
| nodemailer | 10.0.13 | SMTP sending (Resend is the alternative) |
| tailwindcss | 3.4.14 + @tailwindcss/typography | Styling |
| dotenv | 16.4.5 (dev) | For `scripts/seed.mjs` |

Node 20+ (`.nvmrc`, `engines >=20.9`). package.json `overrides` pins postcss 8.5.28. `images.unoptimized: true` (image optimizer off). Remaining `npm audit` items are Tailwind 3 build-time tooling only; do not run `npm audit fix --force`. Path alias `@/*` to project root (`jsconfig.json`). Images use plain `<img>` (not next/image) because URLs can be local `/media/...`, `/seed/...` or Cloudinary.

## 4. File map

```
app/
  layout.js                 root: fonts via <link> (Bricolage Grotesque + Instrument Sans), theme script, metadata from settings.site, force-dynamic
  globals.css               design tokens (CSS vars, dark/light), component classes (.shell .btn-primary .card .field .chip .prose-site .grid-paper ...)
  not-found.js, robots.js, sitemap.js, icon.svg
  (site)/                   PUBLIC (route group, shares Header + Footer)
    layout.js               Header + Footer, skip link
    page.js                 HOME: hero, tools marquee, #about, #services, #work, process, #resume, #pricing, testimonials, #blog, #faq, #contact CTA
    portfolio/page.js       archive (PortfolioGrid client filters)
    portfolio/[slug]/page.js single project
    blog/page.js, blog/category/[slug]/page.js  (both render components/site/BlogIndex)
    blog/[slug]/page.js     single post
    resume/page.js          printable resume
    pricing/page.js         services with package cards, FAQ
    checkout/[slug]/page.js package checkout (quote packages redirect to /contact?service=)
    order/[number]/page.js  private order status (?t=token), payment instructions, proof form
    contact/page.js         contact info + ContactForm (?service= prefill)
    [slug]/page.js          custom pages from the Page model (privacy-policy, terms-and-conditions)
  admin/
    login/page.js           sign-in
    (panel)/layout.js       Sidebar + content area
    (panel)/page.js         dashboard (stats, latest orders/messages, SeedBox when DB empty)
    (panel)/[resource]/page.js        generic list   -> components/admin/List
    (panel)/[resource]/[id]/page.js   generic editor -> components/admin/Editor (id = "new" to create)
    (panel)/settings/[key]/page.js    singleton editor (key = site | home | resume | payments)
    (panel)/orders/, orders/[id]/     custom order list + detail (status, notes, history)
    (panel)/messages/, media/, account/
  api/
    admin/auth              POST login (bootstraps first user from env), DELETE logout
    admin/[resource]        GET list, POST create (auto slug)
    admin/[resource]/[id]   GET, PUT (order status adds history), DELETE
    admin/settings/[key]    GET merged settings, PUT save
    admin/upload            GET upload mode (cloudinary signature | local | none), POST multipart (local) or JSON {record} (Cloudinary)
    admin/media, admin/stats, admin/account, admin/seed
    contact                 POST message (honeypot field "website")
    orders                  POST create order, returns redirect (order page, SSLCommerz or PayPal URL)
    orders/[number]         POST buyer submits transactionId (+ senderNumber) with token
    payments/sslcommerz     POST callbacks ?result=success|fail|cancel|ipn, validates via validator API
    payments/paypal         GET return URL, captures order
  media/[...path]/route.js  serves local uploads from storage/uploads (range support for video)
components/
  site/  Header (nav + ThemeToggle export), Footer, ScrollShot, ProjectCard (+ platformLabel export), HeroShowcase,
         PortfolioGrid, PostCard, BlogIndex, PricingTabs (+ PackageCard export), CheckoutForm, PaymentProof (+ CopyValue),
         ContactForm, Faq, Marquee, SectionHead, Reveal, ReadingProgress, ShareLinks, PrintButton, Icon, JsonLd
  admin/ api.js (api(), upload()), Fields.jsx (all field types), Editor.jsx (+ Notice), List.jsx, Sidebar.jsx, Status.jsx
lib/
  db.js            dbConnect() cached on global, hasDB()
  models/index.js  all Mongoose models + MODELS map (resource name -> model)
  data.js          server-only read layer; every getter falls back to seed data when no DB or on error
  seed-data.js     starter content (projects, categories, posts, services, packages, pages, settings)
  seed-run.js      server-only seeding used by /api/admin/seed
  admin-schema.js  RESOURCES (CRUD forms + list columns) and SETTINGS (singleton forms)
  options.js       CMS_OPTIONS, TECH_OPTIONS, VIDEO_PROVIDERS, ORDER_STATUS, PAYMENT_METHODS, SERVICE_ICONS
  utils.js         cn, slugify, serialize, fmtDate, readingTime, projectDuration, money, priceLabel, BILLING, videoEmbed, get/set (dot paths), deepMerge, siteUrl, hostOf
  markdown.js      renderMarkdown(md) -> { html, toc }
  schema.js        buildGraph(site, extraNodes), crumbs, faqNode, projectNode, postNode, catalogNode
  auth.js          signToken / verifyToken (jose), COOKIE = "mh_admin"
  server-auth.js   getAdmin(), adminRoute(handler) wrapper (401 + JSON errors, duplicate slug message)
  upload.js        saveUpload (Cloudinary server-side or local disk), cloud(), cloudinarySignature()
  orders.js        newOrderNumber (MH-YYMMDD-XXXX), newToken, markPaid, markFailed
  mail.js          notify(subject, text) via SMTP if configured
  payments/sslcommerz.js, payments/paypal.js
middleware.js       protects /admin/* and /api/admin/* (except /admin/login and /api/admin/auth)
scripts/seed.mjs    terminal seeding (reads .env.local then .env); --fresh wipes first
scripts/gen_shots.py generates placeholder tall SVG screenshots into public/seed/shots
public/seed/        starter images: shots/ (tall SVG mocks), work/ (banners), avatars/, logos/, img/ (portrait, og)
public/docs/        CV PDF
docs/               README screenshots, SETUP-BN.md, PROJECT-BRIEF.md
vercel.json, next.config.mjs (security headers), tailwind.config.js, .env.example, .nvmrc
```

## 5. Data models (lib/models/index.js)

All have timestamps. `slug` is unique where present.

- **Project:** title*, slug, client, industry, summary, content (markdown), liveUrl, bannerImage, scrollImage, useScrollAsBanner (bool), scrollDirection ('down'|'up'), gallery[], platformType ('cms'|'custom'), cms, technologies[], services[] (work type tags), duration, startDate, endDate, deliverables[], metrics[{value,label}], video{provider,url}, accent (hex), featured, published, order, seoTitle, seoDescription.
- **Post:** title*, slug, kind ('article'|'update'), category (category **slug** string, not ObjectId), excerpt, cover, content, tags[], featured, published, publishedAt, seo fields.
- **Category:** name*, slug, description, color, order.
- **Service:** name*, slug, summary, description, icon (lucide name), group, order, active.
- **Package:** name*, slug, service (service **slug**), tagline, price (charged at checkout), priceMax (optional, shows a range), currency, billing ('one-time'|'monthly'|'yearly'|'hourly'), unitNote, deliveryDays, revisions, features[], popular, active, order, ctaLabel, checkoutMode ('buy'|'quote'), checkoutNote.
- **Order:** number (unique), token, package (snapshot object), amount, currency, customer{name,email,phone,company,country}, requirements, method, status, payment{provider,transactionId,senderNumber,reference,paidAt,amountLocal,raw}, notes, history[{status,at,note}].
- **Message:** name, email, phone, subject, budget, service, message, read, starred.
- **Page:** title*, slug, content, published, showInFooter, seo fields.
- **Media:** url, name, type, size.
- **Setting:** key (unique: site | home | resume | payments), data (Mixed). Read with `getSettings(key)` = deepMerge(seed default, saved data), so new default keys appear automatically.
- **User:** email, name, passwordHash.

## 6. Settings shapes (singletons, defaults in seed-data.js)

- **site:** name, role, tagline, email, phone, phoneTel, whatsapp, calendly, location, replyTime, available, availabilityText, avatar, cvFile, socials[{label,url}], footerNote, seoTitle, seoDescription, ogImage.
- **home:** sections{about,services,work,process,resume,pricing,testimonials,blog,faq: bool}, hero{headline,intro,primaryLabel,secondaryLabel}, stats[{value,label}], tools[], about{heading,body(md),quote,image}, services{heading,intro,groups[{title,items[{title,body}]}]}, work{heading,intro,count}, process{heading,steps[{title,body,time}]}, resume{heading,intro}, pricing{heading,intro}, testimonials{heading,items[{quote,name,source,avatar}],logos[]}, blog{heading,intro,count}, faq{heading,items[{q,a}]}, cta{heading,body}, contact{heading,intro}.
- **resume:** headline, summary, experience[{role,company,start,end,bullets[]}], education[{degree,school,start,end}], skills[{group,level,items[]}], certifications[{name,issuer,year,url}], languages[{name,level}].
- **payments:** currency, bdtRate, instructions, bkash/nagad/rocket{enabled,accountType,number,note}, bank{enabled,bankName,accountName,accountNumber,branch,routing,swift,note}, card{enabled,note}, paypal{enabled,email,link,note}, payoneer{enabled,email,note}. Secrets (SSLCommerz, PayPal API) live only in env, never in DB.

## 7. Key mechanisms

**Data fallback.** `lib/data.js` wraps every read in `q(fn, fallback)`. No `MONGODB_URI` or a DB error: the site renders seed content (read-only). Admin APIs return seed items with `readOnly: true` and refuse writes with 503.

**Schema-driven admin.** `lib/admin-schema.js` defines forms. Field object: `{ name (dot path ok, e.g. "video.url"), label, type, half?, hint?, placeholder?, required?, options?, showIf?(doc), fields? (repeater), source/valueKey/labelKey (ref), accept (file) }`. Types implemented in `components/admin/Fields.jsx`: text, url, email, number, date, textarea, slug, select, segmented, color, switch, multiselect (options + custom add), tags, list, image, images, file, markdown (toolbar, image upload, preview), ref (loads `/api/admin/<source>`), repeater (nested fields, reorder, collapse). Editors with more than 3 sections show tabs. Ctrl/Cmd+S saves. To add a field: add it to the schema; for RESOURCES also add it to the Mongoose model; then use it on the public page.

**Hover scroll (components/site/ScrollShot.jsx).** Browser chrome (dots + host pill with accent dot) over a frame of fixed aspect. On hover/focus/touch it translates the tall image by (imgHeight - frameHeight) with duration = distance / speed (px per s, default 220), linear for long moves. `direction="up"` starts at the bottom. `auto` starts on load (used by HeroShowcase). Handles cached images via `img.complete` check.

**Hero (HeroShowcase).** Up to 5 featured projects with scrollImage, stacked 3 deep with framer-motion; front one auto-scrolls; rotates every 7 s; pauses on hover; dots to jump; respects reduced motion.

**Auth.** First login: if `users` is empty and email/password equal `ADMIN_EMAIL`/`ADMIN_PASSWORD`, a User is created. Cookie `mh_admin` (httpOnly, lax, 7 days). Middleware checks every /admin and /api/admin request; `adminRoute()` checks again inside handlers. No-DB mode accepts env credentials only.

**Uploads.** `upload()` in `components/admin/api.js` asks `GET /api/admin/upload`. Cloudinary configured: browser posts directly to `https://api.cloudinary.com/v1_1/<cloud>/auto/upload` with a server signature (folder `manik-portfolio`), then records it via JSON POST. Otherwise multipart to the server, saved to `storage/uploads/YYYY/MM/`, served at `/media/...`. On Vercel without Cloudinary, uploads are blocked with a clear message.

**Checkout and orders.**
1. `/checkout/[slug]` lists enabled methods (`PAYMENT_METHODS` filtered by `payments.<id>.enabled`), marks automatic ones (card with SSLCommerz env, PayPal with API env).
2. `POST /api/orders` validates, snapshots the package, computes `payment.amountLocal = ceil(price * bdtRate)` for local methods, creates the Order (status `pending_payment`), emails you, and returns a redirect: SSLCommerz gateway URL, PayPal approve URL, or `/order/<number>?t=<token>`.
3. Manual methods: order page shows account details (copy buttons) and the amount in taka; buyer submits transaction ID, status becomes `verifying`; admin sets `paid`.
4. SSLCommerz: callbacks validated with the validator API, then `markPaid`; fail/cancel sets `failed`.
5. PayPal: return URL captures; COMPLETED sets paid.
Statuses: pending_payment, verifying, paid, in_progress, completed, cancelled, failed (labels and colours in `ORDER_STATUS`).

**SEO.** Every public page renders one `<JsonLd>` with `buildGraph(site, [page nodes])`. Home adds FAQPage + OfferCatalog; portfolio single adds CreativeWork; blog single adds BlogPosting; pricing adds OfferCatalog + FAQPage; all add BreadcrumbList. Owner preference: always one combined schema, never separate scripts.

**Rendering.** Root layout sets `dynamic = 'force-dynamic'` (SSR on every request, no ISR yet).

## 8. Design system

- **Concept:** "blueprint" for a web builder. Deep navy base with a faint grid-paper pattern, signal blue accent, amber for annotations (process timings, update dots). The memorable element is the browser-framed, hover-scrolling screenshot; everything else stays quiet.
- **Tokens (globals.css, rgb triplets):** dark: base 12 21 38, surface 17 29 51, raised 25 40 68, line 38 55 88, ink 236 241 248, body 194 205 224, muted 134 151 182, signal 99 145 255, amber 255 180 70, good 52 211 153, bad 248 113 113. Light theme overrides under `[data-theme='light']`. Tailwind colour names: base, surface, raised, line, ink, body, muted, signal, amber, good, bad.
- **Type:** Bricolage Grotesque (display, headings, numbers) + Instrument Sans (body). `.h-display` clamp(2.5rem, 5vw, 4.6rem); `.h-section` clamp(2rem, 4.2vw, 3.4rem).
- **Layout:** `.shell` max 1240px, left-aligned headings, `SectionHead` = big heading left, intro + action right. Sections separated by hairline borders. Cards radius 22px, frames 16px, buttons pill.
- **Motion:** hero stack only as ambient motion; everything else is user-triggered (hover scroll, tab pill, filter layout). `prefers-reduced-motion` disables animation.
- **Theme:** `data-theme` on `<html>`, saved in localStorage key `theme`, default dark. ThemeToggle exported from Header.

## 9. Environment variables

Required: `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `NEXT_PUBLIC_SITE_URL`.
Required on Vercel: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
Optional: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `NOTIFY_EMAIL`; `SSLCZ_STORE_ID`, `SSLCZ_STORE_PASSWORD`, `SSLCZ_SANDBOX`; `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_SANDBOX`.
`siteUrl()` falls back to `VERCEL_PROJECT_PRODUCTION_URL`, then `VERCEL_URL`, then localhost.

## 10. Deployment

- Vercel: `vercel.json` sets region `sin1`, maxDuration 30 s for orders/payments, 60 s for seed. Atlas Network Access `0.0.0.0/0` (Vercel IPs change), strong DB password, readWrite role. After first deploy: sign in at /admin and click "Load starter content".
- VPS: `npm run build && npm start` (pm2 recommended); back up `storage/uploads`.
- Full Bengali steps: `docs/SETUP-BN.md`.

## 11. Routes quick reference

Public: `/`, `/portfolio`, `/portfolio/[slug]`, `/blog`, `/blog/[slug]`, `/blog/category/[slug]`, `/resume`, `/pricing`, `/checkout/[packageSlug]`, `/order/[number]?t=`, `/contact?service=`, `/[pageSlug]`, `/sitemap.xml`, `/robots.txt`, `/media/...`.
Customer: `/account`, `/account/orders`, `/account/orders/[number]`, `/account/messages`, `/account/referrals`, `/account/affiliate`, `/account/profile`, `/account/{login|register|forgot|reset}`.
Admin: `/admin`, `/admin/login`, `/admin/{projects|posts|categories|pages|services|packages|messages|customers|coupons}`, `/admin/affiliates`, `/admin/settings/referrals` (+ `/new` or `/<id>`), `/admin/orders`, `/admin/orders/<id>`, `/admin/media`, `/admin/account`, `/admin/settings/{site|home|resume|payments}`.

## 12. Conventions to keep

1. **Never use the em dash character** anywhere (code, copy, docs). Organisation rule.
2. **SEO schema: always one combined JSON-LD @graph per page**, never multiple separate schema scripts.
3. Plain JavaScript, no TypeScript. App Router. Server components by default; `'use client'` only where state or effects are needed.
4. Every admin API handler is wrapped in `adminRoute()`. Public writes validate input and never trust client prices (price is read from the Package).
5. Payment secrets only in env. Account numbers shown to buyers live in `settings.payments`.
6. New editable content: schema in `lib/admin-schema.js` + default in `lib/seed-data.js` + model field if it is a collection. Settings merge defaults automatically.
7. Copy style: sentence case, plain verbs, buttons say exactly what happens, no ALL-CAPS eyebrow labels, numbers only where content is a real sequence (process steps).
8. Images are `<img>` with `loading="lazy"` except above the fold.
9. Owner communicates in Bengali; answer in Bengali, give the result directly without narrating steps.

## 12b. Version 2 additions (communication, builder, integrations, security, speed)

**New files**
```
lib/mail.js               sendMail() via Resend (RESEND_API_KEY, MAIL_FROM) or SMTP; notify() to NOTIFY_EMAIL
lib/email/templates.js    branded email layout + contactThanks, orderEmail(status), invoiceEmail, customEmail, adminAlert; esc(), fill() for {name} {number} {package}
lib/notifications.js      sendOrderEmail(order, status, {force}), sendInvoice, sendThanks, sendCustom, alertNewMessage, alertNewOrder (logs to order.emails)
lib/crm.js                touchContact({...}) upserts a Contact from messages, chats, orders, payments
lib/ratelimit.js          rateLimit(key, limit, windowSec) via RateHit (Mongo TTL) or memory; clientIp()
lib/chatbot.js            ruleReply(text) from FAQ, packages, payments, contact (free); aiReply(history, chat.ai) calls Gemini (GEMINI_API_KEY, default model gemini-flash-latest), OpenAI (OPENAI_API_KEY, gpt-5-mini) or Claude (ANTHROPIC_API_KEY, claude-haiku-5-5) as picked in settings.integrations.chat.ai {provider off|gemini|openai|claude, model}; any failure falls back to rules
lib/blocks.js             BLOCKS (19 section types with admin fields), BLOCK_DEFAULTS, blockFields(type)
lib/revalidate.js         refreshContent() = revalidateTag('content')
lib/track.js              track(event) to gtag, dataLayer and fbq
lib/explain-error.js      readable MongoDB errors
app/(site)/invoice/[number]/page.js   printable invoice (?t=token)
app/(site)/apps/page.js               products page
app/api/chat/route.js                 chatbot endpoint
app/api/admin/mail/route.js           POST kind invoice | status | custom (orderId | messageId | contactId); GET ?preview=thanks|placed|paid|in_progress|completed|cancelled|invoice
app/api/health/route.js               setup check (env booleans, DB status)
app/admin/(panel)/crm/page.js         pipeline board + table
components/site/blocks/Blocks.jsx     server renderer for all blocks
components/site/{ChatWidget, Integrations, CodeInjector, HtmlBlock, AppCard, SocialIcon, SkillBars, CountUp, OrderTracker}.jsx
components/admin/EmailComposer.jsx
```

**Models added or changed:** App (products: name, slug, tagline, description, logo, url, status live|beta|coming-soon, category, tech[], featured, showInFooter, published, order); Contact (CRM: email unique, name, phone, company, country, stage new|contacted|proposal|won|lost, value, tags, notes, source, lastContactAt, orders, messages, spent, activity[]); RateHit (rate limit, TTL); Page gets blocks[], hideTitle, showInHeader; Post gets blocks[]; Order gets invoiceNumber, emails[]; Message gets replies[], autoReplied; User gets failedLogins, lockUntil, lastLoginAt, lastLoginIp. MODELS map includes apps and contacts.

**Settings added (SETTING_KEYS in lib/data.js):** integrations (seo, searchConsole, bing, ga4, gtm, googleAds, metaPixel, clarity, customCode.head/bodyStart/bodyEnd, chat{mode builtin|embed|off, embedCode, title, greeting, quickReplies, whatsappHandoff, ai{provider, model}}); navigation (header[], cta, footerColumns[{title, links[]}], showAppsInFooter, appsTitle, showPagesInFooter, bottomText); email (fromName, replyTo, signature, autoReply{enabled, subject, heading, body}, orders.{placed|paid|in_progress|completed|cancelled}{enabled, subject, body}). home gets sections.apps and apps{heading, intro}; resume gets highlights[], topSkills[{name, level}], tools[], availability.

**Admin field types added:** `blocks` (page builder: picker, reorder, duplicate, hide, delete) and `note` (HTML help text).

**Flows**
- Contact form or chat lead: rate limit, save Message, touchContact, auto thank-you (if enabled), owner alert.
- Order placed: invoiceNumber INV-..., touchContact, "placed" email, owner alert. Status change in admin (with "Email the customer" checked) sends the matching email; SSLCommerz or PayPal success sends "paid".
- Admin order screen: Approve payment, Start work, Mark delivered, Cancel, Email invoice, Resend status email, Write an email, emails log.
- Caching: every getter in lib/data.js is wrapped in unstable_cache (tag 'content', 600 s). Admin writes call refreshContent(). Admin settings GET uses getSettingsFresh. Order, invoice and health routes are force-dynamic.
- Security: login 10 tries per 15 min per IP, lockout 15 min after 5 wrong passwords; contact 5 per 10 min; orders 10 per hour; chat 30 per 10 min; proof 10 per 10 min. Headers in next.config.mjs (HSTS and upgrade-insecure-requests only when VERCEL or FORCE_HTTPS is set).

**Example builder page:** `/work-with-me` (seeded) shows most block types.

## 12c. Case studies (switchable feature)

- **Model** CaseStudy (`lib/models`, MODELS key `'case-studies'`, admin route `/admin/case-studies`): title, slug, client, clientLogo, industry, location, liveUrl, project (portfolio slug), summary, cover, scrollImage, accent, duration, startDate, endDate, services[], technologies[], platform, team, overview, challengeIntro, challenges[{title, body}], approachIntro, approach[{phase, title, body}], resultsIntro, results (md), metrics[{label, before, after, value}], testimonial{quote, name, role, avatar}, gallery[], blocks[], featured, published, order, publishedAt, seo.
- **Switch:** `settings.site.features.caseStudies` (default false) and `features.caseStudiesInMenu`. Helpers in `lib/features.js` (caseStudiesOn, isCaseStudyLink). When off: `/case-studies` and detail pages 404, home section hidden, header/footer links to /case-studies filtered out, sitemap skips them, the `caseStudies` block renders nothing. When on (and InMenu): "Case studies" is inserted after Work in the header and after Portfolio in the first footer column (logic in `app/(site)/layout.js`).
- **Pages:** `app/(site)/case-studies/page.js` (feature card + grid + CTA), `app/(site)/case-studies/[slug]/page.js` (hero, facts strip, scroll screenshot, "At a glance" accent band, ScrollSpy TOC, challenge cards, numbered approach timeline, results list, quote, gallery, blocks, next case study, CTA). Components: `CaseStudyCard` (variant feature or grid, exports Metric), `ScrollSpy`.
- **Home:** section id `case-studies` after Work, toggled by `home.sections.caseStudies` plus the feature switch; headings in `home.caseStudies{heading, intro, count}`.
- **Seed:** two example case studies (JS Law, BMC Centre) written from the real project briefs; replace wording and add real numbers before switching on.
- **Cache keys** include `process.env.CONTENT_BUILD_ID` (set per build in next.config.mjs), so cached content never survives a new deploy.

## 12d. Customer accounts (switchable, on by default)

**Switch:** `settings.site.features.customerAccounts` (default true, `accountsOn(site)` in `lib/features.js`). Off: account icon, sign-up prompts and every `/account` page disappear; data stays.

**Model** `Customer` (MODELS key `customers`, admin `/admin/customers`): email (unique, lowercase), name, phone, company, country, passwordHash, emailVerified, disabled, tokenVersion, verifyTokenHash/verifyExpires, resetTokenHash/resetExpires (all secrets `select: false`), failedLogins, lockUntil, lastLoginAt, lastLoginIp, messagesSeenAt, notes.
**Order** gains `customerId`, `progress` (0 to 100), `dueDate`, `updates[{text, link, linkLabel, at}]`, `deliverables[{label, url, note}]`, and the package snapshot now keeps `deliveryDays`. **Message** gains `customerId`, `orderNumber`.

**Auth:** cookie `mh_customer` (30 days), JWT signed with a separate key (`JWT_SECRET + ':customer-portal'`, role `customer`), so a customer token can never pass as an admin token. `getCustomer()` in `lib/customers.js` reloads the customer and rejects disabled accounts or an old `tokenVersion` (password change and reset sign out other devices). Middleware protects `/account/*` and `/api/account/*` except login, register, forgot, reset and verify. Login lockout after 5 wrong passwords; rate limits on login, sign-up, forgot, reset, claim, messages.

**Which orders a customer sees** (`orderFilter`): orders with their `customerId` (placed while signed in, or claimed with the private order link), plus every order under their email once `emailVerified` is true. Verifying the email (link from `sendVerifyEmail`, or a completed password reset) also back-fills `customerId` on those orders. Messages follow the same rule (`messageFilter`).

**Pages** (`app/(site)/account/`): `(auth)/login`, `(auth)/register` (`?email=&name=&claim=&t=` pre-fills and claims), `(auth)/forgot`, `(auth)/reset?token=`; `(portal)/` overview (stats, needs payment, ongoing projects with progress, recent messages, quick links, claim form), `(portal)/orders` (filters), `(portal)/orders/[number]` (steps, progress, expected delivery, updates timeline, files and links, message form, summary, invoice, history), `(portal)/messages` (write to you, conversations with your replies from Admin > Messages), `(portal)/profile` (details, password, sign out). Components: `components/account/Forms.jsx` (client), `components/account/OrderBits.jsx`, `components/account/ClaimOrder.jsx`.

**APIs** (`app/api/account/`): auth (POST login, DELETE logout), register, verify (GET link, POST resend), forgot, reset, profile (PUT details or password), claim (number + token, or a pasted order link), messages (POST).

**Elsewhere:** checkout pre-fills and locks the email when signed in and saves `customerId`; the order page shows "Save to my account" or "Create a free account"; order emails after "placed" add an "Open your account" button; header has an account icon; admin order screen has a **Customer portal** box (progress slider, expected delivery, files and links, post an update with optional email using `attach: 'account'` in `/api/admin/mail`); robots and headers keep `/account` out of search.

## 12e. Coupons, referrals, affiliates, profile photos, motion

**Settings key `referrals`** (Admin > Referral settings, defaults in `seed-data.js`, added to `SETTING_KEYS`): `cookieDays`; `coupons.enabled`; `referral{enabled, rewardMode credit|coupon, rate, maxReward, rewardCoupon, couponDays, friendCoupon, firstOrderOnly, heading, intro}`; `affiliate{enabled, rate, autoApprove, holdDays, minPayout, payoutMethods[], heading, intro, terms}`. Credit and payouts are kept in `settings.payments.currency` (`toBase()` converts BDT orders with `bdtRate`).

**Models:** `Coupon` (MODELS `coupons`, admin `/admin/coupons`: code uppercase unique, type percent|fixed, value, currency, maxDiscount, minAmount, packages[] slugs, startsAt, expiresAt, maxUses, usesCount, perCustomer, firstOrderOnly, customersOnly, assignedTo, source admin|referral, active). `Commission` (kind affiliate|referral, customerId, orderId, orderNumber, buyerName, base, rate, amount, currency, couponCode, status pending|requested|paid|void|credited, availableAt, payoutId). `Payout` (customerId, name, email, amount, currency, method, details, status requested|paid|rejected, reference, note, paidAt). `Customer` gains avatar, refCode, referredBy, credit, refStats{clicks, signups, orders}, affiliate{status none|pending|approved|rejected|paused, rate, about, website, payoutMethod, payoutDetails, appliedAt, approvedAt, adminNote}. `Order` gains subtotal, discount, creditUsed, coupon{code,type,value}, referral{code, customerId, kind, rewarded}, adjust{voided}.

**Flow.** A link `/?ref=CODE` is caught by `components/site/RefTracker.jsx`, which calls `POST /api/ref` (sets httpOnly cookie `mh_ref`, counts the click once per IP per day) and removes the parameter from the address bar. Sign-up stores `referredBy`. At checkout `POST /api/orders` re-checks the coupon (`lib/coupons.js checkCoupon`, then atomic `redeemCoupon`), takes store credit atomically, computes `amount = subtotal - discount - creditUsed`, and `attribute()` (lib/referrals.js) sets `order.referral`: approved affiliate earns affiliate commission, otherwise referral reward if the program is on; never both; no self-referral. An order covered in full is marked paid at once. When an order becomes paid (`markPaid` or admin status change) `rewardOrder()` runs once (lock on `referral.rewarded`): affiliate creates a pending Commission available after `holdDays`; referral either adds credit (`rate`% capped by `maxReward`) or creates a single-use personal coupon `REF-XXXXXX` copied from `rewardCoupon`. Cancelling an order runs `unwindOrder()`: gives back the coupon use and credit, voids its rewards and disables an unused reward coupon.

**Customer pages:** `/account/referrals` (link, share buttons, steps, stats, credit, rewards with coupon codes), `/account/affiliate` (apply form, pending/paused states, link, stats, balance on hold / available / requested / paid, request payout, payout details, commissions, payouts). Tabs appear only when each program is on. Profile has a photo upload (`POST/DELETE /api/account/avatar`, JPG/PNG/WebP up to 2 MB, checked by file bytes, stored with `saveUpload`, so Cloudinary is required on Vercel). Checkout has a Discounts card (coupon apply, friend coupon pre-filled from the referral cookie, "Use my referral credit"). Discounts appear on the order page, invoice, emails, account and admin order screens.

**Admin:** Shop > Coupons (schema CRUD), Shop > Referrals and affiliates (`/admin/affiliates`: program status, affiliates with approve, pause, reject and own rate, payout requests with mark paid or reject, rewards ledger with void), Site > Referral settings, Customers form gains photo, referral code, credit and affiliate fields. APIs: `/api/admin/affiliates` (GET overview, POST actions approve|reject|pause|rate|payout-paid|payout-reject|void), `/api/coupons/check`, `/api/ref`, `/api/account/affiliate` (apply|payout-details|request-payout).

**Motion** (all off with reduced motion): `app/(site)/template.js` fades each page in; header slides in; home hero children rise one after another (`.hero-in`) with two slow floating glows (`.orb-a`, `.orb-b`); `components/site/Motion.jsx` reveals headings, cards, screenshots, stats and list items as they scroll in (only elements that start below the fold, with a 4 s CSS fallback, skips framer-motion wrappers and anything inside `[data-noreveal]`); link cards lift on hover; primary buttons get a light sweep; buttons press in on click. Add `data-reveal` to any element to reveal it, or `data-noreveal` on a parent to opt out.

## 12f. Meta titles and descriptions everywhere

- `lib/seo.js`: `seoMeta(item, fallback)` builds metadata from `seoTitle` (used exactly as typed, `title.absolute`, no template suffix), `seoDescription`, `seoImage` (Open Graph and X), `seoNoindex` (robots noindex, follow); fallback gives title, description, image, path (canonical) and type. `pageMeta(integrations, key, fallback)` does the same for built-in pages.
- Fields added to Project, Post, Page, Category, CaseStudy: `seoImage`, `seoNoindex` (Category also gets `seoTitle`, `seoDescription`). Each has an **SEO** tab built by `seo(path, titleFrom, descFrom)` in `lib/admin-schema.js` with a live Google preview and length meters (field type `seo`, `SerpPreview` in `components/admin/Fields.jsx`).
- Built-in pages (portfolio, blog, resume, pricing, contact, apps, case studies) read `settings.integrations.pages.<key>.{seoTitle, seoDescription, seoImage, seoNoindex}` from **SEO and integrations > Page SEO**. Home stays in **Site and contact > Footer and SEO** (`site.seoTitle`, `site.seoDescription`, `site.ogImage`).
- Sitemap skips anything set to noindex and now lists every published page (`getAllPages`), not only footer pages.
- Admin PUT only re-slugs when the slug or its source field is in the body, so partial updates keep the slug.

## 12g. Motion v2, info tooltips, DNS fix

**Info tooltips.** `components/site/InfoTip.jsx` (client): an (i) button that opens on hover, focus or tap; the bubble is portalled to `<body>` with fixed coordinates so no container clips it; Escape or outside tap closes it. Admin: every field label and switch gets one automatically. `lib/field-info.js` holds the texts (`FIELD_INFO`, about 550 fields covered, test: none missing) and `fieldInfo(field, scope)` resolves them in this order: `scope:full.name`, `full.name`, wildcard (`pages.*.x`, `orders.*.x`, `sections.*`), `scope:leaf`, `leaf`, then the field `hint`. A field can also carry its own `info`. The scope comes from `InfoScope` context set by `Editor` (resource or settings key). `SECTION_INFO` explains each admin section next to its page title (lists, editors, orders, messages, CRM, media, account, dashboard, affiliates). Hand-written tips also on the order screen (quick actions, payment, status, notes, emails, history, customer portal box), the affiliates screen, the customer account (overview stats, attention list, projects, progress, delivery, updates, files, history, referral link and stats, rewards, affiliate terms and balances, payout details, apply form, email confirmation) and checkout (coupon, credit). Switch labels use `htmlFor` so the (i) inside never steals the toggle click. Add a tip for a new field by adding its name to `FIELD_INFO`.

**Motion v2** (all off with reduced motion): headings split into words (`components/site/SplitText.jsx`, server component, `data-split`) that slide up from a mask: the home hero on load (`data-split="now"`), section headings (`SectionHead`, about, FAQ, CTA) as they scroll in; intros blur in; screenshots rise and scale; reveals stagger in reading order; a pointer spotlight follows the cursor across cards; primary buttons lean toward the cursor (magnetic, via `--tx`/`--ty` and the `translate` property); link-card images zoom slightly; hero glows drift with scroll (`--sy`); a thin blue-to-amber scroll progress line sits at the top (`--sp`); the header hides while scrolling down and returns on scroll up; tooltips fade in. All driven by `components/site/Motion.jsx` and the motion blocks at the end of `app/globals.css`.

**DNS fix built in.** `lib/db.js` points SRV lookups for `mongodb+srv://` at 8.8.8.8 and 1.1.1.1 (only `dns.resolve*`, not normal requests). `MONGODB_DNS="off"` disables it, or give your own comma list.

## 13. Known gaps and ideas for next improvements

- **Contact page:** configurable form fields, file attachment, Cloudflare Turnstile, Telegram or WhatsApp alerts. (Auto-reply and rate limiting are done.)
- **Emails:** PDF invoice attachment (currently a link to the printable invoice), editable invoice line items, discounts and tax, email open tracking, scheduled follow-ups from the CRM.
- **CRM:** tasks and reminders, activity timeline view on the contact screen, CSV import and export.
- **Builder:** drag and drop reordering, block templates saved for reuse, block-level animations picker, home page built from blocks.
- **Real screenshots:** `public/seed/shots/*.svg` are placeholders; replace per project in admin. Could add automatic full-page capture (screenshot API) when a live URL is entered.
- **Performance:** caching is done. Next: next/image with a Cloudinary loader, preload the hero screenshot, self-host fonts with next/font.
- **bKash, Nagad direct APIs:** currently manual or via SSLCommerz. Direct merchant APIs (bKash Tokenized Checkout, Nagad merchant) could be added in `lib/payments/`.
- **Invoices:** PDF invoice per order, coupon codes, partial or milestone payments (deposit percentage), multi-currency display.
- **Admin:** multiple admin users and roles, drafts and scheduled publishing, revisions, bulk actions, drag-to-reorder projects, image crop and compression, delete media, export orders to CSV, dashboard charts.
- **Blog:** search, pagination, RSS feed, newsletter signup, comments, code highlighting.
- **Portfolio:** case-study before/after section from the old site, testimonials linked to projects, project categories or industries filter, "related projects" by tech.
- **i18n:** Bengali version of the public site.
- **Testing:** no automated tests yet; Playwright smoke tests would be a good addition.
- **Security hardening:** 2-factor login for admin, CSRF token (currently SameSite=Lax), audit log, a strict script CSP once the third-party list is fixed.

## 14. How to ask for changes (template)

```
[এই PROJECT-BRIEF.md পেস্ট করুন]
[প্রজেক্টের লেটেস্ট zip আপলোড করুন, বা শুধু সংশ্লিষ্ট ফাইলগুলো]

এখন পর্যন্ত যা হয়েছে: (যেমন: Vercel-এ লাইভ, ডোমেইন যুক্ত, ১০টা প্রজেক্টের আসল স্ক্রিনশট দেওয়া হয়েছে)
সমস্যা বা চাওয়া: (যেমন: contact form থেকে মেইল যাচ্ছে না / ক্রেতাকে অর্ডার কনফার্মেশন মেইল পাঠাতে চাই)
এরর থাকলে: (Vercel Logs বা ব্রাউজার কনসোলের এরর লেখা কপি করে দিন)
আউটপুট যেভাবে চাই: (পুরো zip / শুধু বদলানো ফাইল)
```
