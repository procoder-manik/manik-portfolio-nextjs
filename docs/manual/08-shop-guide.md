# 08 Shop guide

## Services and packages

- **Services** (Shop > Services) are the tabs on the pricing page.
- **Packages** (Shop > Packages) are what people buy: name, price (and optional top of a range), currency, billing, delivery days, features, button type.
- **Button type:** *Buy now* goes to checkout; *quote* sends the visitor to the contact form for a custom price.
- **Billing:** one time, monthly, yearly or hourly.

### Monthly and yearly choice

In a package, switch on **Let the buyer choose Monthly or Yearly**. The **Price** becomes the **monthly** price. Set **Yearly discount (%)**: the yearly price is `monthly x 12` minus the discount (100 per month and 20% gives 960 per year). Or type a fixed **yearly price**, which wins over the percentage. The pricing cards then show a Monthly | Yearly switch, the price per period, "You save X (Y%)" and the effective monthly cost; the choice carries into checkout. The price is always recomputed on the server.

Cards can be shown as a grid or a carousel (chapter 05).

## Checkout and orders

1. A visitor opens `/checkout/<package>` (with `?period=yearly` for yearly) and picks a payment method.
2. `POST /api/orders` recomputes the price, applies a coupon, saves the order (number like `MH-YYMMDD-XXXX`, private token), emails you and the customer, and returns the next step.
3. **Manual methods** (bKash, Nagad, Rocket, bank): the order page shows your account details and the amount in taka; the buyer submits a transaction ID; the order becomes *verifying*; you confirm it as *Paid*.
4. **SSLCommerz** (cards and mobile banking) and **PayPal**: callbacks confirm payment automatically.
5. **Payoneer**: shown as instructions.

Statuses: `pending_payment`, `verifying`, `paid`, `in_progress`, `completed`, `cancelled`, `failed`.

### Working an order

Open it in **Shop > Orders**: change the status (history is kept), add private notes, post progress updates and files the customer can see, email the customer (several templates), and open the invoice (`/invoice/<number>`). Paying or marking paid also triggers referral rewards and starts a plan if it is a monthly or yearly package.

### Payments settings

**Site > Payments:** which methods are on, your account numbers and bank details, the USD to taka rate, PayPal and Payoneer details. Gateway keys live in the environment (SSLCommerz, PayPal); use the sandbox switches while testing.

## Monthly and yearly plans (subscriptions)

For packages sold monthly or yearly the order has a **Subscription box**.

1. When payment is approved, the plan starts today for one month or one year. If the same customer has an active plan of the same package, the new one starts when the old one ends (no days lost).
2. Edit **start** and **end** dates in the box any time (shortcuts: +1 month, +3 months, +1 year). Changing the end date resets reminders.
3. A **daily check** (Vercel Cron, `GET /api/cron/subscriptions`, needs `CRON_SECRET`) emails the customer before the end (default 7 and 1 days, changeable), then on the end date marks the plan **Ended** and emails the customer. You get an alert each time.
4. The customer sees plan dates and status in their account and a **Renew** button; a renewal continues from the old end date once you approve the payment.
5. **Cancel plan** stops reminders. **Switch back on** revives an ended plan with new dates.
6. Wording and reminder days: **Site > Emails > Subscriptions**.

This is a notice-and-renew system. It does not charge cards automatically. "Ended" marks the plan everywhere; pausing a client's own site is a manual decision after the alert.

## Coupons, referrals, affiliates

- **Coupons:** codes entered at checkout; percentage or fixed, limits and dates. Referral reward coupons are created automatically and marked `REF-`.
- **Referrals:** customers share a link and earn credit when a friend pays.
- **Affiliates:** people who apply and earn commissions; payouts are requested in their account and handled in **Shop > Referrals and affiliates**.
- Switches and rates: **Site > Referral settings**.

## Customers and accounts

- Customers create an account with the email they ordered with and see orders, invoices, private order links, messages and referral info. Orders can be claimed with the private link.
- **Shop > Customers** lets you confirm emails, block sign-in, set credit or affiliate status.
- Accounts can be turned off in Site and contact > Features.

## Messages and CRM

- **Messages** collects the contact form, chat and account messages; replies are emailed and shown in the customer account. AI can draft replies (chapter 07).
- **CRM** is a pipeline board from New to Won for everyone who got in touch.
