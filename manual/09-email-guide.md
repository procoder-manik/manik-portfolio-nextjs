# 09 Email guide

## What is sent automatically

| Email | To | When | Edit it in |
| --- | --- | --- | --- |
| Thank-you (auto-reply) | The person who wrote | Contact form or chat message | Site > Emails > Thank-you email |
| Order received | Customer | Order placed | Emails > Order email: Order received |
| Payment confirmed | Customer | Order marked paid | Emails > Payment confirmed |
| Work started | Customer | Status set to in progress | Emails > Work started |
| Delivered | Customer | Status set to completed | Emails > Delivered |
| Cancelled | Customer | Order cancelled | Emails > Cancelled |
| Plan ending soon, plan ended | Customer | Daily plan check | Emails > Subscriptions |
| Invoice | Customer | You send it from the order | Order screen |
| Verify email, reset password | Customer | Account actions | Built-in |
| New order, new message, account message, plan alerts | You (`NOTIFY_EMAIL`) | Each event | Built-in |

Each email can be switched on or off, and its subject and message edited with placeholders such as `{name}`, `{number}`, `{package}`. The settings page has live previews. All emails share one layout (`lib/email/templates.js`) with your name, role, contact details, social links and signature.

## Sender and sending

- **Sender** settings: from name, reply-to address and signature (Site > Emails > Sender).
- **Sending provider** (environment): `RESEND_API_KEY` with `MAIL_FROM` (verify your domain in Resend first), or SMTP with `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`. Resend is used when its key is set; otherwise SMTP.
- `NOTIFY_EMAIL` is where alerts to you go.
- Every sent email is logged on the order (or message) so you can see what the customer got.

## The website name and links in emails

The footer, the buttons and the links inside emails use the address of the site that is running. On your computer they show `localhost:3000`; on Vercel or your own domain they show that domain, with nothing to configure (`lib/base-url.js`). On Vercel a localhost value in `NEXT_PUBLIC_SITE_URL` is ignored. Emails sent outside a web request (the daily plan check) use `NEXT_PUBLIC_SITE_URL`, so set it to your real domain.

## AI replies to messages

In **Messages** the AI can draft a reply from your taught answers and your instructions. Choose its provider in Emails > AI reply ("Same as the chat" by default). You always review and send it yourself.

## Email problems

| Symptom | Likely cause and fix |
| --- | --- |
| Nothing arrives | No provider set. Add Resend or SMTP variables and redeploy |
| Goes to spam | Verify the sending domain (SPF, DKIM) with your provider; use a `MAIL_FROM` on that domain |
| Footer shows localhost | You are testing locally, or a very old version. Update; check `NEXT_PUBLIC_SITE_URL` |
| Reminders never arrive | `CRON_SECRET` missing or the cron not running; open `/api/cron/subscriptions` as admin and read the answer |
| Customer did not get the order mail | Check the log on the order; check the spam folder; resend from the order screen |
