# 10 Security and roles

## Sign-in

- **Admin:** email and password at `/admin/login`. The first login with `ADMIN_EMAIL` and `ADMIN_PASSWORD` creates the first user. Passwords are stored as bcrypt hashes. A signed, http-only cookie (`mh_admin`, 7 days) keeps you signed in.
- **Customers:** a separate sign-in at `/account` with its own cookie.
- `middleware.js` blocks `/admin`, `/api/admin`, `/account` and `/api/account` for people who are not signed in. Each API route checks again inside (`adminRoute()` in `lib/server-auth.js`), so a missing menu item is never the only protection.

## Roles

| Role | Can do |
| --- | --- |
| Administrator | Everything, including users, payments, integrations, AI keys and custom code |
| Editor | All content, pages, SEO, forms, popups, redirects, menus and the home page. No payments, users or custom code |
| Shop manager | Orders, customers, coupons, affiliates, packages, messages, CRM and form entries |
| Author | Blog posts, categories and the media library only |

Roles are groups of **areas**: blog, content, media, marketing, seo, design, entries, shop, system. Every list and settings page belongs to one area. The map is in [reference/roles.md](reference/roles.md) and `lib/roles.js`. Manage people in **Site > Users**; give each person the smallest role they need.

## Protected secrets

- Environment variables hold payment, email, database and AI secrets. They never appear in the browser.
- AI keys pasted in the admin are saved **encrypted** (AES-256-GCM using `JWT_SECRET`), are never sent back (only the last four characters are shown), and only administrators can change them.
- Changing `JWT_SECRET` signs everyone out and makes saved AI keys unreadable (paste them again).
- Never commit `.env.local`. Rotate any key you suspect has leaked and remove it from the AI keys box.

## Abuse protection

- Public forms, sign-in, registration, orders and AI routes are **rate limited** (`lib/ratelimit.js`).
- The contact form has a honeypot field.
- Uploads (profile photos) are validated by their real bytes, not by file name.
- Security headers are set in `next.config.mjs`.
- Payment callbacks are verified with the provider before an order is marked paid. Order pages need the private token.
- The cron endpoint needs `CRON_SECRET` (or a signed-in administrator).

## If something goes wrong

1. Suspected leak: change `JWT_SECRET`, `ADMIN_PASSWORD`, database password and any provider key; redeploy.
2. Unknown admin user: remove it in Users; change all admin passwords.
3. Defaced content: restore from a backup (chapter 11); check Users and Redirects for entries you did not add.
4. Spam flood: check the rate limits and the Form answers spam filter; add a CAPTCHA to the form if needed.
