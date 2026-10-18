# Project manual

Everything you need to run, change and fix this website, in one place. Read the chapter you need; every chapter stands alone.

The project is a personal portfolio, blog, service shop and customer portal built with Next.js and MongoDB. Everything on the public site is edited from the admin panel at `/admin`, with no code.

## I want to...

| I want to | Go to |
| --- | --- |
| Install it on my computer or put it online | [02 Setup and deploy](02-setup-and-deploy.md) |
| Understand how the code is organised | [03 Code map](03-code-map.md) |
| Learn the admin menu and what each item does | [04 Admin guide](04-admin-guide.md) |
| Add or edit pages, posts, projects, FAQ, Help center, popups, forms | [05 Content guide](05-content-guide.md) |
| Improve rankings, scores and schema | [06 SEO and schema](06-seo-and-schema.md) |
| Write blog posts with free AI, add AI keys | [07 AI guide](07-ai-guide.md) |
| Sell packages, take payments, run monthly plans | [08 Shop guide](08-shop-guide.md) |
| Change automatic emails or fix email problems | [09 Email guide](09-email-guide.md) |
| Add staff, understand permissions and security | [10 Security and roles](10-security-and-roles.md) |
| Fix an error or do routine care | [11 Maintenance and troubleshooting](11-maintenance-and-troubleshooting.md) |
| Add a field, a section type, a setting or a new page | [12 How to extend](12-how-to-extend.md) |
| See what changed in each version | [13 Change log](13-change-log.md) |
| Look up an exact field, setting, route or variable | [Reference](reference/) (generated from the code) |

## How the manual is built

- Chapters 01 to 13 are written by hand and explain how and why.
- The **reference** folder is generated from the code by `npx tsx scripts/gen-docs.ts` (run it from the project root). It lists every content type and field, every settings page, every route, every environment variable, every model and every source file. Run it again after you change the code, so it stays true.

| Reference file | Contents |
| --- | --- |
| [content-types.md](reference/content-types.md) | Every list in the admin with all its fields |
| [settings.md](reference/settings.md) | Every settings page with all its options |
| [builtin-pages.md](reference/builtin-pages.md) | Built-in pages that have their own SEO settings |
| [admin-menu.md](reference/admin-menu.md) | The left admin menu |
| [pages.md](reference/pages.md) | Every public and admin page address and its file |
| [api.md](reference/api.md) | Every API route, methods and who may call it |
| [roles.md](reference/roles.md) | Roles and permission groups |
| [environment.md](reference/environment.md) | Every environment variable |
| [models.md](reference/models.md) | Database models and their fields |
| [file-index.md](reference/file-index.md) | What each source file is for |

## Golden rules

1. **Content lives in the database, not in the code.** `lib/seed-data.js` is only the starter content. Once the site has saved settings, changing the seed file does not change the live site (use the admin, or the safe update described in chapter 05).
2. **Secrets never go in the database in plain form and never in the code.** Keys go in the environment, or in Admin > AI writer > Settings > API keys, where they are stored encrypted.
3. **After any change to the code:** `npm run build` must pass before you deploy.
4. **Back up** the MongoDB database and the uploaded media before big changes (chapter 11).
