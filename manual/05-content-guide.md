# 05 Content guide

## Pages and sections (blocks)

**Admin > Pages** builds custom pages (Privacy policy, a landing page, anything) at `/your-slug`. A page is a stack of **blocks**; add, reorder, hide or duplicate them. Each block has its own settings and an on-off eye.

| Block | Use it for |
| --- | --- |
| Hero | Big opening headline with buttons |
| Text | Rich text (Markdown) |
| Image and text | A picture beside copy |
| Cards | Services, features, steps, quotes, prices in any card design |
| Timeline, Steps, Feature grid, Numbers | Process, benefits, statistics |
| Portfolio, Blog posts, Case studies, Products | Live lists pulled from your content |
| Pricing | Your packages, all services as tabs or one service |
| Testimonials, Logo strip, Gallery, Video | Proof and media |
| FAQ | Questions and answers (the block can use the site FAQ or its own list) |
| Call to action | A banner with a button |
| Contact form, Form (form builder) | Capture leads |
| Spacer, Custom HTML | Spacing and your own code |

Posts can have **Sections after the article** (call to action, pricing, FAQ, custom HTML...) shown under the post and above "Keep reading".

### Cards: grid or carousel

Every card section can show as a **grid** or a **carousel**, with 2 to 4 cards per row, optional **auto slide** and the seconds between slides. Where to set it:

| Section | Where |
| --- | --- |
| Pricing, Work, Testimonials on the home page | Site > Home page > Card layouts |
| Services, Process on the home page | Their own boxes in Home page |
| Any page section | Edit the section in Admin > Pages |

Card designs: Service card, Numbered step, Image card, Big number, Testimonial, Compact row, Glow card, Editorial, Price card, and My own HTML.

## Blog

- **Blog posts** are articles or short updates. Set the category, cover image, tags and excerpt. Use headings (H2, H3, H4); the reading page builds a **table of contents** that follows your scrolling, and a clear heading size ladder.
- A **Frequently asked questions** section (a heading, then a `###` question and its answer under each) becomes FAQ schema automatically.
- **Categories** group posts and each has its own page.
- Write posts faster with the AI writer (chapter 07).

## Portfolio and case studies

- **Portfolio** projects show a hover-scroll screenshot card and a full page. Add a tall screenshot (`scrollImage`) for the signature effect.
- **Case studies** tell the problem, approach and results. Switch the feature on in Site and contact > Features.
- **Products** are your own apps, shown at `/apps`, on the home page and in the footer.

## Media

**Admin > Media** lists everything uploaded. Any image field offers **Choose from library**. On Vercel, files go to Cloudinary; on a VPS they are saved on disk and served from `/media`.

## Forms, popups, announcement bar, redirects

- **Forms:** drag-and-drop form builder. Use a form on any page or in a popup. Answers land in **Form answers** (search, star, spam, CSV export, survey charts).
- **Popups:** ready templates (offers, newsletters, exit intent and more). Choose when they show (load, scroll, exit, click), on which pages and for whom. Global rules are in Site > Popup rules.
- **Announcement bar:** a slim bar above the header with message, colours, countdown and dates.
- **Redirects:** send an old address to a new one. Slug changes create redirects for you. The **404 log** shows missing addresses people tried; turn the busiest into redirects.

## Navigation

**Site > Header and footer** edits the top menu, the header button and the footer columns, and can list custom pages and products in the footer.

## FAQ, knowledge base and Help center

One list of **taught answers** powers four things.

| Where it appears | What controls it |
| --- | --- |
| The chatbot (it answers visitors) | **Chatbot uses this answer** switch |
| The FAQ page `/faq` and its FAQ schema | **Show on the FAQ page** switch |
| The Help center `/help` (search, topics, one page per question) | **Show in the Help center** switch |
| The question on the home page FAQ section | Separate: Site > Home page > FAQ |

Manage them in **AI > Taught answers** (the list and editor) and **AI > AI IQ** (generate many answers with AI or from a web page, see what visitors asked that the bot could not answer, and test the bot).

Each answer has:

- **Question** and **Answer** (keep it under about 120 words; be specific about prices, timelines and what is included).
- **Group**: this is the **topic** in the Help center and the section on the FAQ page. Use a service name or a theme such as Plans, billing and your account.
- **Other ways people ask this**: keywords that help the bot and the Help center search match different wording.
- **Longer article (optional)**: Markdown shown under the short answer on the Help center page only.
- **Help center address**: the last part of the link; empty means it is made from the question.
- **Sort order** inside the group.

### The Help center

- `/help`: search box (matches words in the question, keywords and answer), topic cards, popular questions.
- `/help/topic/:topic`: all answers of one topic.
- `/help/:slug`: one answer with related questions, breadcrumbs and FAQ schema.
- It is in the sitemap and has its own SEO settings (Admin > SEO settings > Help center). A "Help center" link is in the footer.
- Topics are simply the Group names, so adding an answer with a new Group creates a new topic.

### Starter answers and safe updates

The starter knowledge base ships in `lib/seed-data.js` (`knowledge` and `knowledgeMore`). On a live site the seed only adds missing answers (matched by question). Wording changes to existing answers are listed in `answerUpdates` and `homeFaqUpdates` and are applied only while the stored text still equals the old starter text, so your edits are never overwritten. Run it from the dashboard (**Load starter content**) or `npm run seed`. The result reports anything it kept because you had edited it.

### Writing good answers

1. One question per answer, written the way a visitor would ask it.
2. Lead with the direct answer, then the detail.
3. Use real numbers and facts you stand behind; do not promise what you do not do.
4. Add 3 to 6 keywords that people really type.
5. Check **AI IQ > Questions the bot could not answer** every week and turn the best ones into answers.
