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

## 12h. Version 3: per-page SEO, form builder, popups, redirects, users, Trash

**Per-page SEO (Rank Math style).** `seoTabs()` in `lib/admin-schema.js` adds SEO, Social, Schema, Advanced and Code tabs to pages, posts, projects, case studies and categories. New model fields (in `seo` in `lib/models/index.js`): focusKeyword, keywords, canonical, ogTitle, ogDescription, twitterCard, robots{nofollow,noarchive,nosnippet,noimageindex}, sitemap{exclude,priority,changefreq}, breadcrumbTitle, schemaMarkup (Mixed), code{head,bodyStart,bodyEnd,css}. `lib/seo-analysis.js` scores a page 0 to 100 against the focus keyword (also used by `/api/admin/seo-overview`). Built-in pages (home, portfolio, blog, resume, pricing, contact, apps, caseStudies) keep their SEO in settings keys `seo-<key>` (`getPageSeo(key)`, legacy values from `integrations.pages` and `site` are the fallback).
**One combined graph:** `components/site/JsonLd.jsx` is an async server component. Call sites pass `item={doc}` or `builtin="home"`. It runs `enhanceGraph()` (`lib/schema-extra.js`): patches the #business node from `settings.seo.business` (LocalBusiness, address, geo, hours, rating, sameAs), reuses the page's automatic node when the chosen schema type is the same kind, merges custom JSON-LD (page and global), and injects the page's own code. Never emit a second ld+json script.
**Global SEO** is settings key `seo` (Admin > SEO > SEO settings): title template, noindex site, business and local SEO, schema, sitemap, robots.txt, AI visibility, IndexNow, redirect options. Routes: `app/robots.txt/route.js`, `app/sitemap.xml/route.js` (images, per-item priority, exclusions), `app/llms.txt`, `app/llms-full.txt` (`lib/llms.js`), `app/indexnow-key.txt`, `app/feed.xml`. All are `force-dynamic`. `app/robots.js` and `app/sitemap.js` were removed.

**Form builder.** Models Form and FormEntry. `lib/forms.js` is shared by the builder, `components/site/FormView.jsx` and the server: field types, conditional logic (`visibleFields`), steps, totals (`computeTotal`), validation (`validate`), templates. Admin: `components/admin/FormBuilder.jsx` at `/admin/forms/[id]` (a static route that overrides the generic editor), `EntriesView.jsx` at `/admin/entries` (search, status, CSV, survey summary). Public: `/forms/[slug]`, the page block `form`, popups. API: `GET/POST /api/forms/[slug]` (honeypot, rate limit, server-side validation and price calculation, entry, notifications, auto reply, optional Order for payment using the same gateways as checkout), `POST /api/forms/upload`. Prices are always recomputed on the server from the saved form.

**Popups and announcement bar.** Model Popup, settings keys `popups` (global rules) and `announcement`. `lib/popups.js` (templates, targeting), `components/site/PopupView.jsx` (layouts modal, slidein, bar, drawer, fullscreen; builder or own HTML and CSS), `PopupManager.jsx` (triggers load, scroll, exit, idle, click, page views; frequency in localStorage; `a[href="#popup-slug"]` and `data-popup`), `POST /api/popups/event` (views, clicks, conversions). `AnnouncementBar.jsx` sets `--bar-h` so the fixed header sits below it.

**Redirects and 404 log.** Model Redirect and NotFoundHit. `middleware.js` loads `/api/redirect-rules` (60 s in-memory cache) and applies `lib/redirects.js` (exact, prefix with `/*`, regex with `$1`; 301, 302, 307, 308, 410, 451). Changing a slug of a published page, post, project, case study or category adds a 301 automatically (`autoRedirect` in `app/api/admin/[resource]/[id]/route.js`). `app/not-found.js` logs missing addresses via `lib/log404.js`.

**Users and roles.** `lib/roles.js` (administrator, editor, shop, author). `adminRoute(handler, area)` in `lib/server-auth.js` checks the role on every API call and re-reads the user from the database (blocked or deleted users lose access at once). Admin UI at `/admin/users`, API `/api/admin/users`. Sidebar hides what a role cannot open.

**Trash, Draft, permanent delete.** `lib/trash.js` and `lib/trash-server.js`. Deleting moves an item to Trash (`trashedAt`, previous live state in `trashState`); Restore puts it back; Delete permanently needs typing DELETE (`components/admin/Dialog.jsx`). Lists have All, live, draft and Trash tabs, bulk actions and Empty Trash. `site.features.trashDays` (default 30, 0 = keep) purges old items. Endpoints: `DELETE ?mode=trash|permanent`, `PATCH {action: restore|draft|trash}`, `POST /api/admin/[resource]/bulk`. Public getters skip trashed items because Trash also switches the live flag off.

