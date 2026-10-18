# 11 Maintenance and troubleshooting

## Routine care

### Every week

- Dashboard: new orders and messages answered.
- SEO overview: press **Needs work**, fix the top three pages.
- AI IQ: answer the questions the bot could not answer.
- 404 log: redirect the most visited missing addresses.

### Every month

- Search Console: queries, pages, coverage, Core Web Vitals.
- Update thin or outdated posts; check that prices and policies in FAQ and Help center are still true.
- Check expiring plans (Orders with a Subscription box) and that reminders went out.
- Review Users and remove people who left.

### Every quarter

- Back up (below) and test a restore on a spare database.
- Update dependencies carefully (see below), build, test, deploy.
- Rotate API keys you no longer trust.

## Backups

- **Database:** MongoDB Atlas backups, or `mongodump` on a schedule. Atlas M0 has no automatic backups, so export regularly.
- **Media:** Cloudinary keeps your uploads; on a VPS back up `storage/uploads`.
- **Code and docs:** the Git repository, plus the zip files of each version.
- Before a large change, export the database first.

## Updating dependencies

Do not run `npm audit fix --force`; it can break Tailwind and Next. Update one package at a time, run `npm run build`, test the admin and a checkout, then deploy. Next.js is pinned to a patched version; keep it patched.

## Health check

`/api/health` reports whether the database connects, how many admin users exist, and which environment variables are set (yes or no only, never the values). Use it after a deploy.

## Error guide

| What you see | What it means | Fix |
| --- | --- | --- |
| `querySrv ECONNREFUSED _mongodb._tcp...` in the terminal; site shows starter content | Your network blocks the DNS lookup that `mongodb+srv://` needs | The app retries with public DNS, then DNS over HTTPS. If it persists: use the standard (non-SRV) connection string from Atlas, try another network, allow your IP in Atlas |
| `bad auth` | Wrong database user or password | Fix `MONGODB_URI`; URL-encode special characters |
| `Cannot reach the database` | IP not allowed | Atlas > Network Access: add your IP or `0.0.0.0/0` |
| Admin says read-only or refuses to save | No `MONGODB_URI`, or the database is down | Set the variable, redeploy |
| Hydration mismatch mentioning `chrome-extension://` | A browser extension changed the page before React loaded | Harmless and only in development; test in a private window |
| "Encountered two children with the same key" | A list had the same item twice | Fixed in current versions; update |
| AI: "The free AI is busy right now" | Free quota or high demand | It retries by itself; press Continue writing; add a second free key |
| AI: "No AI key is set" | No key anywhere | Admin > AI writer > Settings > API keys |
| AI: "model ... did not work" | A provider retired a model | The live model list is used automatically; press Test on the key and read the lines shown |
| AI key says "cannot be read" | `JWT_SECRET` changed | Paste the key again |
| Plan reminders not sent | Cron not authorised | Set `CRON_SECRET` on Vercel and redeploy; open `/api/cron/subscriptions` as admin |
| Changed seed data but live site did not change | Saved settings win over seed defaults | Edit in the admin, or use the safe update mechanism (chapter 05) |
| Public page shows old content | Cache not refreshed | Save again in the admin, or use **Rebuild schema** on that item; the cache also expires in 10 minutes |
| Images do not upload on Vercel | Cloudinary variables missing | Add the three Cloudinary variables |
| Payment stays "verifying" | Manual method waiting for you | Check the transaction in your account and mark the order Paid |
| Emails show localhost | Local testing, or `NEXT_PUBLIC_SITE_URL` wrong | Set it to your domain; deploy |
| `npm run build` fails | Code error | Read the first error line; run it again after the fix before deploying |
| `Cannot access 'x' before initialization` in the browser | A variable is used above the line that creates it inside a component. The build does not catch this | Move the code below the declaration, then open that screen once before deploying |

## Debugging steps

1. Reproduce it; note the page and the time.
2. Read the terminal (development) or Vercel > Logs (production). Search for `[data]`, `[db]` or the route name.
3. Check `/api/health`.
4. Check the last change you made (the change log and Git history).
5. If a setting looks wrong, compare it with the default in `lib/seed-data.js`.
6. Fix, run `npm run build`, test the admin and the public page, deploy.
