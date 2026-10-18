# Update guide: version 4.4 (blog reading page)

## 1. Table of contents follows your scrolling

- **Desktop:** the "On this page" list beside the article highlights the heading you are reading (blue bar, bold text, soft background) and updates as you scroll. If the list is long it scrolls by itself so the active item is always visible. At the very bottom of the post the last heading is active.
- **Phone and tablet:** a card above the article. Closed, it shows **Reading now: <current section>**. Tap it to open the full list; tap a section to jump there (the card closes by itself).
- Clicking an item scrolls smoothly and leaves the heading clear of the fixed header.
- The list includes H2, H3 and H4 headings, indented by level.
- It works for **Bengali** and other non-English headings, and for two headings with the same title (each gets its own address). Before this update those headings had no address, so a contents list could not work.

## 2. Clear heading sizes

Inside every post, each level is smaller than the one above it, and all are smaller than the post title (H1):

| Level | Size (phone to desktop) | Look |
| --- | --- | --- |
| H1 (post title) | 2.2rem to 4rem | unchanged |
| H2 | 1.65rem to 2.4rem | bold, thin line above with a short blue accent |
| H3 | 1.35rem to 1.75rem | bold |
| H4 | 1.18rem to 1.4rem | semibold |
| H5 | 1.08rem | semibold |
| H6 | 0.98rem | semibold, muted colour |

Sizes scale smoothly with the screen, so phones get slightly smaller headings and the order is always obvious. Tables scroll sideways inside the article on small screens instead of breaking the layout.

## 3. Adding a CTA or custom sections to posts

Already available, no change needed: open a post in **Admin > Blog**, tab **Extra sections** (Sections after the article). Add a Call to action, Pricing, FAQ, Custom HTML, a form and more. They appear under the article, above "Keep reading".

## Quick test

- [ ] Open a long post on desktop and scroll: the highlighted item in "On this page" changes with the heading in view.
- [ ] Click an item: smooth scroll, heading is not hidden under the header.
- [ ] Open the same post on a phone: the contents card shows the current section; open it and jump to a section.
- [ ] Check that H2, H3 and H4 look clearly different in size.
- [ ] Open a Bengali post: contents list works.

## 4. Troubleshooting: "querySrv ECONNREFUSED _mongodb._tcp.cluster0..."

What it is: the connection string `mongodb+srv://...` needs a special DNS lookup (SRV). Some internet providers and routers (common in Bangladesh) refuse it, so the site cannot find the database and shows built-in starter content instead. Your code and your MongoDB account are fine.

What the site does now, with nothing to set up:

1. Asks public DNS (Google, Cloudflare) for the address.
2. If your network blocks that too, it asks **over HTTPS** (port 443, like opening a website) and connects with the standard address. The terminal then says "Connected using the standard address (DNS over HTTPS)".

The same error is now printed once a minute instead of once for every setting on every page.

If it still fails:

- Try another network for a minute (mobile hotspot) to confirm it is the network.
- In Atlas open **Connect > Drivers** and choose the option that shows the older, standard connection string (starts with `mongodb://`, lists three servers). Paste it into `MONGODB_URI`.
- In Atlas > **Network Access** allow your current IP (or 0.0.0.0/0). A new home IP is a common reason for the next error after the DNS one.
- A wrong password shows "bad auth": special characters in the password must be URL-encoded.
- Restart `npm run dev` after changing `.env.local`.