**New admin field types:** datetime, code, json, seoAnalysis, socialPreview, popupTemplates, popupPreview. Every new field has an `info` text for its (i) icon.

**Not verified in a real database yet:** saving, Trash and Restore, form submit with email and payment, redirect middleware, users, popup counters. Logic was unit tested and the UI was checked in a browser without a database.

## 12i. Version 3.1: AI email replies, card templates, animated timeline

**AI reply.** `lib/ai-mail.js` `draftReply()` reads the whole message (and your earlier replies, or the order brief) and writes a ready reply using your prices, FAQ and contact details. Provider and standing instructions: Admin > Emails > AI reply (`email.aiReply {provider chat|gemini|openai|claude, model, instructions}`; "chat" reuses `integrations.chat.ai`). Keys come from GEMINI_API_KEY, OPENAI_API_KEY or ANTHROPIC_API_KEY. No key or an API error falls back to a template reply built from the FAQ and says so. Endpoint: `POST /api/admin/mail/draft {messageId | orderId | contactId, tone, note}`. `EmailComposer.jsx` has a Reply with AI button, tone select and optional notes; the draft fills the subject and message boxes (controlled inputs), then you press Send. `lib/chatbot.js` now exports the provider call helpers.

**Cards.** `lib/card-templates.js` (10 designs: service, numbered, image, stat, quote, row, glass, editorial, price, custom HTML) and `components/site/cards/Cards.jsx` (`Card`, and the grid or carousel with arrows, dots and optional autoplay). Used by the page sections Cards, Feature grid and Steps (`lib/blocks.js`, `Blocks.jsx`), and by the home Services and Process sections (`home.services.{template,layout,columns,showLinks,autoplay,linkLabel,groups[].items[].{icon,linkLabel,href}}`, `home.process.{template,layout,columns}`). Admin field types `cardTemplate` (visual gallery with live samples) and `cardsPreview`. Custom template: pick My own HTML and write markup with {title} {body} {icon} {image} {link} {number} {meta} {value}, plus CSS scoped to that section. Mono font: JetBrains Mono (`font-mono`).

**Animated timeline.** `components/site/Timeline.jsx` (gradient line draws on scroll, nodes light up, entries slide in; reduced motion shows everything). Used on the home Resume section, `/resume` (Experience and Education) and the new page section Timeline.

## 12j. Version 4: AI IQ, FAQ page, AI blog writer, AI news

**AI IQ (chatbot brain).** Model Knowledge (question, answer, category = service name, keywords, active, showOnFaq, order, source) and ChatGap (questions the bot could not match). `lib/chatbot.js` `matchTaught()` ranks taught answers (word overlap on question, keywords and answer); `ruleReply` returns a strong match word for word, `aiReply`'s system prompt includes up to 80 taught answers. `app/api/chat/route.js` logs unmatched questions to ChatGap. Admin: `/admin/ai-iq` (`components/admin/AiIq.jsx`: coverage per service, Test your bot, Questions it could not answer with Teach, Teach it faster: write with AI per service, learn from a web page URL via `lib/safe-fetch.js` which refuses private addresses, or paste text) and the generic list `/admin/knowledge` (Trash and Draft work). APIs under `/api/admin/ai-iq/*` (overview, test, generate, save, gaps). Starter answers: `seed.knowledge` (32 entries, 5 groups), seeded by `runSeed` and `scripts/seed.mjs` keyed by question.
**FAQ page.** `/faq` (`app/(site)/faq/page.js`, `FaqExplorer.jsx` with search and a chip per service) lists taught answers with showOnFaq, one combined schema with FAQPage. Built-in page SEO key `faq`; it is in the sitemap through `BUILTIN_PAGES`.

