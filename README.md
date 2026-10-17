<div align="center">

# Manik Hossain · Portfolio, Blog and Service Shop

A fast, SEO-ready personal site with its own admin panel. Show your work with hover-scrolling screenshots, publish articles and daily updates, keep a live resume, and sell service packages with Bangladeshi and international payments.

![Next.js](https://img.shields.io/badge/Next.js-15.5-000?logo=nextdotjs)
![React](https://img.shields.io/badge/React-18-149ECA?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-47A248?logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel)

<img src="docs/screenshots/home.jpg" alt="Home page" width="900" />

</div>

---

## Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Deploy to Vercel](#deploy-to-vercel)
- [Using the admin panel](#using-the-admin-panel)
- [Payments](#payments)
- [Project structure](#project-structure)
- [Customising](#customising)
- [Troubleshooting](#troubleshooting)

## Features

**Public site**

- One-page home with smooth-scrolling sections: About, Services, Work, Process, Resume, Pricing, Testimonials, Blog, FAQ.
- Portfolio cards in browser frames. Hover (or tap) and the full-page screenshot scrolls slowly, top to bottom or bottom to top, at the same pace for short and long pages.
- Each card shows the CMS (WordPress, Shopify, Webflow, Wix, Squarespace, Duda and more) or "Custom code" plus the languages used and the project duration.
- Portfolio archive with filters by platform and technology, plus search.
- Project pages with a large scroll preview, video walkthrough (YouTube, Vimeo, Loom, uploaded file or any embed), story, deliverables, results, dates and gallery.
- Blog with categories, a featured post, a "Daily updates" stream, reading progress, table of contents, share links and related posts.
- Printable resume page with PDF download.
- Pricing page with services and packages, checkout, and a private order-status page.
- Contact form that saves to the database and can email you.
- Dark and light themes, fully responsive, keyboard accessible, respects reduced motion.

**Admin panel (`/admin`)**

- Add, edit and delete projects, posts, categories, pages, services and packages.
- Media library with drag-and-drop upload for images, PDFs and videos.
- Markdown editor with toolbar, image upload and live preview.
- Edit every home page section, the resume, contact details, social links and payment accounts. Turn any home section on or off.
- Orders with payment verification, status history and private notes.
- Inbox for contact messages.
- One-click "Load starter content" on an empty database.

**Case studies (switchable)**

- Full case-study system: client, industry, duration, platform, services, challenges, step-by-step approach, before/after results, client quote, gallery and extra sections.
- Archive at `/case-studies`, a detail page with a sticky "On this page" guide and an "At a glance" results band, and a home section with a large featured card.
- One switch in **Site and contact > Features** turns the whole feature on or off: pages, home section, header menu, footer link and sitemap all follow it. Case studies stay saved while it is off.

**Communication and sales**

- Branded HTML emails that match the site: automatic thank-you to every contact-form and chat lead, order emails (received, payment confirmed, work started, delivered, cancelled), invoices and free-form replies. Every subject and message is editable in **Settings > Emails**, with live previews.
- Printable invoices at `/invoice/<number>` with one-click "Email invoice" from the order screen.
- Built-in chat assistant that answers from your FAQ, packages and contact details (free rule-based answers by default, or AI answers from Google Gemini, ChatGPT or Claude, chosen in the admin), collects leads and hands over to WhatsApp. Or paste a third-party chat (Tawk, Crisp, Tidio).
- CRM: contacts are created from messages, chats and orders automatically. Pipeline board (New, Contacted, Proposal, Won, Lost) with drag and drop, deal values, notes, tags and email.

**Customer accounts**

- Buyers create a free account at `/account` and see every order in one place: what is awaiting payment, what is in progress (with a progress bar and expected delivery), and what is delivered.
- Each order has a timeline of project updates you post from the admin, a list of files and links (staging site, design files, handover docs), the invoice and a message box.
- Orders placed while signed in are saved automatically; older orders appear once the customer confirms their email, or by pasting the order link.
- Messages from the account land in Admin > Messages, and your replies show up in their account. Password reset by email, account lockout, and a switch in **Site and contact > Features** to turn the whole feature off.

**Coupons, referrals and affiliates**

- Coupon codes from the admin: percentage or fixed amount, limits per code and per customer, first order only, specific packages, start and end dates. Customers apply them at checkout.
- Referral program: every customer gets a link. When a friend orders and pays, the customer gets store credit (a percentage you set) or a personal coupon copied from one you choose, to use on the next order. Invited friends can get their own coupon filled in automatically.
- Affiliate program: customers apply from their account (approve by hand or automatically), share their link and earn a commission on paid orders. Earnings are held for a set number of days, then they request a payout and you mark it paid. Each program has its own on and off switch.
- Customers can upload a profile photo.

**Motion**

- Headlines rise word by word, sections and cards reveal in sequence as you scroll, a soft spotlight follows the cursor over cards, main buttons lean toward the cursor, hero glows drift with the scroll, a thin progress line tracks reading, and the header tucks away while you scroll down. Everything switches off for visitors who prefer reduced motion.

**Help everywhere**

- Every admin setting has an (i) icon that explains what it does, with examples, and every admin section explains itself next to its title. Customers get the same help in their account and at checkout.

**Page builder**

- 19 ready-made sections (Hero, Text, Image and text, Feature grid, Numbers, Steps, Portfolio, Blog, Pricing, Products, Testimonials, Logos, Gallery, Video, FAQ, Call to action, Contact form, Spacer, Custom HTML). Add, reorder, duplicate and hide sections on any page or under any post.
- Header menu, header button and footer columns are edited in **Header and footer**. Pages can be linked from the header or footer with a switch.
- **Products**: list your SaaS apps (Live, Beta, Coming soon); they appear in a home section, at `/apps` and in the footer.

**SEO**

- One combined JSON-LD `@graph` per page (Person, ProfessionalService, WebSite, BreadcrumbList, CreativeWork, BlogPosting, FAQPage, OfferCatalog).
- Dynamic `sitemap.xml` and `robots.txt`, canonical URLs, Open Graph and Twitter cards.
- Server-rendered pages, so search engines see real content.
- **SEO and integrations** settings: title template, keywords, noindex switch, Google Search Console and Bing verification, GA4, Google Tag Manager, Google Ads (with purchase conversion), Meta Pixel, Microsoft Clarity, and custom code for head, body start and footer. Each one has its own on/off switch.

**Security and speed**

- Login rate limiting and account lockout after 5 wrong passwords; rate limits on contact, chat, checkout and payment proof; honeypot spam trap.
- HSTS, CSP (frame-ancestors, base-uri, form-action), COOP and no-store on admin and API.
- Public pages are cached and refreshed instantly when you save in the admin; portfolio and blog pages are pre-rendered.

## Screenshots

| Portfolio cards (hover scroll) | Project page |
| --- | --- |
| <img src="docs/screenshots/portfolio-cards.jpg" width="440" /> | <img src="docs/screenshots/project.jpg" width="440" /> |
| **Pricing** | **Blog** |
| <img src="docs/screenshots/pricing.jpg" width="440" /> | <img src="docs/screenshots/blog.jpg" width="440" /> |
| **Branded emails** | **Resume** |
| <img src="docs/screenshots/email.jpg" width="440" /> | <img src="docs/screenshots/resume.jpg" width="440" /> |
| **Page builder** | **Chat and footer** |
| <img src="docs/screenshots/page-builder.jpg" width="440" /> | <img src="docs/screenshots/chat-footer.jpg" width="440" /> |
| **CRM** | |
| <img src="docs/screenshots/crm.jpg" width="440" /> | |
| **Admin editor** | **Mobile, light theme** |
| <img src="docs/screenshots/admin.jpg" width="440" /> | <img src="docs/screenshots/mobile-light.jpg" width="200" /> |

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15.5 (App Router, server components, route handlers) |
| Database | MongoDB with Mongoose |
| Styling | Tailwind CSS with CSS variables for themes |
| Motion | Framer Motion |
| Auth | Signed JWT in an httpOnly cookie (jose), bcrypt passwords |
| Content | Markdown (marked) |
| Uploads | Cloudinary (direct browser upload) or local disk |
| Payments | SSLCommerz, PayPal REST, manual verification for wallets and bank |

## Quick start

Requirements: Node.js 20 or newer and a MongoDB database (free MongoDB Atlas works).

```bash
git clone https://github.com/<your-username>/manik-portfolio-nextjs.git
cd manik-portfolio-nextjs
npm install
npm run setup                   # creates .env.local with a secret and an admin password (printed once)
npm run dev                     # works right away in preview mode
# later: add MONGODB_URI to .env.local, then
npm run seed                    # load your starter content into MongoDB
```

Open <http://localhost:3000> for the site and <http://localhost:3000/admin> for the admin. Sign in with `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

> Without `MONGODB_URI` the site still runs in read-only preview mode using the starter content.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run setup` | Create `.env.local` with a random secret and admin password |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run seed` | Add starter content (never overwrites existing items) |
| `npm run seed:fresh` | Wipe the content collections and reload the starter content |

## Environment variables

Copy `.env.example` and fill in the values. On Vercel, add the same keys under **Settings > Environment Variables**.

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string, including a database name |
| `MONGODB_DNS` | No | DNS servers for the Atlas SRV lookup (default 8.8.8.8,1.1.1.1). Set `off` to use the system DNS. |
| `JWT_SECRET` | Yes | Long random string used to sign admin sessions |
| `ADMIN_EMAIL` | Yes | Email for the first admin login |
| `ADMIN_PASSWORD` | Yes | Password for the first admin login (change it later in Admin > Account) |
| `NEXT_PUBLIC_SITE_URL` | Yes | Live URL without a trailing slash, for example `https://manikhossain.in` |
| `CLOUDINARY_CLOUD_NAME` | On Vercel | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | On Vercel | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | On Vercel | Cloudinary API secret |
| `RESEND_API_KEY`, `MAIL_FROM` | For emails | Sends all customer and owner emails through Resend (recommended) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | For emails | Alternative to Resend |
| `NOTIFY_EMAIL` | No | Where new order and message alerts go |
| `GEMINI_API_KEY` / `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | No | AI answers in the built-in chat. Pick Gemini, ChatGPT or Claude in **SEO and integrations > Chat**; only that provider's key is needed. Gemini has a free tier. |
| `SSLCZ_STORE_ID`, `SSLCZ_STORE_PASSWORD`, `SSLCZ_SANDBOX` | No | Automatic card, bKash, Nagad and Rocket payments through SSLCommerz |
| `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_SANDBOX` | No | Automatic PayPal checkout |

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

## Deploy to Vercel

The repository already includes `vercel.json` (Singapore region, longer timeouts for payment routes), security headers in `next.config.mjs`, `.nvmrc` and the `engines` field.

1. **MongoDB Atlas**
   - Create a free M0 cluster, ideally in **AWS Singapore (ap-southeast-1)** to sit next to the Vercel `sin1` region.
   - Database Access: add a user. Network Access: add `0.0.0.0/0` (Vercel uses changing IPs).
   - Copy the connection string and add the database name: `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/manik-portfolio?retryWrites=true&w=majority`.
2. **Cloudinary** (required on Vercel because the server disk is read-only)
   - Create a free account and copy the cloud name, API key and API secret from the dashboard.
   - To serve the CV PDF from Cloudinary, enable **Settings > Security > Allow delivery of PDF and ZIP files**.
3. **Push to GitHub**
   ```bash
   git init && git add . && git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/manik-portfolio-nextjs.git
   git push -u origin main
   ```
4. **Import on Vercel**: New Project > import the repository. The framework is detected as Next.js; keep the defaults.
5. **Environment variables**: add every value from the table above, then click **Deploy**.
6. **Load content**: open `https://<your-project>.vercel.app/admin`, sign in, and click **Load starter content** on the dashboard.
7. **Domain**: Settings > Domains > add `manikhossain.in`, update DNS at your registrar as Vercel shows, then set `NEXT_PUBLIC_SITE_URL` to the domain and redeploy.
8. **Payment callbacks**: if you use SSLCommerz or PayPal, the callback URLs are built from `NEXT_PUBLIC_SITE_URL` automatically. Test in sandbox first, then set `SSLCZ_SANDBOX` and `PAYPAL_SANDBOX` to `false`.

> Vercel limits request bodies to 4.5 MB. Uploads go straight from the browser to Cloudinary, so large screenshots and videos are not affected. The Cloudinary free plan accepts videos up to 100 MB.

### Deploying on a VPS or cPanel instead

```bash
npm install
npm run build
npm start              # or: pm2 start npm --name portfolio -- start
```

Without Cloudinary, uploads are stored in `storage/uploads` and served from `/media/...`. Back up that folder.

## Using the admin panel

### Add a portfolio project

Admin > Portfolio > **Add project**. The form has tabs:

| Tab | What to enter |
| --- | --- |
| Project | Name, slug, website address, client, industry, short card description |
| Images | Full-page screenshot (one tall image), scroll direction, banner image, gallery, accent colour |
| How it was built | CMS or custom code, which CMS, languages and tools, work type |
| Timeline | Start date, end date, duration (calculated from dates if left empty) |
| What I did | Project story in Markdown, deliverables, result numbers |
| Video walkthrough | YouTube, Vimeo, Loom, other embed link, or an uploaded file |
| Publishing | Published, show on homepage, sort order |
| Search appearance | Custom SEO title and description |

**Full-page screenshot tip:** in Chrome open DevTools, press `Ctrl+Shift+P` (`Cmd+Shift+P` on Mac), type "Capture full size screenshot". Save as WebP or JPG at about 1440 px wide.

### Blog posts and daily updates

Admin > Blog posts > **Add post**. Pick **Article** for long write-ups or **Daily update** for short notes; updates show in the "Daily updates" stream on the home page and blog.

### Services and packages

- **Services** are the groups on the pricing page.
- **Packages** belong to a service: price, optional "up to" price for a range, billing (one time, monthly, yearly, hourly), features, delivery days, "Most popular" highlight, and whether the button is **Buy now** (checkout) or **Request a quote** (contact form).

### Everything else

| Menu | Controls |
| --- | --- |
| Home page | Section visibility, hero text, stats, about, services list, process, testimonials, client logos, FAQ, closing CTA |
| Resume | Summary, experience, education, skill groups, certifications, languages |
| Site and contact | Name, photo, CV file, availability badge, email, phone, WhatsApp, booking link, social links, default SEO |
| Payments | Methods on or off, account numbers, bank details, USD to BDT rate |
| Customers | Customer accounts: confirm an email by hand, block sign-in, photo, store credit, affiliate status, private notes |
| Coupons | Discount codes and their rules |
| Referrals and affiliates | Approve affiliates, pay payout requests, see every reward |
| Referral settings | Switch coupons, referrals and affiliates on or off, set rates, rewards and terms |
| Orders > Customer portal | Progress, expected delivery, files and links, and updates the customer sees in their account |
| Case studies | Client stories with challenges, approach and before/after results |
| Pages | Build pages from sections, link them in the header or footer |
| Products | Your apps and SaaS tools |
| CRM | Contacts, pipeline and emails |
| Header and footer | Menu links, header button, footer columns, products column |
| Emails | Sender, thank-you email and every order email, with previews |
| SEO and integrations | Search Console, analytics, ads, pixel, custom code, chat |
| Account | Display name and password |

Press `Ctrl+S` / `Cmd+S` in any editor to save.

## Payments

| Method | Default flow | Automatic flow |
| --- | --- | --- |
| bKash, Nagad, Rocket | Buyer sees your number and the taka amount, pays with Send Money, submits the transaction ID. You confirm in Admin > Orders. | Through SSLCommerz |
| Bank transfer | Buyer sees your bank details and submits a reference | Not needed |
| Debit or credit card | Buyer is asked to pay another way | SSLCommerz hosted checkout, verified with the validation API |
| PayPal | Buyer pays to your PayPal email and submits the transaction ID | PayPal Checkout, captured and marked paid |
| Payoneer | Buyer receives a payment request by email; you confirm | Not available |

Order statuses: Awaiting payment, Verifying payment, Paid, In progress, Completed, Cancelled, Payment failed. Each order has a private status page at `/order/<number>?t=<token>`.

## Project structure

```
app/
  (site)/              public pages (home, portfolio, blog, resume, pricing, checkout, order, contact, custom pages)
  admin/               login and admin panel
  api/
    admin/             protected CRUD, settings, uploads, media, stats, seed, account
    contact/           contact form
    orders/            checkout and payment proof
    payments/          SSLCommerz and PayPal callbacks
  media/[...path]/     serves local uploads
  sitemap.js, robots.js
components/
  site/                ScrollShot, ProjectCard, HeroShowcase, PricingTabs, CheckoutForm, ...
  admin/               Editor, Fields, List, Sidebar
lib/
  admin-schema.js      every admin form is defined here
  models/              Mongoose models
  data.js              data access with a read-only fallback
  seed-data.js         starter content
  schema.js            combined JSON-LD
  payments/            SSLCommerz and PayPal helpers
public/seed/           starter images
scripts/seed.mjs       terminal seeding
vercel.json            Vercel settings
```

## Customising

- **Add a field to any admin form:** add it to `lib/admin-schema.js` and, for projects, posts, packages and similar, to the model in `lib/models/index.js`. It then appears in the admin automatically.
- **Colours and fonts:** CSS variables at the top of `app/globals.css` (dark and light), fonts in `app/layout.js` and `tailwind.config.js`.
- **CMS and language lists:** `lib/options.js`.
- **Payment methods:** `PAYMENT_METHODS` in `lib/options.js` and the Payments section in `lib/admin-schema.js`.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Admin shows "starter content" and Save is disabled | `MONGODB_URI` is missing or wrong. Check it, then redeploy. |
| `querySrv ECONNREFUSED` locally | Your router's DNS refuses Atlas SRV lookups. Already handled in `lib/db.js`; if it persists, set `MONGODB_DNS` to other servers or change your computer's DNS to 8.8.8.8. |
| `MongoServerSelectionError` in Vercel logs | Add `0.0.0.0/0` in Atlas Network Access and check the password in the URI (URL-encode special characters). |
| Upload says "Uploads on Vercel need Cloudinary" | Add the three `CLOUDINARY_*` variables and redeploy. |
| CV PDF link returns 401 from Cloudinary | Enable "Allow delivery of PDF and ZIP files" in Cloudinary security settings, or keep the PDF in `public/docs`. |
| Wrong links in emails, sitemap or payment callbacks | Set `NEXT_PUBLIC_SITE_URL` to the live domain and redeploy. |
| Signed out after deploying | Changing `JWT_SECRET` ends all sessions. Sign in again. |
| Forgot the admin password | In Atlas, delete the document in the `users` collection, then sign in again with `ADMIN_EMAIL` and `ADMIN_PASSWORD`. |

## Security notes

**About `npm audit`.** After `npm install` you may see a handful of moderate and high warnings. They all come from Tailwind CSS 3's file watcher and glob tools (`braces`, `micromatch`, `chokidar`, `fast-glob`, `postcss-selector-parser`). These run only while building the CSS on your computer or on Vercel, read only this project's files, and are never sent to visitors, so they cannot be triggered from the website. Do **not** run `npm audit fix --force`: it would jump to Tailwind 4 and Next 16 and break the styling. Runtime packages (Next.js, Mongoose, Nodemailer, PostCSS) are on patched versions.

- Admin pages and APIs are protected by middleware and checked again inside every admin route.
- Passwords are hashed with bcrypt; sessions are httpOnly, `SameSite=Lax` cookies.
- Card data never reaches this server; SSLCommerz and PayPal handle it.
- Keep `.env.local` out of Git (already in `.gitignore`).

## License

© Manik Hossain. All rights reserved. Client names and screenshots belong to their owners.
