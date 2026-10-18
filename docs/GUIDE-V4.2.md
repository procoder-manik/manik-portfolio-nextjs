# Update guide: version 4.2

What is new in this version, where to find it in the admin, and what to set up on Vercel.
Everything below was added on top of version 4. Nothing was removed.

---

## 1. Duplicate button

**Where:** Admin > any list (Portfolio, Blog, Pages, Case studies, Services, Packages, Coupons, Forms, Popups, Products, Categories, Redirects, AI answers).

- Hover a row and click the **copy icon**.
- The copy is named "Title (copy)", gets a new unique URL slug and starts as a **draft**, so it never goes live by accident.
- Coupons get a `-COPY` code and a use count of 0. Forms and popups start with zero views and answers.
- To copy many at once, tick the rows and press **Duplicate** in the blue bar.
- Customers, contacts and orders have no Duplicate button on purpose (they are real people and real payments).

## 2. Quick Edit

**Where:** the same lists, the **pencil icon** on each row.

A small panel opens under the row with:

- **Title** and **Slug (URL)**. If you change the slug of a live item, a 301 redirect from the old address is added for you.
- **Status**: Published or Draft (On or Off for services, packages, coupons and similar).
- **Search engines**: Index or Noindex (portfolio, blog, pages, case studies, categories).
- **Trash or delete** link: opens the usual choice of Trash, Draft or Delete permanently.

Press **Update** to save, **Cancel** to close.

## 3. Email footer shows the real website

The footer of every email (and every button link inside it) now uses the address of the site that is running:

- On your computer it shows `localhost:3000`.
- On Vercel or your own domain it shows that domain, for example `manikhossain.in`. No setting needed.

This covers order, invoice, thank-you, verify, reset and alert emails, payment return links and the new subscription emails.

> Also set `NEXT_PUBLIC_SITE_URL="https://manikhossain.in"` in Vercel. A localhost value is now ignored on Vercel, but emails sent by the daily subscription check use this variable.

## 4. Cards: grid or carousel, columns, auto slide

**Where:**

| Section | Where to set it |
| --- | --- |
| Pricing cards (home and /pricing) | Admin > Site > Home page > **Card layouts** |
| Work (projects on home) | Admin > Site > Home page > **Card layouts** |
| Testimonials | Admin > Site > Home page > **Card layouts** |
| Services | Admin > Site > Home page > Services list |
| Process | Admin > Site > Home page > Process |
| Any page section (Cards, Portfolio, Blog posts, Pricing, Testimonials, Steps, Feature grid) | Admin > Pages > edit the section |

Options for each one:

- **Layout**: Grid (all cards at once) or Carousel (slides).
- **Cards per row**: 2, 3 or 4 on a wide screen. Phones always show one.
- **Slide automatically**: on = moves by itself and pauses on hover. Off = visitors use the arrows, the dots or swipe.
- **Seconds between slides**: 2 to 30 (empty = 5).

Rows are not a setting: in a grid the rows follow from how many cards you have and how many columns you picked.

## 5. Monthly and Yearly pricing

**Where:** Admin > Shop > Packages > edit a package > **Price**.

1. Turn on **Let the buyer choose Monthly or Yearly**.
2. Type the **monthly** price in the Price box.
3. Set **Yearly discount (%)**. The yearly price is `monthly x 12` minus the discount.
   Example: 100 per month and 20% gives **960 per year**, and the card shows **You save 240 (20%)**.
4. Optional: type a **yearly price yourself**. It wins over the percentage and the saving is worked out from it.

On the website the service gets a **Monthly | Yearly** switch above its cards. The card shows the price, "per month" or "per year", the saving and the effective monthly cost. The switch carries into checkout.

For packages without this switch, the **Billing** box still works as before: One time, Monthly, Yearly or Hourly. A package set to Monthly or Yearly (with or without the switch) is treated as a subscription.

The price always comes from the package on the server, so nobody can change it from the browser. Coupons are applied to the price of the period the buyer picked.

## 6. Subscriptions: start date, end date, reminders, switch-off

**Where:** Admin > Shop > Orders > open an order of a monthly or yearly package > **Subscription** box.

How it works:

1. The buyer orders a monthly or yearly plan.
2. When you approve the payment (or a gateway confirms it), the plan **starts**: start = today, end = one month or one year later. If the same customer already has an active plan of the same package, the new plan starts when the old one ends, so no days are lost.
3. You can change the **start and end dates** any time in the Subscription box (buttons for +1 month, +3 months, +1 year). Changing the end date resets the reminders.
4. A daily check then:
   - emails the customer **7 days and 1 day before** the end (you can change the days),
   - on the end date marks the plan **Ended (switched off)** and emails the customer,
   - emails **you** both times (NOTIFY_EMAIL).
