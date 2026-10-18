# Environment variables

> Generated from the code by `scripts/gen-docs.ts`. Do not edit by hand; run the script again after changing the code.

Set them in `.env.local` on your computer, or Vercel > Settings > Environment Variables. Parsed from `.env.example`.

| Variable | Example or default | What it is for |
| --- | --- | --- |
| `MONGODB_URI` | `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/manik-por` | Required |
| `MONGODB_DNS` | `8.8.8.8,1.1.1.1` | Optional. The app asks Google and Cloudflare DNS for the Atlas address, because many ISP routers refuse it ("querySrv ECONNREFUSED"). Set to "off" to use the system DNS instead. |
| `JWT_SECRET` | `change-this-to-a-long-random-string-at-least-32-chars` |  |
| `NEXT_PUBLIC_SITE_URL` | `https://manikhossain.in` | Your live domain, no trailing slash. Used for payment callbacks, sitemap and SEO. |
| `ADMIN_EMAIL` | `admin@manikhossain.in` | First admin login. On the first successful login this account is saved to the database; change the password afterwards from Admin > Account. |
| `ADMIN_PASSWORD` | `change-me-now` |  |
| `CLOUDINARY_CLOUD_NAME` | (empty) | Cloudinary: REQUIRED on Vercel (its disk is read-only). Optional on a VPS. |
| `CLOUDINARY_API_KEY` | (empty) |  |
| `CLOUDINARY_API_SECRET` | (empty) |  |
| `RESEND_API_KEY` | (empty) | Email (thank-you mails, order mails, invoices, alerts) Easiest: Resend (resend.com). Verify your domain there, then set: |
| `MAIL_FROM` | `hello@manikhossain.in` |  |
| `SMTP_HOST` | (empty) | ...or use SMTP instead (Gmail app password, Zoho, Hostinger mail, etc.): |
| `SMTP_PORT` | `465` |  |
| `SMTP_USER` | (empty) |  |
| `SMTP_PASS` | (empty) |  |
| `NOTIFY_EMAIL` | `admin@manikhossain.in` |  |
| `SSLCZ_STORE_ID` | (empty) | Optional: SSLCommerz (cards, bKash, Nagad, Rocket, net banking in one gateway) |
| `SSLCZ_STORE_PASSWORD` | (empty) |  |
| `SSLCZ_SANDBOX` | `true` |  |
| `PAYPAL_CLIENT_ID` | (empty) | Optional: PayPal automatic checkout |
| `PAYPAL_CLIENT_SECRET` | (empty) |  |
| `PAYPAL_SANDBOX` | `true` |  |
| `GEMINI_API_KEY` | (empty) | Optional: AI answers in the built-in chat Pick the provider in Admin > SEO and integrations > Chat. Only the key for that provider is needed. Google Gemini has a free tier (key from aistudio.google.com, no card needed). |
| `GROQ_API_KEY` | (empty) | Groq: free, very fast (console.groq.com/keys). OpenRouter: free models (openrouter.ai/keys). The AI writer uses every free key you add and switches automatically if one is busy. |
| `OPENROUTER_API_KEY` | (empty) |  |
| `OPENAI_API_KEY` | (empty) | ChatGPT API needs prepaid credit at platform.openai.com (a ChatGPT Plus plan does not include API use). |
| `ANTHROPIC_API_KEY` | (empty) |  |
| `CRON_SECRET` | (empty) | Daily subscription check (reminders and switching ended plans off). Any long random text. Add the same value in Vercel. |
