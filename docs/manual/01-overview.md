# 01 Overview

## What it is

A complete small-business website platform for Manik Hossain (web designer, WordPress expert and SEO specialist, Bangladesh). It is one project that provides:

- A **public site**: home, portfolio, case studies, blog, resume, pricing, checkout, FAQ, Help center, contact, custom pages, products.
- A **customer portal** (`/account`): orders, invoices, messages, referrals, profile.
- A **shop**: services and packages, checkout with local and international payments, orders, coupons, referrals, monthly and yearly plans.
- An **admin panel** (`/admin`) where every piece of content and every setting is edited without code.
- **SEO tooling**: per-page SEO tab, 0 to 100 scores, automatic schema, sitemap, redirects, indexing pings.
- **AI tooling**: a free-AI blog writer with keyword research, a chatbot with taught answers, AI email replies.

## Technology

| Part | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router), plain JavaScript |
| UI | React 18, Tailwind CSS 3, Framer Motion, Lucide icons |
| Database | MongoDB (Atlas) through Mongoose |
| Auth | Signed cookie (jose JWT), bcrypt password hashes |
| Media | Cloudinary on Vercel (disk is read-only there), local disk on a VPS |
| Email | Resend or any SMTP server |
| Payments | bKash, Nagad, Rocket and bank (manual proof), cards through SSLCommerz, PayPal, Payoneer |
| AI | Gemini, Groq, OpenRouter (free); ChatGPT and Claude (optional, paid) |
| Hosting | Vercel (region Singapore) + MongoDB Atlas; a VPS also works |

## Five ideas that explain the whole project

1. **Schema-driven admin.** The admin forms are not hand-built. `lib/admin-schema.js` describes each content type and settings page as data (fields, labels, types, help text). The generic list and editor components draw every screen from it. Adding a field means adding one line there.
2. **Settings are merged, not replaced.** Each settings group is one document. When the site reads it, the saved values are merged on top of the defaults in `lib/seed-data.js`. New options therefore appear on their own after an update, and nothing saved is lost.
3. **Everything public is cached and tagged `content`.** Admin saves call `refreshContent()`, which refreshes the tag, so pages update the moment you save. Reads also fall back to the starter content when there is no database, so the site never shows an empty page.
4. **One place for AI.** `lib/ai.js` talks to every AI provider and handles failover. Keys are read from the environment or from encrypted storage; features never read keys directly.
5. **One JSON-LD graph per page.** Every public page prints a single combined schema graph (you, your business, the website, breadcrumbs and the page itself). The admin previews the same graph.

## Public site map

| Area | Addresses |
| --- | --- |
| Home | `/` (sections: hero, about, services, work, case studies, products, process, resume, pricing, testimonials, blog, FAQ, contact) |
| Portfolio | `/portfolio`, `/portfolio/:slug` |
| Case studies | `/case-studies`, `/case-studies/:slug` (switch on in Site and contact > Features) |
| Blog | `/blog`, `/blog/:slug`, `/blog/category/:slug` |
| Shop | `/pricing`, `/checkout/:package`, `/order/:number?t=token`, `/invoice/:number` |
| Help and answers | `/faq`, `/help`, `/help/:slug`, `/help/topic/:slug` |
| Other | `/resume`, `/contact`, `/apps`, custom pages at `/:slug`, `/sitemap.xml`, `/robots.txt`, `/llms.txt` |
| Customer | `/account` and everything below it |

The exact, complete list is in [reference/pages.md](reference/pages.md).

## Feature switches

Some features can be turned on or off in **Admin > Site and contact > Features**: case studies, customer accounts and the trash retention period. Home page sections are switched in **Home page > Visible sections**.

## Glossary

| Word | Meaning here |
| --- | --- |
| Resource | A list in the admin with an editor, such as posts, pages or packages |
| Settings group | A single settings document, such as `site`, `home` or `email` |
| Block | A section of a custom page (hero, cards, pricing, FAQ...) |
| Taught answer | A question and answer in the knowledge base. It feeds the chatbot, the FAQ page and the Help center |
| Slug | The last part of an address (`/blog/my-post` has the slug `my-post`) |
| Schema | Structured data (JSON-LD) that tells search engines what a page is |
| Seed | The starter content shipped in `lib/seed-data.js` and loaded by `npm run seed` or the admin button |
| Area | A permission group (blog, content, shop, seo...) that roles are given |
