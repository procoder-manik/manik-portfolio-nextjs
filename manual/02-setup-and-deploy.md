# 02 Setup and deploy

## What you need

- Node.js 20.9 or newer.
- A MongoDB Atlas account (the free M0 cluster is enough to start).
- For going live: a Vercel account, a Cloudinary account (images and files), and an email provider (Resend or SMTP).

## Run it on your computer

1. Install: `npm install`
2. Create your local settings: `npm run setup`. It writes `.env.local` and prints the admin password once. Write it down.
3. Open `.env.local` and set `MONGODB_URI` (from Atlas > Connect > Drivers). Special characters in the password must be URL-encoded.
4. Start: `npm run dev`, then open http://localhost:3000.
5. Sign in at `/admin` with `ADMIN_EMAIL` and `ADMIN_PASSWORD`. The first successful login saves this account in the database. Change the password afterwards in **Admin > Account**.
6. On an empty database the dashboard shows **Load starter content**. Press it (or run `npm run seed`) to add the starter pages, projects, posts, packages and answers.

Without `MONGODB_URI` the site still runs and shows the starter content read-only, and the admin refuses to save.

### If the database does not connect

`querySrv ECONNREFUSED` means your network blocks the special DNS lookup that `mongodb+srv://` needs. The app already tries public DNS, then DNS over HTTPS, by itself. If it still fails, use the standard connection string from Atlas (the one that starts with `mongodb://` and lists three servers) or try another network. Also allow your IP in Atlas > Network Access. See chapter 11.

## Environment variables

The complete, always-correct list is [reference/environment.md](reference/environment.md). In short:

| Group | Variables | Needed for |
| --- | --- | --- |
| Required | `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `NEXT_PUBLIC_SITE_URL` | Everything |
| Media | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Uploads on Vercel |
| Email | `RESEND_API_KEY` + `MAIL_FROM`, or `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`; `NOTIFY_EMAIL` | Order mails, replies, alerts |
| Payments | `SSLCZ_STORE_ID`, `SSLCZ_STORE_PASSWORD`, `SSLCZ_SANDBOX`; `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_SANDBOX` | Automatic card and PayPal checkout |
| AI (all optional) | `GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY` (free); `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` (paid) | Writer, chatbot, replies. Can also be pasted in the admin |
| Plans | `CRON_SECRET` | The daily subscription check |

`JWT_SECRET` signs login cookies and encrypts the AI keys you save in the admin. Use a long random value and do not change it casually.

## Deploy to Vercel

1. Push the project to a Git repository and import it in Vercel.
2. Add every environment variable from the table above (Settings > Environment Variables).
3. In MongoDB Atlas > Network Access allow `0.0.0.0/0` (Vercel addresses change). Use a strong database password.
4. Deploy. `vercel.json` already sets the region (Singapore), longer limits for orders, payments, seeding and the cron job, and the daily subscription schedule.
5. Visit `/admin`, sign in, press **Load starter content** the first time.
6. Add your domain in Vercel and set `NEXT_PUBLIC_SITE_URL` to it (no trailing slash), then redeploy.
7. Set the same `CRON_SECRET` in Vercel for the daily plan check. Test: sign in to the admin, open `/api/cron/subscriptions`, expect `{"ok":true,...}`.

## Deploy on a VPS

`npm run build` then `npm start` (use pm2 to keep it running, and a reverse proxy such as Nginx for HTTPS). Uploads are stored in `storage/uploads` when Cloudinary is not configured; include that folder in your backups.

## After going live: checklist

- [ ] Admin password changed, only needed users exist (Admin > Users).
- [ ] Email works: use the preview and test tools in Admin > Emails, and place a test contact message to see the auto-reply arrive.
- [ ] A test order goes through each payment method you enabled (use the sandbox switches first).
- [ ] Site and contact: name, phone, email, social links, logo and share image are correct.
- [ ] SEO settings: business details, sitemap on, site not set to noindex.
- [ ] Submit `/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
- [ ] At least one free AI key is added (Admin > AI writer > Settings).
- [ ] `CRON_SECRET` set and `/api/cron/subscriptions` tested.

## Updating to a new version

1. Back up the database.
2. Replace the project files with the new version. **Keep** your `.env.local` and the `storage` folder.
3. `npm install`, then `npm run build` to check it compiles.
4. Deploy.
5. Run **Load starter content** in the admin (or `npm run seed`). It only adds what is missing and applies safe wording updates; it never overwrites text you edited.
6. Read the matching update guide in `docs/` (for example `GUIDE-V4.5.md`) and work through its quick test.
