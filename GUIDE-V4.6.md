# Update guide: version 4.6 (FAQ, knowledge base, Help center, manual)

## 1. FAQ updated from your older site

Your older static site (the uploaded `_portfolio.zip`) had seven FAQ questions. Six were already in the new site. This update:

- **Adds** "Can you fix or redesign my existing WordPress site?" to the home page FAQ and to the knowledge base.
- **Updates the payment answer** ("How can I pay?") with the payment terms from the older site: 50% to start and 50% on approval before launch, larger projects split into milestones, plus every payment method (bKash, Nagad, Rocket, bank transfer, card, PayPal, Payoneer, Wise, and Fiverr or Upwork for platform protection).

### Apply it to your live site

Seed files only affect a new install, so for your live site do this once:

1. Deploy the new version.
2. Sign in to the admin and press **Load starter content** on the dashboard (or run `npm run seed` on your computer).
3. It adds the missing answers and the new home FAQ question, and updates the two payment answers **only if you have not edited them**. It lists anything it kept. If you did edit them, copy the new wording from `lib/seed-data.js` by hand.

## 2. Bigger knowledge base

32 new answers (plus the WordPress one) in these groups (the group name is the topic in the Help center):

| Group | Examples |
| --- | --- |
| About and working together | Who you are, time zones, reply speed, contact, free consultation, examples of work, working directly with you, what to prepare |
| Website design and development | Platforms, what is in each package, custom apps, content writing, ownership |
| Hosting, domains and ownership | Hosting and domain, migration, keeping URLs |
| SEO services | Audit vs local vs retainer, cancelling, analytics, schema, reports |
| Speed, security and quality | Speed, security, accessibility |
| Plans, billing and your account | Monthly or yearly, what happens when a plan ends, orders and invoices, coupons, currency |
| Automation and CRM | Tools, CRM setup |

Everything is plain facts taken from your packages, process and site details. Nothing about refunds or revisions was invented. If you have policies for those, add them in **AI > Taught answers**.

## 3. Public Help center

- `/help`: search (matches the question, keywords and answer), topic cards, popular questions.
- `/help/topic/<topic>`: all answers of a topic.
- `/help/<question>`: one answer with related questions and a call to ask you directly.
- A **Help center** link was added to the footer; the FAQ page links to it too.
- It has its own SEO settings (`/admin/settings/seo-help`), schema and sitemap entries.
- Each answer in **Taught answers** has new options: **Show in the Help center**, **Help center address** and **Longer article (optional)**.

## 4. Project manual

`docs/manual/README.md` is the start. Chapters:

01 Overview, 02 Setup and deploy, 03 Code map, 04 Admin guide, 05 Content guide, 06 SEO and schema, 07 AI guide, 08 Shop guide, 09 Email guide, 10 Security and roles, 11 Maintenance and troubleshooting, 12 How to extend, 13 Change log.

The `reference` folder is generated from the code (every field, setting, route, variable, model, file). After you change the code, run `npx tsx scripts/gen-docs.ts` from the project root to refresh it.

## Quick test

- [ ] Dashboard > Load starter content: the report shows answers added and updated.
- [ ] Home page FAQ shows seven questions including the WordPress one; the payment answer mentions 50%.
- [ ] `/faq` shows the new groups; `/help` loads, search works ("pay", "wordpress", "monthly").
- [ ] Open a Help center question: related questions and the contact button show.
- [ ] Footer has a Help center link.
- [ ] Admin > Taught answers: open one, switch **Show in the Help center** off, save: it disappears from `/help`.
- [ ] Open `docs/manual/README.md` and follow one link from each table.
