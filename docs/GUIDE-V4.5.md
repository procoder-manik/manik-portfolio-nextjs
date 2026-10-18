# Update guide: version 4.5 (SEO scores, automatic schema, Back to Top, card shadows)

## 1. SEO score for every page, post, project and case study

You now see the SEO score (0 to 100) in three places:

1. **In every list.** Admin > Posts, Pages, Portfolio, Case studies and Categories have an **SEO** column. Green is 80 and above, amber 60 to 79, red below 60. Hover a score to see the top things to improve; click it to open the SEO tab of that item.
2. **Right after you save or publish.** The saved message now says, for example: *Saved. SEO score 82/100. Next: add a focus keyword.* It stays for a few seconds.
3. **In the editor.** The SEO tab keeps its full checklist (the same score, graded live while you type).

### Dashboard of low scores

Admin > **SEO overview** lists every page with its score. New:

- **Needs work** card: pages below 70. Click it to show only those. Click again to clear.
- **Lowest score first** button: sorts the table so the weakest pages come first.
- Under each page title, a short line starting with **Fix:** shows the first things to change.
- **Edit SEO** opens that page straight on its SEO tab.

The score is a guide, not a promise. Writing for people first matters more than a perfect 100.

## 2. Automatic schema, and Rebuild schema

Schema (structured data) is a small block of code that tells Google exactly what a page is. You do not have to write it. Every page, post, project, case study and category gets the right schema **automatically** when it is shown, built from its current content, so it **updates itself every time you edit**.

Where to look: open an item, tab **SEO**, sub-tab **Schema**. At the top is the new **Schema on this page** panel:

- A list of the schema parts on this page, each with a one-line plain explanation (for example *BlogPosting: tells Google this page is a blog article*).
- **Checks** in plain words: missing image, missing description, no publish date yet, no FAQ schema.
- **Show the JSON-LD code**, **Copy**, and **Test in Google** (opens Google's Rich Results Test).
- **Rebuild schema:** recalculates the schema from the current content (including unsaved edits) and refreshes the live page so it prints the new schema right away.
- It updates by itself about a second after you stop typing.

### What is added automatically

| Content | Schema |
| --- | --- |
| Blog post | BlogPosting + BreadcrumbList + **FAQPage** (when the post has a FAQ section) |
| Project | CreativeWork + BreadcrumbList |
| Case study | Article + BreadcrumbList |
| Page | WebPage + BreadcrumbList + FAQPage (from FAQ sections and FAQ blocks) |
| Category | BreadcrumbList |
| All pages | Person (you), ProfessionalService (your business), WebSite |

**FAQ schema from your own text:** in a post or page, add a heading **Frequently asked questions** (or FAQ), then one question heading (### Question) with its answer under each. Google can then show the questions under your result. Because it is read from the page, editing the answers updates the schema. Posts written with the AI writer already have this section.

### Choosing a specific type

If a page is something special (a service you sell, a product, an event, a how-to), pick it in **Schema type** below the panel. Automatic stays the default and is right for most pages.

## 3. Schema in five minutes (for learning)

- **Schema.org** is the shared vocabulary. **JSON-LD** is the format: a script block in the page head that people do not see.
- It does not change how the page looks. It helps Google understand the page and can unlock **rich results** (FAQ dropdowns, breadcrumbs, article cards, prices, ratings).
- Never add things that are not on the page (fake ratings, fake FAQs). Google can ignore or penalise that.
- Test: Rich Results Test (search.google.com/test/rich-results) and the Schema Markup Validator (validator.schema.org). Paste the page URL or the code.
- Results appear days or weeks after Google re-crawls the page. Submitting the URL in Search Console speeds it up.

## 4. Back to Top button

Every public page now has a round **Back to Top** button at the bottom right. It appears after you scroll down, shows a ring that fills as you read, and scrolls smoothly to the top. It sits above the chat bubble so they never overlap, respects phone safe areas and reduced-motion settings, and is hidden when printing.

## 5. Card shadows in carousels

In carousel mode the scroll area used to clip the card shadows and the "Most popular" badge. The carousel now leaves room around the cards so shadows and badges draw fully, and the layout and spacing stay as before. Grid mode is unchanged.

## Quick test

- [ ] Open Admin > Posts: an SEO column with coloured scores. Hover one.
- [ ] Edit a post and press Save: the message shows the SEO score and the next thing to fix.
- [ ] Open SEO overview: click **Needs work** and **Lowest score first**.
- [ ] Open a post > SEO > Schema: see the parts, the checks, and press **Rebuild schema**.
- [ ] Add a "Frequently asked questions" section with ### questions to a post: the panel shows FAQPage with the number of questions.
- [ ] On the live site scroll down: the Back to Top button appears; click it.
- [ ] Set Pricing to Carousel: the shadow of the popular card and its badge are not cut off.