5. The customer sees "Plan starts, Plan ends, Plan status" in their account and a **Renew** button. When they renew and you approve the payment, the new plan continues from the old end date.
6. **Cancel plan** in the box stops the reminders. **Switch back on with these dates** revives an ended plan.

Edit the wording: Admin > Settings > Emails > **Subscriptions**. Placeholders: `{name} {package} {period} {endDate} {days} {number}`. Each email can be switched off.

What "switched off" means here: the plan is marked ended everywhere (admin, customer account, emails). Your website does not hide a client's own site by itself, so after the notice you decide what to pause. The admin alert tells you who ended.

### Set up the daily check on Vercel (one time)

1. Pick any long random text, for example 40 random letters and numbers.
2. Vercel > your project > Settings > Environment Variables > add `CRON_SECRET` with that text > redeploy.
3. That is all. `vercel.json` already contains the daily schedule (03:00 UTC). Vercel Hobby allows one run per day, which is exactly what is needed.
4. Check it: sign in to the admin and open `https://your-domain/api/cron/subscriptions`. You should see `{"ok":true,"reminded":0,"expired":0,"checked":N}`.
5. Email must be working (RESEND_API_KEY or SMTP, plus NOTIFY_EMAIL for your own alerts).

---

## Upgrading from version 4

1. Replace your project files with this version (keep your `.env.local` and the `storage` folder).
2. Run `npm install`, then `npm run build` to check.
3. Deploy. No database migration is needed: new fields appear with safe defaults.
4. Add `CRON_SECRET` on Vercel (section 6).
5. Admin > Settings > Emails > Subscriptions: read the wording once.
6. Admin > Packages: turn on Monthly / Yearly for the packages that need it (for example the SEO plans) and set the discount.

## Quick test checklist

- [ ] Duplicate a page, check the copy is a draft with a new URL.
- [ ] Quick edit a post: change the slug, set Noindex, press Update.
- [ ] Send a test order email on the live site and check the footer shows your domain.
- [ ] Turn on Carousel + auto slide for Pricing in Card layouts and look at /pricing.
- [ ] Turn on Monthly / Yearly on one package, click the switch, go through checkout in both modes.
- [ ] Place a test monthly order, approve payment, check start and end dates in the Subscription box.
- [ ] Set the end date to tomorrow, open `/api/cron/subscriptions` and check the reminder email arrives.
- [ ] Set the end date to yesterday, open the same address and check the plan shows as ended.

## Not included yet

- Automatic card charging every month. Plans end and the customer renews; this is a notice-and-renew system.
- Rows setting for grids (rows follow from the number of cards).
- Duplicate for single testimonials and service cards inside the Home page settings.

---

## বাংলায় সারসংক্ষেপ

1. **Duplicate:** যেকোনো লিস্টে row-র উপর কপি আইকন চাপলে কপি হয় (draft হিসেবে, নতুন URL সহ)। একসাথে অনেকগুলো সিলেক্ট করেও করা যায়।
2. **Quick Edit:** পেন্সিল আইকন। Title, Slug, Draft/Published, Index/Noindex এক জায়গা থেকে বদলানো যায়। Trash বা permanent delete লিংকও আছে।
3. **Email footer:** localhost-এ localhost দেখায়, live সাইটে সাইটের ডোমেইন নিজে থেকেই দেখায়। Vercel-এ `NEXT_PUBLIC_SITE_URL` ঠিক ডোমেইন দিয়ে রাখো।
4. **Cards:** Admin > Site > Home page > Card layouts থেকে Pricing, Work, Testimonials-এর জন্য Grid/Carousel, কয়টা column, auto slide আর কত সেকেন্ড পরপর slide হবে ঠিক করা যায়। Services ও Process-এ আগের মতো নিজস্ব সেটিং আছে।
5. **Monthly/Yearly:** Package edit করে "Let the buyer choose Monthly or Yearly" অন করো। Price-এ মাসিক দাম দাও, Yearly discount (%) দাও। কার্ডে Monthly | Yearly সুইচ আসবে এবং yearly-তে কত সাশ্রয় হচ্ছে দেখাবে।
6. **Subscription:** Order খুলে Subscription box-এ start ও end date দাও (payment approve করলে নিজে থেকেও বসে যায়)। প্রতিদিন চেক চলে: শেষ হওয়ার ৭ দিন ও ১ দিন আগে কাস্টমারকে মেইল, শেষ হলে "ended" মেইল, আর তোমাকেও মেইল। Vercel-এ শুধু `CRON_SECRET` দিতে হবে।
