# 03 Code map

## Folder tree

```
app/                       Next.js App Router
  layout.js                Root layout: fonts, theme script, metadata from settings
  globals.css              Design tokens (CSS variables, dark and light) and shared classes
  (site)/                  PUBLIC pages (share Header, Footer, chat, Back to Top)
    page.js                Home
    portfolio/, case-studies/, blog/, help/, faq/, pricing/, resume/, contact/, apps/
    checkout/, order/, invoice/        Shop pages
    account/               Customer portal ((auth) = sign in, register; (portal) = signed-in pages)
    [slug]/page.js         Custom pages built in Admin > Pages
  admin/                   ADMIN panel (login, then the (panel) group)
  api/                     All server routes (admin, account, orders, payments, cron, health...)
  sitemap.xml/, robots.txt/, llms.txt/, llms-full.txt/, feed.xml/, indexnow-key.txt/   Generated files
  media/[...path]/         Serves locally stored uploads
components/
  site/                    Public UI (Header, Footer, cards, pricing, blog index, forms, chat, JsonLd...)
  admin/                   Admin UI (Fields, Editor, List, Sidebar, AiWriter, SchemaPanel, SubscriptionBox...)
lib/                       All logic: data, models, SEO, AI, email, payments, plans, schema (see below)
  models/index.js          Every Mongoose model
  email/templates.js       Every email layout and template
  payments/                SSLCommerz and PayPal
scripts/                   setup.mjs, seed.mjs, gen-docs.ts, gen_shots.py
public/                    Static files: seed images, CV, uploads
docs/                      This manual, update guides, screenshots, Bengali setup guide
middleware.js              Protects /admin and /api/admin and /account; redirect rules
vercel.json                Region, function limits, the daily cron
```

Every source file with a one-line purpose: [reference/file-index.md](reference/file-index.md).

## The important files in `lib/`

| File | Job |
| --- | --- |
| `admin-schema.js` | Describes every admin list, editor and settings page as data. The single most edited file |
| `seed-data.js` | Starter content and defaults for every settings group |
| `data.js` | Cached, read-only access for public pages, with fallback to seed data |
| `models/index.js` | Database models |
| `blocks.js`, `card-templates.js` | Page section types and card designs |
| `seo.js`, `seo-analysis.js`, `schema.js`, `schema-extra.js`, `schema-item.js` | Meta tags, the 0 to 100 score, schema graphs |
| `ai.js`, `ai-writer.js`, `keywords.js`, `humanize.js`, `tones.js`, `plan-normalize.js` | AI layer, writer prompts, free keyword research, human-sounding clean-up |
| `secrets.js` | Encrypted API keys saved from the admin |
| `plans.js`, `subscriptions.js`, `orders.js`, `coupons.js`, `referrals.js` | Pricing periods, plan lifecycle, orders, discounts, referral rewards |
| `notifications.js`, `mail.js`, `email/templates.js` | Sending email |
| `base-url.js` | The address of the site that is running right now (used in emails) |
| `server-auth.js`, `auth.js`, `roles.js`, `ratelimit.js` | Sign-in, permissions, abuse protection |
| `help.js` | Turns taught answers into Help center articles and topics |
| `content-updates.js` | Safe wording updates for a live database |
| `revalidate.js` | `refreshContent()`: makes public pages show a saved change at once |
| `utils.js`, `markdown.js`, `options.js`, `field-info.js` | Helpers, Markdown with heading ids, option lists, the help text shown beside admin fields |

## Request flows

### A visitor opens a page

1. `middleware.js` runs redirect rules and protects private areas.
2. The page in `app/(site)/...` calls getters from `lib/data.js`. Each getter is cached under the tag `content`.
3. If there is no database or it fails, the getter returns starter content instead.
4. The page renders components and prints one JSON-LD graph through `components/site/JsonLd.jsx`.

### You save something in the admin

1. The form in `components/admin/Editor.jsx` (or a settings page) sends `PUT /api/admin/<resource>/<id>`.
2. `app/api/admin/[resource]/[id]/route.js` checks your role, validates, saves with Mongoose, adds a redirect if a slug changed, and calls `refreshContent()`.
3. The `content` cache tag is refreshed, so the public page shows the change on the next view.

Generic routes cover all lists: `/api/admin/[resource]` (list, create), `/api/admin/[resource]/[id]` (read, save, delete, plus actions `duplicate` and `quick`), `/api/admin/[resource]/bulk`, and `/api/admin/settings/[key]` for settings groups.

### A customer orders

`checkout/[slug]` page, then `POST /api/orders` (price is recomputed on the server, order saved, owner and customer emailed), then the payment step (manual proof page, SSLCommerz or PayPal callbacks in `app/api/payments`), then `markPaid` in `lib/orders.js`, which also starts a monthly or yearly plan and rewards referrals.

### The daily plan check

Vercel Cron calls `GET /api/cron/subscriptions` at 03:00 UTC with `Authorization: Bearer CRON_SECRET`. `runSubscriptionCheck()` sends reminders and marks ended plans.

### AI writing

`AiWriter.jsx` calls `/api/admin/ai/keywords`, `/plan`, `/visuals`, `/section` and `/rewrite`. Each calls `askAIx()` in `lib/ai.js`, which tries the free providers in order and fails over.

## Where do I change...

| I want to change | Look in |
| --- | --- |
| Text on the home page | Admin > Home page (stored in the `home` settings group) |
| A default shown on a fresh install | `lib/seed-data.js` |
| Which fields an admin form has | `lib/admin-schema.js` |
| The look (colours, fonts, spacing) | `app/globals.css`, `tailwind.config.js` |
| A public page layout | `app/(site)/<page>/page.js` and `components/site/` |
| An email design or wording | `lib/email/templates.js` and Admin > Emails |
| Who can open what in the admin | `lib/roles.js` |
| A price calculation | `lib/plans.js` |
| Security headers | `next.config.mjs` |
| The daily schedule | `vercel.json` |

## Conventions

- Plain JavaScript, no TypeScript. Path alias `@/` is the project root.
- Server-only files import `'server-only'`; client components start with `'use client'`.
- Every admin field has a plain-English help text (`info`), covered by `lib/field-info.js`.
- Writing style in the interface and docs: plain English, no long dashes.
- Reads for public pages go through `lib/data.js`, never straight to a model.
- Never call an AI provider directly; use `lib/ai.js`.