**AI writer.** Admin `/admin/ai-writer` (`components/admin/AiWriter.jsx`). Flow: topic, keyword research (`lib/keywords.js`: Google Autocomplete suggestions, optional Semrush `phrase_related` when SEMRUSH_API_KEY is set, AI ideas labelled as estimates), then `POST /api/admin/ai/plan` (title, metaTitle, metaDescription, slug, category, excerpt, tags, outline, FAQ, related terms, image prompts for ChatGPT or Nano Banana with exact on-image text, internal link ideas) and one `POST /api/admin/ai/section` call per part (intro, each H2, FAQ) so every request stays under 60 seconds. `POST /api/admin/ai/rewrite` powers Make it more human and Add missing keywords section by section. `lib/ai.js` is the single provider layer (Gemini, OpenAI, Claude; JSON mode; `parseJson`). Prompts and the human-writing rules are in `lib/ai-writer.js` and `lib/humanize.js` (banned words and phrases, rhythm rules). Settings key `aiwriter` (provider, model, brand voice, defaults, news feeds).
**Content score.** `lib/content-score.js` `scoreContent()` returns 0 to 100 from six groups: keyword targeting 25, depth and coverage 20, structure 20, readability 15, media and links 10, human voice and trust 10. It runs live in the browser. `aiScan()` in `lib/humanize.js` counts AI-style phrases and sentence-length variety. Saving a post stores `aiScore` and `aiMeta {images, outline, faq, terms, cta}` (Post model); the Blog list shows the score; the post editor has an AI plan tab with copyable image prompts; the post page adds FAQ schema from `aiMeta.faq`. Unfilled image slots (`![alt](#image-N)`) are dropped by `renderMarkdown`.
**AI news.** `lib/rss.js` (RSS and Atom, 20 minute memory cache, only title, short snippet and link are kept), `GET /api/admin/ai/news`, `AiNews.jsx` in the writer sidebar and `/admin/ai-news`; each headline has Write a post. Feeds are editable in AI writer settings.

**Not verified with real services here:** AI answers (no keys in the build environment), Google Autocomplete, Semrush and the live RSS feeds. UI flows were tested in a browser with the AI endpoints mocked.

## 12k. Version 4.2: duplicate, quick edit, dynamic email domain, card layouts, monthly/yearly plans, subscriptions

**Duplicate and Quick Edit.** `lib/trash.js` exports `DUPLICABLE` and `NOINDEXABLE`. `lib/duplicate-server.js` `buildCopy()` makes the copy (new title and unique slug, draft state, counters reset, coupon code suffix). `PATCH /api/admin/[resource]/[id]` takes `{action:'duplicate'}` and `{action:'quick', title, slug, live, noindex}` (slug change adds a 301 through `autoRedirect`). `POST /api/admin/[resource]/bulk` takes `action:'duplicate'`. UI in `components/admin/List.jsx` (copy icon, pencil icon opens an inline row, bulk Duplicate).

**Live email domain.** `lib/base-url.js` `getBaseUrl()` returns the running site (request host; trusted on Vercel, localhost, or the NEXT_PUBLIC_SITE_URL host), else `siteUrl()`. `siteUrl()` ignores a localhost `NEXT_PUBLIC_SITE_URL` when `VERCEL` is set. `lib/notifications.js` `ctx()` adds `site._base` and `c.base`; `lib/email/templates.js` reads it with `B(site)`; `orderLink(o, base)` and `invoiceLink(o, base)` take a base. Request-time API routes use `await getBaseUrl()` instead of `siteUrl()`.

**Card layouts.** `components/site/cards/CardLayout.jsx` (client) renders any children as grid or carousel: `layout`, `columns` 1 to 4, `autoplay`, `interval` seconds (2 to 30, default 5). `Cards.jsx` uses it. Also used by `PricingTabs`/`PackageGrid`, home Work and Testimonials, and page blocks projects, posts, pricing, testimonials (`layoutCtl` in `lib/blocks.js`). Home settings: `home.{pricing|work|testimonials}.{layout,columns,autoplay,interval}` (section Card layouts in `lib/admin-schema.js`, helper `LAYOUT`), `home.services.interval`, `cardCtl` gained `interval`.

**Monthly or yearly.** Package gets `monthlyYearly` (bool), `yearlyDiscount` (percent), `yearlyPrice` (optional manual). `price` is the monthly price when `monthlyYearly` is on. `lib/plans.js`: `hasChoice, yearlyTotal, priceFor, periodOf, yearlySavings, isRecurring, addPeriod`. `PackageGrid` (client) holds the Monthly | Yearly switch; `PackageCard` shows price, saving and effective monthly cost and links to `/checkout/<slug>?period=yearly|monthly`. Checkout page, `CheckoutForm`, `POST /api/orders` and `POST /api/coupons/check` all take `period` and recompute the price on the server (`priceFor`). Order `package` snapshot keeps the chosen `billing` period and `price`.

