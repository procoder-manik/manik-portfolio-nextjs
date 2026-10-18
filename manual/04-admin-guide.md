# 04 Admin guide

Open `/admin` and sign in. The left menu is grouped; items you are not allowed to use are hidden (see chapter 10). The full menu with addresses is in [reference/admin-menu.md](reference/admin-menu.md).

## Menu groups at a glance

| Group | Items | What you do there |
| --- | --- | --- |
| Overview | Dashboard | See new orders, messages and content; load starter content on an empty site |
| Content | Portfolio, Case studies, Blog posts, Categories, Pages, Products, Media | Everything visitors read and see |
| AI | AI writer, AI news, AI IQ, Taught answers | Write posts, get story ideas, teach the chatbot |
| Marketing | Forms, Form answers, Popups, Announcement bar, Redirects, 404 log | Capture leads and keep links alive |
| SEO | SEO overview, SEO settings | Scores, fixes, business schema, sitemap |
| Shop | Services, Packages, Orders, Customers, Coupons, Referrals and affiliates, Messages, CRM | Sell and support |
| Site | Home page, Resume, Site and contact, Header and footer, Popup rules, Payments, Referral settings, Emails, Analytics and integrations, Users, Account | Global settings and people |

## Lists (every content type works the same way)

- **Search and filters** at the top. A view switch separates active items from the Trash.
- **Select rows** with the checkboxes for bulk actions: Duplicate, Move to Trash.
- **Pencil icon (Quick edit):** change title, slug, Published or Draft, and Index or Noindex in a small panel under the row. Changing the slug of a live item adds a 301 redirect automatically.
- **Copy icon (Duplicate):** makes a copy named "Title (copy)", with a new unique slug, saved as a draft with counters at zero.
- **SEO column** (posts, pages, portfolio, case studies, categories): the 0 to 100 score. Hover for the top fixes, click to open the SEO tab.
- **Trash:** removed items wait here for the retention period (default 30 days) and can be restored. Delete permanently removes them for good.

## Editors

- Fields are grouped in **tabs** (for example Content, SEO, Social, Schema). The small **i** beside a field explains it.
- **Save** with the button or Ctrl or Cmd + S. A badge shows **Unsaved** when there are changes; leaving the page warns you.
- After saving an item that has an SEO score, the message shows the score and the next thing to fix.
- **Published** switches a live item on or off. Drafts are invisible to visitors but you can preview them.
- Images: choose from the **media library** or upload (Cloudinary on Vercel).

## Settings pages

A settings page is a group of options saved as one document (for example Site and contact, Home page, Emails). Save at the top. Defaults are merged underneath, so a new option from an update simply appears. Every settings page and field is listed in [reference/settings.md](reference/settings.md).

## Dashboard

New orders, new messages, content counts and quick links. On an empty database it also offers **Load starter content**, which adds missing starter items without touching anything you changed.

## Everyday jobs

| Job | Steps |
| --- | --- |
| Publish a blog post | AI > AI writer (or Content > Blog posts > New), fill in, set a category, press Publish. Check the SEO score |
| Change the home page headline | Site > Home page > Hero |
| Show or hide a home section | Site > Home page > Visible sections |
| Add a new service package | Shop > Packages > New, choose the service, set price and billing |
| Confirm a manual payment | Shop > Orders > open the order > set the status to Paid |
| Reply to a message | Shop > Messages, write the reply (it is emailed and shown in the customer account) |
| Add an answer for the chatbot, FAQ and Help center | AI > AI IQ or Taught answers |
| Redirect a dead link | Marketing > 404 log, create a redirect from the most visited addresses |
| Add a staff member | Site > Users |

Details for each area are in chapters 05 to 09.
