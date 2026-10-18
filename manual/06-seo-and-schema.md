# 06 SEO and schema

## Where SEO lives

| Place | What it controls |
| --- | --- |
| The **SEO** tab of every page, post, project, case study and category | That item's focus keyword, meta title and description, social card, schema and code |
| **SEO overview** (Admin > SEO) | One table of every page with its score and problems |
| **SEO settings** (Admin > SEO) | Whole-site rules: business and local schema, sitemap, robots, AI visibility, fast indexing, defaults |
| **Built-in pages** (home, portfolio, blog, resume, pricing, contact, products, FAQ, Help center, case studies) | Each has its own SEO settings at `/admin/settings/seo-<key>` |

## The SEO tab

- **Focus keyword**: the phrase you want the page to rank for. Use one phrase per page; two pages with the same one compete.
- **Related keywords**: secondary phrases; they also go into the schema as keywords.
- **Meta title** (about 50 to 60 characters) and **Meta description** (about 120 to 160). Empty uses the title and the short description. A custom title is used exactly as typed.
- **Social** tab: title, description and image for Facebook, LinkedIn, WhatsApp and X, and the card type.
- **Code** tab: custom CSS and head or body code for that page only.
- A live **Google preview** shows the result as it will look.

## The score (0 to 100)

A Rank Math style checklist grades the page against its focus keyword: keyword in title, description, URL, intro and headings; content length; headings; images and alt text; links; readability; indexing and schema. 80 and above is good, 60 to 79 needs work, below 60 needs fixing. It is a guide, not a promise; write for people first.

You see the score in four places:

1. The checklist in the SEO tab (live while you type).
2. The **SEO column** in each list.
3. The save message ("Saved. SEO score 82/100. Next: ...").
4. The **SEO overview**: filter **Needs work** (below 70), sort **Lowest score first**, and read the "Fix:" line under each page. The same table shows keyword duplicates, missing descriptions, noindex pages, schema and sitemap status.

## Schema (structured data)

Schema is a block of code that tells Google exactly what a page is. You never have to write it: every page gets the right schema automatically when it is shown, built from the current content, so it updates itself after every edit.

| Content | Schema |
| --- | --- |
| Blog post | BlogPosting, BreadcrumbList, FAQPage (when the post has a FAQ section) |
| Project | CreativeWork, BreadcrumbList |
| Case study | Article, BreadcrumbList |
| Custom page | WebPage, BreadcrumbList, FAQPage (FAQ blocks and FAQ sections) |
| Category | BreadcrumbList |
| FAQ and Help center | FAQPage and CollectionPage |
| Every page | Person, ProfessionalService (your business) and WebSite |

### The Schema tab

Open an item > SEO > **Schema**. The **Schema on this page** panel shows each part with a plain explanation, simple checks (missing image, description, publish date, FAQ), the JSON-LD code with **Copy**, a **Test in Google** link and **Rebuild schema**. Rebuild recalculates from the current form (even unsaved) and refreshes the live page. It updates itself about a second after you stop typing.

Below the panel, **Schema type** lets you choose a specific type (Service, Product, SoftwareApplication, Event, HowTo, Course, VideoObject, FAQPage, LocalBusiness, Article, WebPage...) with the extra fields each type needs (price, rating, dates, steps...). Automatic is right for most pages.

### FAQ schema from your own text

Add a heading **Frequently asked questions** (or FAQ), then a `###` question with its answer under each. The schema reads the page itself, so editing the answers updates it. Posts written with the AI writer already include this section.

### Rules

- Only describe what is really on the page. Fake ratings or hidden FAQs can be penalised.
- Test with Google Rich Results Test (search.google.com/test/rich-results) and validator.schema.org.
- Rich results appear days or weeks after Google re-crawls. Submit the URL in Search Console to speed it up.

## Site-wide SEO settings

| Area | What it does |
| --- | --- |
| Business and local | Name, address, hours, area served, ratings: feeds the ProfessionalService node |
| Sitemap | `/sitemap.xml`, built from the database on request; honours each page's noindex and exclusions |
| Robots | `/robots.txt`; staging mode hides the whole site (turn it off when you go live) |
| AI visibility | `/llms.txt` and `/llms-full.txt` summarise the site for AI assistants |
| Fast indexing | Pings IndexNow after publishing; the key file is `/indexnow-key.txt` |
| Defaults | Title template, default share image, category indexing |
| Redirects | Marketing > Redirects and the 404 log keep old links alive |

## SEO routine

- Weekly: open SEO overview, press Needs work, fix the top three pages.
- After publishing: check the score message and the Schema panel.
- Monthly: look at Search Console (queries, pages, coverage), fix the 404 log, update thin posts.
- Never change a live slug without a redirect (the admin adds it automatically when you edit the slug in the editor or Quick edit).