**Subscriptions.** Order gets `subscription {period, status none|pending|active|expired|renewed|cancelled, startsAt, endsAt, expiredAt, reminders[], renewedBy}`. Orders of a monthly or yearly period start as `pending`. `lib/subscriptions.js`: `activateSubscription(order)` (on paid: via `markPaid` and the admin status change; start today or at the end of the customer's previous active plan of the same package, end via `addPeriod`; typed dates are kept) and `runSubscriptionCheck()` (reminders on `email.subscription.reminderDays`, each once; marks expired; emails customer and owner). Cron: `app/api/cron/subscriptions/route.js`, schedule in `vercel.json` (daily 03:00 UTC), auth `Authorization: Bearer CRON_SECRET` or a signed-in admin. Emails: `subscriptionEmail()` in templates, `sendSubscriptionEmail` and `alertSubscription` in notifications, settings `email.subscription {ownerAlerts, reminderDays, reminder{enabled,subject,body}, expired{...}}` (Admin > Emails > Subscriptions). Admin: `components/admin/SubscriptionBox.jsx` on the order screen (dates, +1 month shortcuts, cancel, switch back on) using `PUT /api/admin/orders/[id]` with `subscriptionEdit`. Customer: plan dates and a Renew button on `/account/orders/[number]`.

**Not verified in a real database yet:** duplicate, quick edit, subscription start and the daily check (logic read and plan maths unit tested; build passes).
**Docs:** `docs/GUIDE-V4.2.md`.

## 12l. Version 4.3: free AI blog writer

**AI layer (`lib/ai.js`).** Providers: free `gemini`, `groq`, `openrouter`; optional paid `openai`, `claude`. `aiConfig()` returns `{provider, chain, models, settings}`; `settings.aiwriter.provider` is `auto` (default: free providers that have a key, in order), a single provider (then the other free ones back it up unless `fallback` is false), `chat` (reuse the chat provider), or a paid one. `askAIx()` walks providers and models, retries a 429 once after a short wait, skips a provider on an auth error, skips a model that is missing, fails over on timeouts and cut-off JSON, and throws a readable error (`status 429`, `retryable`) when everything is busy; `askAI()` returns just the text. Gemini 2.5 models run with thinking off. `parseJson()` repairs fences, smart quotes and trailing commas. Keys: GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY. Model lists live in `MODELS` and can be overridden in settings (`geminiModels`, `groqModels`, `openrouterModels`). `lib/chatbot.js` now also supports groq and openrouter for the chat.

**Writer flow.** `POST /api/admin/ai/plan` (SEO plan: title, meta, slug, category, tags, keywords, outline, FAQ, terms, links, CTA), `POST /api/admin/ai/visuals` (summary and 4 to 10 visuals with role featured|inline|infographic|chart|table, prompt, instructions, tool, chartType, data, dataNote), `POST /api/admin/ai/section` (intro, sections, FAQ; each piece goes through `cleanText()` and, with `autoPolish`, one rewrite when `aiScan()` still finds machine patterns), `POST /api/admin/ai/rewrite`, `GET /api/admin/ai/status` (which keys exist). Prompts in `lib/ai-writer.js` (specialist content writer persona, tone guide, Bengali rules). `lib/tones.js` holds `TONES` and `LANGS`. `lib/humanize.js` gained `WRITING_RULES_BN` and `cleanText()`. `components/admin/AiWriter.jsx` retries automatically on free-limit errors with a countdown, runs keyword research and fills primary and secondary keywords when a news item is picked, inserts table visuals into the article, and shows the visual plan in the Images tab.

**Keywords (`lib/keywords.js`).** Free, no key: `suggestFree()` (Google, Bing, DuckDuckGo, YouTube suggestions, ranked by how many engines agree, plus question detection; Bengali uses hl=bn), `relatedWords()` (Datamuse, English), `pickKeywords()` (no-AI pick of primary and secondary), `aiIdeas()` (free AI, 26 s budget so a busy AI never blocks research). `semrushRelated()` is optional and only runs when SEMRUSH_API_KEY is set; nothing is shown about it otherwise. `POST /api/admin/ai/keywords` returns `{free, questions, related, semrush, ai, picked, notes}`.

**Settings.** `aiwriter`: provider (auto default), fallback, autoPolish, model, brandVoice, audience, tone (id from TONES), language (English|Bengali), words, geminiModels, groqModels, openrouterModels, semrushDatabase, feeds.

**Not verified with real services here:** live Gemini, Groq and OpenRouter answers, and the live search-suggestion endpoints (this build environment cannot reach them). The failover logic was tested with simulated provider failures.
**Docs:** `docs/GUIDE-V4.3.md`.

**Keys in the admin (4.3.1).** `lib/secrets.js`: keys GEMINI, GROQ, OPENROUTER, OPENAI, ANTHROPIC, SEMRUSH can be saved in Admin > AI writer > Settings > API keys (`components/admin/AiKeys.jsx`, field type `aiKeys`). Stored in the Setting document `key: 'secrets'` (not in SETTING_KEYS, never returned by the settings API) as AES-256-GCM blobs, key derived from `JWT_SECRET`. `applySecrets()` copies them into `process.env` (cached 60 s, original env values restored when a saved key is removed); it runs in `aiConfig()`, `aiReply()` and `draftReply()`. A saved key wins over the environment. API: `GET/PUT/POST /api/admin/ai/keys` (administrators only; PUT saves or clears, POST sends one tiny test request). If `JWT_SECRET` changes, saved keys read as broken and must be pasted again. Requires MongoDB.

**Live model discovery (4.3.2).** `lib/ai.js` `discover(provider)` reads the live model list (Gemini `v1beta/models`, Groq `/openai/v1/models`, OpenRouter `/api/v1/models` with zero price) and ranks it; the order tried is your custom list, then discovered models, then the built-in backup names (max 6 per provider, cached 30 minutes). Error kinds: auth, quota, busy (503, high demand), model (404, retired), other. Quota and busy retry once after a short wait; three busy or quota answers from one provider skip that provider; error notes now include the provider's own message.

**Article generation resume (4.3.3).** `AiWriter.jsx` `runArticle(plan, images, startPieces)` writes intro, sections and FAQ and can continue after a failure (`continueWriting`, `piecesRef`); generation errors show in a red box above the article tabs (`genErr`) instead of the page top; planning errors scroll to the top. Keyword research questions are sent to the plan prompt (`brief.questions`). `askAIx` errors carry `attempts[]`; the key Test shows them.

**Robust AI answers (4.3.4).** `lib/plan-normalize.js` (`str`, `strList`, `tableText`, `normalizePlan`, `normalizeImages`) turns any shape a free model returns into plain text and lists before it reaches the screen (plan and visuals routes). `scoreContent` coerces terms and secondary keywords to text and returns de-duplicated `missingSecondary` and `missingTerms` (a term that is also a secondary keyword is listed once). Admin lists use index-suffixed React keys.

## 12m. Version 4.4: blog contents list and heading ladder

`components/site/PostToc.jsx` (client): `useActive(items)` recomputes on scroll, resize, hashchange and load (rAF throttled): the active heading is the last one whose top is within `min(170px, 30% of the viewport)` of the top; none before the first heading; the last one at the bottom of the page. `DesktopToc` (sticky, `max-h` with its own scroll that keeps the active item in view) and `MobileToc` (collapsible card above the article showing the current section) are used in `app/(site)/blog/[slug]/page.js`. `lib/markdown.js`: every heading gets a unique id (`slugify`, or `section-N` for non-Latin text, `-2`, `-3` for repeats) and the toc holds depths 2 to 4. `app/globals.css`: `.prose-site` heading ladder (h2 clamp 1.65 to 2.4rem with a top rule and accent, h3 1.35 to 1.75rem, h4 1.18 to 1.4rem, h5 1.08rem, h6 0.98rem muted), `scroll-margin-top` on headings, tables scroll sideways. Case-study pages keep their own `ScrollSpy`.
**Not verified in a real browser here:** the scroll behaviour (no browser available); the selection logic was tested with simulated scroll positions, and the markup and ids were checked in the rendered HTML.
**Docs:** `docs/GUIDE-V4.4.md`.

**Database DNS fallback (4.4.1).** `lib/db.js`: besides pointing `dns` and `dns.promises` at public servers, `dbConnect()` catches SRV/DNS failures (`querySrv`, `ECONNREFUSED`, `ENOTFOUND`, `EAI_AGAIN`...) and uses `srvToStandard(uri)`: DNS over HTTPS (Cloudflare, then Google) for the SRV and TXT records, builds a standard `mongodb://host1,host2,host3/db?authSource=...&replicaSet=...&tls=true` address, caches it in `global._mongoose.direct` and connects. `lib/data.js` logs a repeated database error once per minute. `explainError` now separates DNS blocking from IP allow-list problems. Tested with mocked DNS answers; not against live Atlas here.

## 12n. Version 4.5: SEO scores everywhere, automatic schema, Back to Top, carousel shadows

**SEO score.** `SEO_RES` in `lib/admin-schema.js` maps posts, projects, pages, case-studies and categories to their path and title/description fields. `components/admin/List.jsx` adds an SEO column (client-side `analyzeDoc`, hover shows top fixes, links to `#seo`); `Editor.jsx` shows the score and next fix in the save message (`getSeoTpl()` in `components/admin/seoTpl.js` caches the title template). `SeoOverview.jsx`: "Needs work" (score < 70) filter, "Lowest score first" sort, "Fix:" line per row.

**Schema.** `lib/schema.js` gained `caseNode()` (also used by the case study page) and `faqFromMarkdown()` (FAQ section: an H2 containing "Frequently asked" / FAQ / the Bengali equivalents, then H3 or H4 question headings with their answers); blog posts and pages now build FAQPage from their own content (post falls back to `aiMeta.faq`). `lib/schema-item.js`: `itemGraph(resource, doc, {site, seo, category})` builds the same graph as the public pages for posts, projects, case-studies, pages and categories, `schemaChecks()` (plain-language warnings), `EXPLAIN` (what each node means). `POST /api/admin/schema-preview` (area `seo`) returns graph, parts, checks and, with `rebuild: true`, calls `refreshContent()`. `components/admin/SchemaPanel.jsx` (field type `schemaPanel`, first item of the Schema tab from `seoTabs`) renders it, debounced live from the unsaved form.

**Back to Top.** `components/site/BackToTop.jsx` in `app/(site)/layout.js`: appears after 500 px, progress ring, smooth scroll, placed above the chat bubble (bottom 5.25rem + safe area), `no-print`.

**Carousel shadow.** `CardLayout.jsx` carousel scroll area now has padding (`px-5 pb-11 pt-7 scroll-px-5`) with matching negative margins so shadows and the "Most popular" badge are not clipped by `overflow-x-auto`. `.shell` padding is 1.25rem on phones so the negative margin cannot cause page overflow.

**Verified here:** build, FAQ extraction (English and Bengali headings), `itemGraph` for all five types (tsx), rendered post HTML has Back to Top and BlogPosting + BreadcrumbList. **Not verified in a real browser:** shadow appearance, button animation, admin panels.
**Docs:** `docs/GUIDE-V4.5.md`.

## 12o. Version 4.6: FAQ update, knowledge base, Help center, manual

**FAQ and answers.** `lib/seed-data.js`: the home FAQ gained "Can you fix or redesign my existing WordPress site?" and a payment answer with the 50/50 terms, milestones and all methods (also in taught answers). `knowledgeMore` adds 32 answers in the groups About and working together, Hosting domains and ownership, Speed security and quality, Plans billing and your account (plus more in existing groups); `knowledgeAll = [...knowledge, ...knowledgeMore]` is the no-database fallback. `answerUpdates` and `homeFaqUpdates` describe safe wording updates; `lib/content-updates.js` `applyContentUpdates()` adds missing answers, replaces an answer only while it equals the old starter text, adds the home FAQ question, and adds a Help center footer link. It runs from `runSeed()` (Load starter content) and `scripts/seed.mjs`.

**Help center.** Knowledge model gained `slug`, `showInHelp` (default true) and `body` (Markdown). `lib/help.js` `buildHelp()` makes articles (unique slugs) and topics (the Group names, with an icon). Pages: `/help` (search, topics, popular), `/help/topic/[slug]`, `/help/[slug]` (answer, optional long article, related, FAQPage and breadcrumb schema); `components/site/HelpSearch.jsx` scores question, keywords and answer. `help` is a built-in SEO page, in the sitemap with every topic and article, linked from the footer and the FAQ page.

**Manual.** `docs/manual/` (chapters 01 to 13 by hand) and `docs/manual/reference/` generated by `npx tsx scripts/gen-docs.ts` (content types, settings, routes, pages, env, models, roles, menu, file index).
**Docs:** `docs/GUIDE-V4.6.md`, `docs/manual/README.md`.

**Fix 4.6.1.** `components/admin/List.jsx`: the SEO score memo read `list` before it was declared (a ReferenceError that broke every admin list). It now reads the `items` state. Checked by rendering the list for eight content types on the server, and by scoring every starter item with `analyzeDoc`. Lesson: `next build` does not catch use-before-declaration inside a component; render it once before shipping.
