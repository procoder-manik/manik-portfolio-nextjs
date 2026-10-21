# Settings pages

> Generated from the code by `scripts/gen-docs.ts`. Do not edit by hand; run the script again after changing the code.

One page per group at `/admin/settings/<key>`. Saved as a single document per key; defaults come from `lib/seed-data.js` and are merged underneath, so new options appear on their own.

## Referrals and affiliates (`referrals`)

- Admin: `/admin/settings/referrals`, area: **shop**

### Coupons

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `coupons.enabled` | Show a coupon box at checkout | switch | Make codes in Shop > Coupons. |
| `cookieDays` | Remember a referral link for (days) | number | How long a ?ref= visit counts toward an order. |

### Referral program

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `referral.enabled` | Referral program on | switch |  |
| `referral.rewardMode` | Reward | segmented |  |
| `referral.rate` | Credit, % of what the friend pays | number |  |
| `referral.maxReward` | Most credit per referral | number | 0 or empty means no cap. |
| `referral.rewardCoupon` | Coupon to give as the reward | ref | Each referrer gets their own single-use copy of this coupon. |
| `referral.couponDays` | Reward coupon valid for (days) | number |  |
| `referral.friendCoupon` | Coupon for the invited friend (optional) | ref | Filled in at checkout automatically for people who arrive through a referral link. |
| `referral.firstOrderOnly` | Reward only the friend’s first paid order | switch |  |
| `referral.heading` | Heading in the account | text |  |
| `referral.intro` | Intro in the account | textarea |  |

### Affiliate program

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `affiliate.enabled` | Affiliate program on | switch | Customers can apply from their account. Approved affiliates earn cash commission. |
| `affiliate.rate` | Commission % | number |  |
| `affiliate.holdDays` | Holding period (days) | number | Commission becomes available after this, if the order is not cancelled. |
| `affiliate.minPayout` | Minimum payout | number |  |
| `affiliate.autoApprove` | Approve applications automatically | switch |  |
| `affiliate.payoutMethods` | Payout methods offered | tags |  |
| `affiliate.heading` | Heading in the account | text |  |
| `affiliate.intro` | Intro in the account | textarea |  |
| `affiliate.terms` | Program terms | textarea |  |

## Site and contact (`site`)

- Admin: `/admin/settings/site`, area: **design**

### Identity

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `name` | Your name | text |  |
| `role` | Role line | text |  |
| `tagline` | Tagline | text |  |
| `avatar` | Portrait photo | image |  |
| `cvFile` | CV file (PDF) | file |  |

### Features

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `features.caseStudies` | Case studies (page, home section, menu and footer links) | switch | Off hides every case study page, section and link at once. Your case studies stay saved. |
| `features.backToTop` | Back to Top button | switch | A round button that appears after a visitor scrolls down and takes them back to the top. It shows a ring that fills as they read. Off removes it from... |
| `features.backToTopPosition` | Back to Top side | segmented | Which bottom corner the button sits in, on desktop and phones. If the built-in chat is on the same side, the button sits above the chat button. |
| `features.trashDays` | Empty the Trash automatically after (days) | number | Deleted items wait in the Trash this many days, then are removed for good. 0 keeps them until you delete them yourself. |
| `features.customerAccounts` | Customer accounts (sign up, order tracking, project updates) | switch | Off hides the account icon, the sign-up prompts and every /account page. Existing accounts stay saved. |

### Availability

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `available` | Taking new work | switch |  |
| `availabilityText` | Badge text | text |  |
| `replyTime` | Reply time | text |  |
| `location` | Location | text |  |

### Contact

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `email` | Email | email |  |
| `phone` | Phone (display) | text |  |
| `phoneTel` | Phone (dial, no spaces) | text |  |
| `whatsapp` | WhatsApp link | url |  |
| `calendly` | Booking link (Calendly) | url |  |

### Social links

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `socials` | Profiles | repeater |  |
| `socials[].label` | Name | text | |
| `socials[].url` | Link | url | |

### Footer and SEO

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `footerNote` | Footer text | textarea |  |
| `homeSeoPreview` | Home page in Google | seo |  |
| `seoTitle` | Home page meta title | text | Shown exactly as typed. Also the fallback for pages without their own. |
| `seoDescription` | Home page meta description | textarea |  |
| `ogImage` | Default social share image | image |  |

## Home page (`home`)

- Admin: `/admin/settings/home`, area: **design**

### Hero

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `hero.headline` | Headline | textarea |  |
| `hero.intro` | Intro | textarea |  |
| `hero.primaryLabel` | Main button | text |  |
| `hero.secondaryLabel` | Second button | text |  |
| `stats` | Numbers | repeater |  |
| `stats[].value` | Value | text | |
| `stats[].label` | Label | text | |
| `tools` | Tools strip | tags |  |

### About

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `about.heading` | Heading | text |  |
| `about.body` | Text | markdown |  |
| `about.quote` | Quote | textarea |  |
| `about.image` | Photo | image |  |

### Services list

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `services.heading` | Heading | text |  |
| `services.intro` | Intro | textarea |  |
| `services.template` | Card design | cardTemplate | How your service cards look. Pick a design and the preview updates. Service card is the icon tile design with a LEARN MORE link. |
| `services.layout` | Layout | segmented | Grid shows all cards. Carousel lets visitors slide through them. |
| `services.columns` | Cards per row | segmented | Cards side by side on a wide screen. |
| `services.showLinks` | Show the Learn more link on each card | switch | Off hides the link on every service card. |
| `services.autoplay` | Slide automatically (carousel) | switch | The carousel moves by itself and pauses when the mouse is over it. |
| `services.interval` | Seconds between slides | number | How long each slide stays. Between 2 and 30 seconds. Empty uses 5. |
| `services.linkLabel` | Default link text | text | The link words used when a card has none, for example Learn more. |
| `services.groups` | Groups | repeater | Each group is a labelled row of cards. Add a group for each area of your work. |
| `services.groups[].title` | Group label | text | |
| `services.groups[].items` | Cards | repeater | |

### Section headings

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `work.heading` | Work heading | text |  |
| `work.count` | Projects on home | number |  |
| `work.intro` | Work intro | textarea |  |
| `blog.heading` | Blog heading | text |  |
| `blog.count` | Posts on home | number |  |
| `blog.intro` | Blog intro | textarea |  |
| `pricing.heading` | Pricing heading | text |  |
| `pricing.intro` | Pricing intro | textarea |  |
| `resume.heading` | Resume heading | text |  |
| `resume.intro` | Resume intro | textarea |  |
| `caseStudies.heading` | Case studies heading | text |  |
| `caseStudies.count` | Case studies on home | number |  |
| `caseStudies.intro` | Case studies intro | textarea |  |
| `apps.heading` | Products heading | text |  |
| `apps.intro` | Products intro | textarea |  |

### Card layouts

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `pricing.layout` | Layout | segmented | Grid shows every package at once. Carousel shows a row visitors can slide. |
| `pricing.columns` | Cards per row | segmented | How many cards sit side by side on a wide screen. Phones always show one. |
| `pricing.autoplay` | Slide automatically (carousel) | switch | On: the carousel moves by itself and pauses when the mouse is over it. Off: visitors slide with the arrows, the dots or a swipe. |
| `pricing.interval` | Seconds between slides | number | How long each slide stays. Between 2 and 30 seconds. Empty uses 5. |
| `work.layout` | Layout | segmented | Grid shows every project at once. Carousel shows a row visitors can slide. |
| `work.columns` | Cards per row | segmented | How many cards sit side by side on a wide screen. Phones always show one. |
| `work.autoplay` | Slide automatically (carousel) | switch | On: the carousel moves by itself and pauses when the mouse is over it. Off: visitors slide with the arrows, the dots or a swipe. |
| `work.interval` | Seconds between slides | number | How long each slide stays. Between 2 and 30 seconds. Empty uses 5. |
| `testimonials.layout` | Layout | segmented | Grid shows every review at once. Carousel shows a row visitors can slide. |
| `testimonials.columns` | Cards per row | segmented | How many cards sit side by side on a wide screen. Phones always show one. |
| `testimonials.autoplay` | Slide automatically (carousel) | switch | On: the carousel moves by itself and pauses when the mouse is over it. Off: visitors slide with the arrows, the dots or a swipe. |
| `testimonials.interval` | Seconds between slides | number | How long each slide stays. Between 2 and 30 seconds. Empty uses 5. |

### Process

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `process.heading` | Heading | text |  |
| `process.template` | Card design | cardTemplate | How the steps look. Numbered step shows a large outlined number. |
| `process.layout` | Layout | segmented | Grid shows all steps. Carousel lets visitors slide. |
| `process.columns` | Cards per row | segmented | Steps side by side on a wide screen. |
| `process.steps` | Steps | repeater |  |
| `process.steps[].title` | Title | text | |
| `process.steps[].time` | Small note | text | |
| `process.steps[].body` | Description | textarea | |

### Testimonials and logos

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `testimonials.heading` | Heading | text |  |
| `testimonials.items` | Testimonials | repeater |  |
| `testimonials.items[].quote` | Quote | textarea | |
| `testimonials.items[].name` | Name | text | |
| `testimonials.items[].source` | Source | text | |
| `testimonials.items[].avatar` | Photo | image | |
| `testimonials.logos` | Client logos | images |  |

### FAQ

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `faq.heading` | Heading | text |  |
| `faq.items` | Questions | repeater |  |
| `faq.items[].q` | Question | text | |
| `faq.items[].a` | Answer | textarea | |

### Closing call to action and contact page

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `cta.heading` | CTA heading | text |  |
| `cta.body` | CTA text | textarea |  |
| `contact.heading` | Contact page heading | text |  |
| `contact.intro` | Contact page intro | textarea |  |

## Resume (`resume`)

- Admin: `/admin/settings/resume`, area: **design**

### Summary

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `headline` | Headline | text |  |
| `summary` | Summary | textarea |  |
| `availability` | Availability line | text |  |
| `highlights` | Highlight numbers | repeater |  |
| `highlights[].value` | Value | text | |
| `highlights[].label` | Label | text | |

### Experience

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `experience` | Positions | repeater |  |
| `experience[].role` | Role | text | |
| `experience[].company` | Company | text | |
| `experience[].start` | Start | text | |
| `experience[].end` | End | text | |
| `experience[].bullets` | Highlights | list | |

### Education

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `education` | Education | repeater |  |
| `education[].degree` | Degree or course | text | |
| `education[].school` | Institution | text | |
| `education[].start` | Start | text | |
| `education[].end` | End | text | |

### Skills

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `topSkills` | Top skills (with level bars) | repeater |  |
| `topSkills[].name` | Skill | text | |
| `topSkills[].level` | Level 0 to 100 | number | |
| `tools` | Tools I use | tags |  |
| `skills` | Skill groups | repeater |  |
| `skills[].group` | Group | text | |
| `skills[].level` | Confidence (0 to 100) | number | |
| `skills[].items` | Skills | tags | |

### Certifications and languages

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `certifications` | Certifications | repeater |  |
| `certifications[].name` | Name | text | |
| `certifications[].issuer` | Issuer | text | |
| `certifications[].year` | Year | text | |
| `certifications[].url` | Link | url | |
| `languages` | Languages | repeater |  |
| `languages[].name` | Language | text | |
| `languages[].level` | Level | text | |

## Payments (`payments`)

- Admin: `/admin/settings/payments`, area: **system**

### General

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `currency` | Store currency | select |  |
| `bdtRate` | 1 USD in BDT | number | Used to show the taka amount for bKash, Nagad, Rocket and cards. |
| `instructions` | Instructions shown after ordering | textarea |  |

### bKash

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `bkash.enabled` | Accept this method | switch |  |
| `bkash.number` | Account number | text |  |
| `bkash.accountType` | Account type | select |  |
| `bkash.note` | Instructions | textarea |  |

### Nagad

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `nagad.enabled` | Accept this method | switch |  |
| `nagad.number` | Account number | text |  |
| `nagad.accountType` | Account type | select |  |
| `nagad.note` | Instructions | textarea |  |

### Rocket

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `rocket.enabled` | Accept this method | switch |  |
| `rocket.number` | Account number | text |  |
| `rocket.accountType` | Account type | select |  |
| `rocket.note` | Instructions | textarea |  |

### Bank transfer

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `bank.enabled` | Accept this method | switch |  |
| `bank.bankName` | Bank | text |  |
| `bank.accountName` | Account name | text |  |
| `bank.accountNumber` | Account number | text |  |
| `bank.branch` | Branch | text |  |
| `bank.routing` | Routing number | text |  |
| `bank.swift` | SWIFT code | text |  |
| `bank.note` | Instructions | textarea |  |

### Debit and credit card

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `card.enabled` | Accept cards | switch | Runs through SSLCommerz. Add SSLCZ_STORE_ID and SSLCZ_STORE_PASSWORD to your environment to switch on live card payments. |
| `card.note` | Note | textarea |  |

### PayPal

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `paypal.enabled` | Accept PayPal | switch | With PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET set, buyers pay through PayPal checkout and orders are marked paid automatically. Without them, buyers... |
| `paypal.email` | PayPal email | email |  |
| `paypal.link` | PayPal.me link | url |  |
| `paypal.note` | Instructions | textarea |  |

### Payoneer

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `payoneer.enabled` | Accept Payoneer | switch |  |
| `payoneer.email` | Payoneer email | email |  |
| `payoneer.note` | Instructions | textarea |  |

## SEO and integrations (`integrations`)

- Admin: `/admin/settings/integrations`, area: **system**

### Search engines

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `searchConsole.enabled` | Google Search Console | switch |  |
| `searchConsole.code` | Verification code or meta tag | text | Paste the content value or the whole <meta> tag from Search Console > Settings > Ownership verification > HTML tag. |
| `bing.enabled` | Bing Webmaster Tools | switch |  |
| `bing.code` | Bing verification code | text |  |

### Analytics and ads

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `ga4.enabled` | Google Analytics 4 | switch |  |
| `ga4.id` | Measurement ID | text |  |
| `gtm.enabled` | Google Tag Manager | switch |  |
| `gtm.id` | Container ID | text |  |
| `googleAds.enabled` | Google Ads | switch |  |
| `googleAds.id` | Conversion ID | text |  |
| `googleAds.conversionLabel` | Purchase conversion label (optional) | text |  |
| `metaPixel.enabled` | Meta (Facebook) Pixel | switch |  |
| `metaPixel.id` | Pixel ID | text |  |
| `clarity.enabled` | Microsoft Clarity | switch |  |
| `clarity.id` | Project ID | text |  |

### Custom code

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `customCode.head.enabled` | Add code to <head> on every page | switch |  |
| `customCode.head.code` | Head code | textarea |  |
| `customCode.bodyStart.enabled` | Add code after <body> opens | switch |  |
| `customCode.bodyStart.code` | Body start code | textarea |  |
| `customCode.bodyEnd.enabled` | Add code before </body> (footer) | switch |  |
| `customCode.bodyEnd.code` | Footer code | textarea | Only paste code you trust. It runs on every public page. |

### Chat

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `chat.mode` | Chat on the site | segmented |  |
| `chat.position` | Chat button side | segmented | Which bottom corner the chat button and window sit in, on desktop and phones. Keep it on the opposite side from the Back to Top button (Site and cont... |
| `chat.title` | Window title | text |  |
| `chat.greeting` | Greeting | textarea |  |
| `chat.quickReplies` | Suggested questions | tags |  |
| `chat.ai.provider` | AI answers | segmented |  |
| `chat.ai.model` | Model (optional) | text | Defaults: Gemini gemini-flash-latest, ChatGPT gpt-5-mini, Claude claude-haiku-5-5. The key is read from GEMINI_API_KEY, OPENAI_API_KEY or ANTHROPIC_A... |
| `chat.whatsappHandoff` | Show a WhatsApp link under the chat | switch |  |
| `chat.embedCode` | Embed code from your chat provider | textarea |  |

## Header and footer (`navigation`)

- Admin: `/admin/settings/navigation`, area: **design**

### Header menu

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `header` | Menu links | repeater |  |
| `header[].label` | Label | text | |
| `header[].href` | Link | text | |
| `cta.show` | Show the header button | switch |  |
| `cta.label` | Button text | text |  |
| `cta.href` | Button link | text |  |

### Footer

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `footerColumns` | Footer columns | repeater |  |
| `footerColumns[].title` | Column title | text | |
| `footerColumns[].links` | Links | repeater | |
| `showAppsInFooter` | Show products column | switch |  |
| `appsTitle` | Products column title | text |  |
| `showPagesInFooter` | Show pages marked "Link in footer" | switch |  |
| `bottomText` | Bottom line text | text |  |

## Emails (`email`)

- Admin: `/admin/settings/email`, area: **system**

### Sender

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `fromName` | Sender name | text |  |
| `replyTo` | Reply-to address | email |  |
| `signature` | Signature | textarea |  |

### AI reply

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiReply.provider` | AI provider for replies | segmented | Which AI writes your email replies. Same as the chat uses the choice in Analytics and integrations > Chat. Without a key, a simple template reply is... |
| `aiReply.model` | Model (optional) | text | The exact model name. Empty uses a sensible default: gemini-flash-latest, gpt-5-mini or claude-haiku-5-5. |
| `aiReply.instructions` | Always follow these instructions | textarea | Standing rules for every reply, for example: "Mention that I reply within one working day. Never promise a delivery date before a call. Sign off warm... |

### Thank-you email (contact form and chat)

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `autoReply.enabled` | Send automatically | switch |  |
| `autoReply.subject` | Subject | text | Use {name} for the first name. |
| `autoReply.heading` | Heading | text |  |
| `autoReply.body` | Message | textarea |  |

### Subscriptions (monthly and yearly plans)

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `subscription.reminderDays` | Send a reminder this many days before the end | text | One or more numbers separated by commas. 7, 1 sends one reminder 7 days before and another 1 day before. Each is sent once. |
| `subscription.ownerAlerts` | Also email me (NOTIFY_EMAIL) | switch | On: you get a short email whenever a reminder goes out and whenever a plan expires, so you know who to follow up with. |
| `subscription.reminder.enabled` | Send the reminder email | switch | Off: customers are not warned before their plan ends. |
| `subscription.reminder.subject` | Reminder subject | text | Placeholders: {name} {package} {period} {endDate} {days} {number}. |
| `subscription.reminder.body` | Reminder message | textarea | Placeholders: {name} {package} {period} {endDate} {days} {number}. |
| `subscription.expired.enabled` | Send the plan ended email | switch | Off: customers are not told when their plan ends. |
| `subscription.expired.subject` | Plan ended subject | text | Placeholders: {name} {package} {period} {endDate} {number}. |
| `subscription.expired.body` | Plan ended message | textarea | Placeholders: {name} {package} {period} {endDate} {number}. |

### Order email: Order received

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `orders.placed.enabled` | Send automatically | switch |  |
| `orders.placed.subject` | Subject | text | Use {name}, {number} and {package}. |
| `orders.placed.body` | Message | textarea |  |

### Order email: Payment confirmed

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `orders.paid.enabled` | Send automatically | switch |  |
| `orders.paid.subject` | Subject | text | Use {name}, {number} and {package}. |
| `orders.paid.body` | Message | textarea |  |

### Order email: Work started

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `orders.in_progress.enabled` | Send automatically | switch |  |
| `orders.in_progress.subject` | Subject | text | Use {name}, {number} and {package}. |
| `orders.in_progress.body` | Message | textarea |  |

### Order email: Delivered

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `orders.completed.enabled` | Send automatically | switch |  |
| `orders.completed.subject` | Subject | text | Use {name}, {number} and {package}. |
| `orders.completed.body` | Message | textarea |  |

### Order email: Cancelled

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `orders.cancelled.enabled` | Send automatically | switch |  |
| `orders.cancelled.subject` | Subject | text | Use {name}, {number} and {package}. |
| `orders.cancelled.body` | Message | textarea |  |

## SEO settings (`seo`)

- Admin: `/admin/settings/seo`, area: **seo**

### General

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `titleTemplate` | Title template | text | How page titles are built when a page has no custom meta title. %s becomes the page name, for example "%s \| Manik Hossain". |
| `keywords` | Site keywords | textarea | Extra keywords in a meta tag. Google ignores them, so this is optional. |
| `noindex` | Hide the whole site from search engines (staging only) | switch | Asks every search engine to ignore the whole site and puts Disallow: / in robots.txt. Only for a test copy. Never leave it on for the live site. |
| `defaults.noindexCategories` | Hide blog category pages from Google | switch | Category pages often repeat the same posts as the blog page. Hiding them can avoid thin or duplicate content. Pages you set individually are not chan... |
| `defaults.maxImagePreview` | Image preview size in Google | select | How large Google may show your images in results. Large gets the most attention and is what Google Discover needs. |
| `defaults.twitterCard` | Default X (Twitter) card | select | The default look of shared links on X when a page sets nothing itself. |
| `social.twitter` | X (Twitter) username | text | Your handle, for example @manikhossain. Added to share cards so X can credit you. |
| `social.facebookAppId` | Facebook App ID (optional) | text | Only needed if you use Facebook Insights. Leave empty otherwise. |
| `social.locale` | Language and region | text | The locale for Open Graph, for example en_US or en_GB. |

### Business and local SEO

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `business.type` | Business type | select | The most specific type that fits. ProfessionalService suits freelancers and agencies. Pick LocalBusiness subtypes only if you have a shop or office c... |
| `business.name` | Business name | text | Your trading name exactly as customers know it. |
| `business.legalName` | Legal name (optional) | text | The registered company name if different. |
| `business.foundingDate` | Year started | text | The year the business began, for example 2018. |
| `business.description` | Description | textarea | Two sentences on what you do and who you help. Shown to Google and AI assistants. |
| `business.logo` | Logo | image | A square logo, at least 112 x 112 pixels. Google may show it in results. |
| `business.image` | Main business photo | image | A photo of you, your team or your office. Google may show it in your knowledge panel. |
| `business.phone` | Phone | text | Include the country code, for example +8801650043801. |
| `business.email` | Email | email | Public contact email. |
| `business.priceRange` | Price range | text | Dollar signs from $ (cheap) to $$$$ (premium), or a range like $50-$500. |
| `business.areaServed` | Area served | text | Where you work: a city, a country or Worldwide. |
| `business.street` | Street address | text | Leave empty if you work from home and do not want to show an address. Service-area businesses can leave address fields empty. |
| `business.city` | City | text | Your city. |
| `business.region` | State or region | text | State, division or province. |
| `business.postalCode` | Postal code | text | Your postal or ZIP code. |
| `business.country` | Country code | text | Two-letter country code, for example BD, US, GB. |
| `business.lat` | Latitude | text | Optional map position. Find it by right-clicking your place on Google Maps and copying the first number. |
| `business.lng` | Longitude | text | The second number from Google Maps. |
| `business.mapUrl` | Google Maps link | url | The share link of your Google Business Profile or map pin. Helps Google connect your site to your listing. |
| `business.hours` | Opening hours | repeater | When you are open. Add a row for each different time block. |
| `business.hours[].days` | Days | multiselect | |
| `business.hours[].opens` | Opens | text | |
| `business.hours[].closes` | Closes | text | |
| `business.sameAs` | Other profile links | tags | Links to the same business on other sites, such as your Google Business Profile, LinkedIn, Facebook, Wikidata or Crunchbase. They help Google and AI... |
| `business.knowsAbout` | Topics you are expert in | tags | Subjects you know well. Shown in your Person schema and helps AI assistants know what to recommend you for. |
| `business.ratingValue` | Average rating (1 to 5) | number | Only fill this if the rating comes from real reviews shown on your site. Google can remove rich results for made-up ratings. |
| `business.ratingCount` | Number of reviews | number | How many reviews the average is based on. |

### Schema

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `schema.enabled` | Add structured data (schema) to pages | switch | The master switch. On: every page gets one combined JSON-LD graph with your business, website, breadcrumbs and page-specific data. Turn off only if a... |
| `schema.breadcrumbs` | Breadcrumb schema | switch | Adds Home > Section > Page trails so Google can show a path under your result. |
| `schema.global` | Extra schema on every page (advanced) | json | Optional custom JSON-LD that is merged into every page graph, for example a sitelinks search box or an extra Organization. One object, an array or an... |

### Sitemap

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `sitemap.enabled` | Create sitemap.xml automatically | switch | Turns on your sitemap at /sitemap.xml. It lists every public page and updates itself whenever you publish, edit or move a page to Trash. Off: the sit... |
| `sitemap.images` | Include images | switch | Adds image addresses to the sitemap so Google Images can find your portfolio screenshots and covers. |
| `sitemap.builtin` | Built-in pages (portfolio, blog, pricing...) | switch | Include the fixed pages of your site. |
| `sitemap.pages` | Custom pages | switch | Include pages you created in Pages. |
| `sitemap.projects` | Portfolio projects | switch | Include each project page. |
| `sitemap.posts` | Blog posts | switch | Include each blog post. |
| `sitemap.categories` | Blog categories | switch | Include category pages. Many sites leave these out. |
| `sitemap.caseStudies` | Case studies | switch | Include case study pages (when the feature is on). |
| `sitemap.changefreq` | Default update frequency | select | A hint about how often your pages change. Google mostly ignores it, but other engines use it. |
| `sitemap.exclude` | Always leave out these addresses | tags | Addresses to keep out of the sitemap, one per entry. Use * at the end for a group, for example /landing/*. |

### Robots.txt

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `robots.mode` | How to create robots.txt | segmented | Automatic builds the file from the lists below. Custom lets you write the whole file yourself. |
| `robots.disallow` | Block these addresses | tags | Addresses crawlers must not visit, like /admin or /checkout. They are private or useless for search. Use * as a wildcard. |
| `robots.allow` | Always allow these addresses | tags | Exceptions inside a blocked area. |
| `robots.extra` | Extra lines (advanced) | textarea | Added at the end of the automatic file, for example a Crawl-delay line for one bot. |
| `robots.custom` | Full robots.txt | code | The exact file contents. A Sitemap line is not added for you in this mode. |
| `robots.blockAi` | Block AI training crawlers | multiselect | Stops these bots from reading your site to train AI models. This does not remove you from AI search answers. ChatGPT search, Perplexity and Google AI... |

### AI visibility

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `ai.llms` | Create /llms.txt | switch | A summary file that AI tools can read quickly. It lists your business, services and key pages with short descriptions. It updates itself. |
| `ai.llmsFull` | Create /llms-full.txt | switch | A longer version with the full text of your key pages. Useful for AI tools that want the details without crawling every page. |
| `ai.summary` | One-paragraph summary | textarea | Who you are and what you do, in plain words. This is the first thing an AI reads. Mention your location, services and proof such as years of experien... |
| `ai.details` | Extra notes for AI | textarea | Facts you want AI assistants to know: pricing approach, how to contact you, languages, areas served, what you do not do. |
| `ai.include.pages` | Include custom pages | switch | List your custom pages in llms.txt. |
| `ai.include.services` | Include services and packages | switch | List your packages with prices so AI can answer cost questions correctly. |
| `ai.include.projects` | Include portfolio projects | switch | List your best projects. |
| `ai.include.posts` | Include blog posts | switch | List your articles so AI can cite them. |
| `ai.include.caseStudies` | Include case studies | switch | List your case studies. |

### Fast indexing and redirects

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `indexnow.enabled` | IndexNow: tell Bing and others about changes | switch | When you publish or edit a page, Bing, Yandex, Naver and Seznam are told within minutes instead of waiting days. Google does not use IndexNow. It onl... |
| `indexnow.key` | IndexNow key (optional) | text | Leave empty to use an automatic key. The key file is served at /indexnow-key.txt. |
| `redirects.autoSlug` | Redirect automatically when a URL slug changes | switch | If you rename a page or post, the old address is redirected (301) to the new one, so you keep your Google ranking and no visitor hits a dead link. |
| `redirects.monitor404` | Record pages that were not found (404 log) | switch | Keeps a list of broken addresses visitors tried to open, so you can fix them with a redirect. See Marketing > 404 log. |

## Home page SEO (`seo-home`)

- Admin: `/admin/settings/seo-home`, area: **seo**

### SEO

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiSeo` |  | aiSeo |  |
| `seoPreview` |  | seo |  |
| `focusKeyword` | Focus keyword | text | The main phrase you want this page to rank for on Google. The checklist below grades the page against it, like Rank Math and Yoast do. Use one phrase... |
| `keywords` | Related keywords | tags | Other phrases and synonyms this page should also cover (secondary keywords). They are a reminder for you while writing and are added to the page sche... |
| `seoAnalysis` |  | seoAnalysis |  |
| `seoTitle` | Meta title | text | Shown exactly as typed. About 50 to 60 characters. Leave empty to use the title. |
| `seoDescription` | Meta description | textarea | About 120 to 160 characters. Leave empty to use the short description. |

### Social

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiSocial` |  | aiSeo |  |
| `socialPreview` |  | socialPreview |  |
| `ogTitle` | Social title | text | The headline shown when the link is shared on Facebook, LinkedIn, WhatsApp and X. Leave empty to reuse the meta title. Social titles can be more catc... |
| `ogDescription` | Social description | textarea | The short text under the headline on social cards. Leave empty to reuse the meta description. |
| `seoImage` | Social share image | image | For Facebook, LinkedIn, WhatsApp and X. 1200 x 630 works best. Leave empty to use the main image. |
| `twitterCard` | X (Twitter) card | segmented | How the link looks on X. Large image fills the width of the post and gets more clicks. Small shows a square thumbnail next to the text. |

### Schema

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiSchema` |  | aiSeo |  |
| `schemaPanel` |  | schemaPanel |  |
| `schemaMarkup.type` | Schema type | select | Automatic picks the right type for you (blog post, project, FAQ...). Choose a type when this page is something specific, like a service you sell, an... |
| `schemaMarkup.name` | Name or headline | text | The name of the thing this page describes. Empty uses the page title. |
| `schemaMarkup.description` | Description | textarea | One or two sentences. Empty uses the meta description. |
| `schemaMarkup.image` | Image | image | The main image for this schema item. Empty uses the share image or main image. |
| `schemaMarkup.serviceType` | Service type | text | The category of service, for example Web design, SEO audit or Website maintenance. |
| `schemaMarkup.areaServed` | Area served | text | Where you offer it: a city, a country or Worldwide. |
| `schemaMarkup.brand` | Brand | text | The brand or maker of the product. |
| `schemaMarkup.sku` | SKU or product code | text | Your own product code. Optional. |
| `schemaMarkup.appCategory` | App category | text | Google expects a value like BusinessApplication, DeveloperApplication or GameApplication. |
| `schemaMarkup.os` | Operating system | text | Where the app runs. |
| `schemaMarkup.price` | Price | number | The price people pay. Google can show it under your result. Use 0 for free. |
| `schemaMarkup.currency` | Currency | text | Three-letter currency code, for example USD, BDT or EUR. |
| `schemaMarkup.availability` | Availability | select | Whether people can buy or book it right now. |
| `schemaMarkup.ratingValue` | Average rating (1 to 5) | number | Your real average review score. Only add real ratings: Google can penalise made-up ones. |
| `schemaMarkup.ratingCount` | Number of reviews | number | How many reviews the average is based on. |
| `schemaMarkup.startDate` | Starts | datetime | Date and time the event begins. |
| `schemaMarkup.endDate` | Ends | datetime | Date and time the event ends. |
| `schemaMarkup.attendance` | Where it happens | segmented | In person, online or both. Google shows online events differently. |
| `schemaMarkup.locationName` | Venue name | text | The name of the place, for example Dhaka Convention Centre. |
| `schemaMarkup.address` | Venue address | text | Street, city and country of the venue. |
| `schemaMarkup.eventUrl` | Online event link | url | The page or meeting link where people join. |
| `schemaMarkup.totalTime` | Total time | text | How long it takes, in ISO format: PT30M is 30 minutes, PT1H30M is 1.5 hours. |
| `schemaMarkup.steps` | Steps | repeater | The steps in order. Google can show them as a numbered guide. |
| `schemaMarkup.steps[].name` | Step title | text | |
| `schemaMarkup.steps[].text` | What to do | textarea | |
| `schemaMarkup.videoUrl` | Video link | url | YouTube, Vimeo or a direct video file link. |
| `schemaMarkup.uploadDate` | Upload date | date | When the video was published. Required by Google for video results. |
| `schemaMarkup.duration` | Length | text | Video length in ISO format: PT2M30S is 2 minutes 30 seconds. |
| `schemaMarkup.faq` | Questions | repeater | Questions and answers for the FAQ schema. Leave empty to use the FAQ sections already on the page. |
| `schemaMarkup.faq[].q` | Question | text | |
| `schemaMarkup.faq[].a` | Answer | textarea | |
| `schemaMarkup.custom` | Custom JSON-LD (advanced) | json | Paste extra schema from a generator or Google docs. One object, an array of objects, or an object with @graph. It is merged into the single combined... |

### Advanced

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `canonical` | Canonical URL | url | Tells Google which address is the original when the same content exists in two places. Leave empty in almost every case. Only fill it if this page co... |
| `seoNoindex` | Hide this page from Google (noindex) | switch |  |
| `robots.nofollow` | Do not follow links on this page (nofollow) | switch | Asks search engines not to pass ranking value through the links on this page. Rarely needed, for example on pages full of paid or untrusted links. |
| `robots.noarchive` | No cached copy (noarchive) | switch | Asks search engines not to keep a cached copy of the page. Useful for prices or offers that change often. |
| `robots.nosnippet` | No text preview (nosnippet) | switch | Google shows the title only, with no description text and no AI overview quote from this page. Usually lowers clicks, so use with care. |
| `robots.noimageindex` | Keep images out of Google Images | switch | Asks Google not to show images from this page in image search. |
| `sitemap.exclude` | Leave out of the sitemap | switch | The page stays live and indexable, but is not listed in sitemap.xml. Pages set to noindex are always left out automatically. |
| `sitemap.priority` | Sitemap priority | select | How important this page is compared with your other pages (1.0 highest). A hint only; empty uses a sensible default. |
| `sitemap.changefreq` | How often it changes | select | A hint for search engines about how often to check this page again. Empty uses the default from SEO settings. |
| `breadcrumbTitle` | Breadcrumb title | text | A shorter name for this page in breadcrumbs and the breadcrumb schema, for example 'Pricing' instead of a long headline. Empty uses the title. |

### Code

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `code.head` | Code in <head> for this page | code | Added inside <head> only on this page. For a page-specific tracking pixel, verification tag, font or script. |
| `code.bodyStart` | Code after <body> opens | code | Added right after <body> starts, only on this page. For snippets that must load first. |
| `code.bodyEnd` | Code before </body> | code | Added at the very end of this page. For widgets, conversion scripts or anything that can load last. |
| `code.css` | Custom CSS for this page | code | Style rules that apply only on this page, for example .h-display { color: #fff }. No <style> tag needed. |

## Portfolio page SEO (`seo-portfolio`)

- Admin: `/admin/settings/seo-portfolio`, area: **seo**

### SEO

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiSeo` |  | aiSeo |  |
| `seoPreview` |  | seo |  |
| `focusKeyword` | Focus keyword | text | The main phrase you want this page to rank for on Google. The checklist below grades the page against it, like Rank Math and Yoast do. Use one phrase... |
| `keywords` | Related keywords | tags | Other phrases and synonyms this page should also cover (secondary keywords). They are a reminder for you while writing and are added to the page sche... |
| `seoAnalysis` |  | seoAnalysis |  |
| `seoTitle` | Meta title | text | Shown exactly as typed. About 50 to 60 characters. Leave empty to use the title. |
| `seoDescription` | Meta description | textarea | About 120 to 160 characters. Leave empty to use the short description. |

### Social

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiSocial` |  | aiSeo |  |
| `socialPreview` |  | socialPreview |  |
| `ogTitle` | Social title | text | The headline shown when the link is shared on Facebook, LinkedIn, WhatsApp and X. Leave empty to reuse the meta title. Social titles can be more catc... |
| `ogDescription` | Social description | textarea | The short text under the headline on social cards. Leave empty to reuse the meta description. |
| `seoImage` | Social share image | image | For Facebook, LinkedIn, WhatsApp and X. 1200 x 630 works best. Leave empty to use the main image. |
| `twitterCard` | X (Twitter) card | segmented | How the link looks on X. Large image fills the width of the post and gets more clicks. Small shows a square thumbnail next to the text. |

### Schema

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiSchema` |  | aiSeo |  |
| `schemaPanel` |  | schemaPanel |  |
| `schemaMarkup.type` | Schema type | select | Automatic picks the right type for you (blog post, project, FAQ...). Choose a type when this page is something specific, like a service you sell, an... |
| `schemaMarkup.name` | Name or headline | text | The name of the thing this page describes. Empty uses the page title. |
| `schemaMarkup.description` | Description | textarea | One or two sentences. Empty uses the meta description. |
| `schemaMarkup.image` | Image | image | The main image for this schema item. Empty uses the share image or main image. |
| `schemaMarkup.serviceType` | Service type | text | The category of service, for example Web design, SEO audit or Website maintenance. |
| `schemaMarkup.areaServed` | Area served | text | Where you offer it: a city, a country or Worldwide. |
| `schemaMarkup.brand` | Brand | text | The brand or maker of the product. |
| `schemaMarkup.sku` | SKU or product code | text | Your own product code. Optional. |
| `schemaMarkup.appCategory` | App category | text | Google expects a value like BusinessApplication, DeveloperApplication or GameApplication. |
| `schemaMarkup.os` | Operating system | text | Where the app runs. |
| `schemaMarkup.price` | Price | number | The price people pay. Google can show it under your result. Use 0 for free. |
| `schemaMarkup.currency` | Currency | text | Three-letter currency code, for example USD, BDT or EUR. |
| `schemaMarkup.availability` | Availability | select | Whether people can buy or book it right now. |
| `schemaMarkup.ratingValue` | Average rating (1 to 5) | number | Your real average review score. Only add real ratings: Google can penalise made-up ones. |
| `schemaMarkup.ratingCount` | Number of reviews | number | How many reviews the average is based on. |
| `schemaMarkup.startDate` | Starts | datetime | Date and time the event begins. |
| `schemaMarkup.endDate` | Ends | datetime | Date and time the event ends. |
| `schemaMarkup.attendance` | Where it happens | segmented | In person, online or both. Google shows online events differently. |
| `schemaMarkup.locationName` | Venue name | text | The name of the place, for example Dhaka Convention Centre. |
| `schemaMarkup.address` | Venue address | text | Street, city and country of the venue. |
| `schemaMarkup.eventUrl` | Online event link | url | The page or meeting link where people join. |
| `schemaMarkup.totalTime` | Total time | text | How long it takes, in ISO format: PT30M is 30 minutes, PT1H30M is 1.5 hours. |
| `schemaMarkup.steps` | Steps | repeater | The steps in order. Google can show them as a numbered guide. |
| `schemaMarkup.steps[].name` | Step title | text | |
| `schemaMarkup.steps[].text` | What to do | textarea | |
| `schemaMarkup.videoUrl` | Video link | url | YouTube, Vimeo or a direct video file link. |
| `schemaMarkup.uploadDate` | Upload date | date | When the video was published. Required by Google for video results. |
| `schemaMarkup.duration` | Length | text | Video length in ISO format: PT2M30S is 2 minutes 30 seconds. |
| `schemaMarkup.faq` | Questions | repeater | Questions and answers for the FAQ schema. Leave empty to use the FAQ sections already on the page. |
| `schemaMarkup.faq[].q` | Question | text | |
| `schemaMarkup.faq[].a` | Answer | textarea | |
| `schemaMarkup.custom` | Custom JSON-LD (advanced) | json | Paste extra schema from a generator or Google docs. One object, an array of objects, or an object with @graph. It is merged into the single combined... |

### Advanced

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `canonical` | Canonical URL | url | Tells Google which address is the original when the same content exists in two places. Leave empty in almost every case. Only fill it if this page co... |
| `seoNoindex` | Hide this page from Google (noindex) | switch |  |
| `robots.nofollow` | Do not follow links on this page (nofollow) | switch | Asks search engines not to pass ranking value through the links on this page. Rarely needed, for example on pages full of paid or untrusted links. |
| `robots.noarchive` | No cached copy (noarchive) | switch | Asks search engines not to keep a cached copy of the page. Useful for prices or offers that change often. |
| `robots.nosnippet` | No text preview (nosnippet) | switch | Google shows the title only, with no description text and no AI overview quote from this page. Usually lowers clicks, so use with care. |
| `robots.noimageindex` | Keep images out of Google Images | switch | Asks Google not to show images from this page in image search. |
| `sitemap.exclude` | Leave out of the sitemap | switch | The page stays live and indexable, but is not listed in sitemap.xml. Pages set to noindex are always left out automatically. |
| `sitemap.priority` | Sitemap priority | select | How important this page is compared with your other pages (1.0 highest). A hint only; empty uses a sensible default. |
| `sitemap.changefreq` | How often it changes | select | A hint for search engines about how often to check this page again. Empty uses the default from SEO settings. |
| `breadcrumbTitle` | Breadcrumb title | text | A shorter name for this page in breadcrumbs and the breadcrumb schema, for example 'Pricing' instead of a long headline. Empty uses the title. |

### Code

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `code.head` | Code in <head> for this page | code | Added inside <head> only on this page. For a page-specific tracking pixel, verification tag, font or script. |
| `code.bodyStart` | Code after <body> opens | code | Added right after <body> starts, only on this page. For snippets that must load first. |
| `code.bodyEnd` | Code before </body> | code | Added at the very end of this page. For widgets, conversion scripts or anything that can load last. |
| `code.css` | Custom CSS for this page | code | Style rules that apply only on this page, for example .h-display { color: #fff }. No <style> tag needed. |

## Blog page SEO (`seo-blog`)

- Admin: `/admin/settings/seo-blog`, area: **seo**

### SEO

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiSeo` |  | aiSeo |  |
| `seoPreview` |  | seo |  |
| `focusKeyword` | Focus keyword | text | The main phrase you want this page to rank for on Google. The checklist below grades the page against it, like Rank Math and Yoast do. Use one phrase... |
| `keywords` | Related keywords | tags | Other phrases and synonyms this page should also cover (secondary keywords). They are a reminder for you while writing and are added to the page sche... |
| `seoAnalysis` |  | seoAnalysis |  |
| `seoTitle` | Meta title | text | Shown exactly as typed. About 50 to 60 characters. Leave empty to use the title. |
| `seoDescription` | Meta description | textarea | About 120 to 160 characters. Leave empty to use the short description. |

### Social

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiSocial` |  | aiSeo |  |
| `socialPreview` |  | socialPreview |  |
| `ogTitle` | Social title | text | The headline shown when the link is shared on Facebook, LinkedIn, WhatsApp and X. Leave empty to reuse the meta title. Social titles can be more catc... |
| `ogDescription` | Social description | textarea | The short text under the headline on social cards. Leave empty to reuse the meta description. |
| `seoImage` | Social share image | image | For Facebook, LinkedIn, WhatsApp and X. 1200 x 630 works best. Leave empty to use the main image. |
| `twitterCard` | X (Twitter) card | segmented | How the link looks on X. Large image fills the width of the post and gets more clicks. Small shows a square thumbnail next to the text. |

### Schema

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiSchema` |  | aiSeo |  |
| `schemaPanel` |  | schemaPanel |  |
| `schemaMarkup.type` | Schema type | select | Automatic picks the right type for you (blog post, project, FAQ...). Choose a type when this page is something specific, like a service you sell, an... |
| `schemaMarkup.name` | Name or headline | text | The name of the thing this page describes. Empty uses the page title. |
| `schemaMarkup.description` | Description | textarea | One or two sentences. Empty uses the meta description. |
| `schemaMarkup.image` | Image | image | The main image for this schema item. Empty uses the share image or main image. |
| `schemaMarkup.serviceType` | Service type | text | The category of service, for example Web design, SEO audit or Website maintenance. |
| `schemaMarkup.areaServed` | Area served | text | Where you offer it: a city, a country or Worldwide. |
| `schemaMarkup.brand` | Brand | text | The brand or maker of the product. |
| `schemaMarkup.sku` | SKU or product code | text | Your own product code. Optional. |
| `schemaMarkup.appCategory` | App category | text | Google expects a value like BusinessApplication, DeveloperApplication or GameApplication. |
| `schemaMarkup.os` | Operating system | text | Where the app runs. |
| `schemaMarkup.price` | Price | number | The price people pay. Google can show it under your result. Use 0 for free. |
| `schemaMarkup.currency` | Currency | text | Three-letter currency code, for example USD, BDT or EUR. |
| `schemaMarkup.availability` | Availability | select | Whether people can buy or book it right now. |
| `schemaMarkup.ratingValue` | Average rating (1 to 5) | number | Your real average review score. Only add real ratings: Google can penalise made-up ones. |
| `schemaMarkup.ratingCount` | Number of reviews | number | How many reviews the average is based on. |
| `schemaMarkup.startDate` | Starts | datetime | Date and time the event begins. |
| `schemaMarkup.endDate` | Ends | datetime | Date and time the event ends. |
| `schemaMarkup.attendance` | Where it happens | segmented | In person, online or both. Google shows online events differently. |
| `schemaMarkup.locationName` | Venue name | text | The name of the place, for example Dhaka Convention Centre. |
| `schemaMarkup.address` | Venue address | text | Street, city and country of the venue. |
| `schemaMarkup.eventUrl` | Online event link | url | The page or meeting link where people join. |
| `schemaMarkup.totalTime` | Total time | text | How long it takes, in ISO format: PT30M is 30 minutes, PT1H30M is 1.5 hours. |
| `schemaMarkup.steps` | Steps | repeater | The steps in order. Google can show them as a numbered guide. |
| `schemaMarkup.steps[].name` | Step title | text | |
| `schemaMarkup.steps[].text` | What to do | textarea | |
| `schemaMarkup.videoUrl` | Video link | url | YouTube, Vimeo or a direct video file link. |
| `schemaMarkup.uploadDate` | Upload date | date | When the video was published. Required by Google for video results. |
| `schemaMarkup.duration` | Length | text | Video length in ISO format: PT2M30S is 2 minutes 30 seconds. |
| `schemaMarkup.faq` | Questions | repeater | Questions and answers for the FAQ schema. Leave empty to use the FAQ sections already on the page. |
| `schemaMarkup.faq[].q` | Question | text | |
| `schemaMarkup.faq[].a` | Answer | textarea | |
| `schemaMarkup.custom` | Custom JSON-LD (advanced) | json | Paste extra schema from a generator or Google docs. One object, an array of objects, or an object with @graph. It is merged into the single combined... |

### Advanced

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `canonical` | Canonical URL | url | Tells Google which address is the original when the same content exists in two places. Leave empty in almost every case. Only fill it if this page co... |
| `seoNoindex` | Hide this page from Google (noindex) | switch |  |
| `robots.nofollow` | Do not follow links on this page (nofollow) | switch | Asks search engines not to pass ranking value through the links on this page. Rarely needed, for example on pages full of paid or untrusted links. |
| `robots.noarchive` | No cached copy (noarchive) | switch | Asks search engines not to keep a cached copy of the page. Useful for prices or offers that change often. |
| `robots.nosnippet` | No text preview (nosnippet) | switch | Google shows the title only, with no description text and no AI overview quote from this page. Usually lowers clicks, so use with care. |
| `robots.noimageindex` | Keep images out of Google Images | switch | Asks Google not to show images from this page in image search. |
| `sitemap.exclude` | Leave out of the sitemap | switch | The page stays live and indexable, but is not listed in sitemap.xml. Pages set to noindex are always left out automatically. |
| `sitemap.priority` | Sitemap priority | select | How important this page is compared with your other pages (1.0 highest). A hint only; empty uses a sensible default. |
| `sitemap.changefreq` | How often it changes | select | A hint for search engines about how often to check this page again. Empty uses the default from SEO settings. |
| `breadcrumbTitle` | Breadcrumb title | text | A shorter name for this page in breadcrumbs and the breadcrumb schema, for example 'Pricing' instead of a long headline. Empty uses the title. |

### Code

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `code.head` | Code in <head> for this page | code | Added inside <head> only on this page. For a page-specific tracking pixel, verification tag, font or script. |
| `code.bodyStart` | Code after <body> opens | code | Added right after <body> starts, only on this page. For snippets that must load first. |
| `code.bodyEnd` | Code before </body> | code | Added at the very end of this page. For widgets, conversion scripts or anything that can load last. |
| `code.css` | Custom CSS for this page | code | Style rules that apply only on this page, for example .h-display { color: #fff }. No <style> tag needed. |

## Resume page SEO (`seo-resume`)

- Admin: `/admin/settings/seo-resume`, area: **seo**

### SEO

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiSeo` |  | aiSeo |  |
| `seoPreview` |  | seo |  |
| `focusKeyword` | Focus keyword | text | The main phrase you want this page to rank for on Google. The checklist below grades the page against it, like Rank Math and Yoast do. Use one phrase... |
| `keywords` | Related keywords | tags | Other phrases and synonyms this page should also cover (secondary keywords). They are a reminder for you while writing and are added to the page sche... |
| `seoAnalysis` |  | seoAnalysis |  |
| `seoTitle` | Meta title | text | Shown exactly as typed. About 50 to 60 characters. Leave empty to use the title. |
| `seoDescription` | Meta description | textarea | About 120 to 160 characters. Leave empty to use the short description. |

### Social

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiSocial` |  | aiSeo |  |
| `socialPreview` |  | socialPreview |  |
| `ogTitle` | Social title | text | The headline shown when the link is shared on Facebook, LinkedIn, WhatsApp and X. Leave empty to reuse the meta title. Social titles can be more catc... |
| `ogDescription` | Social description | textarea | The short text under the headline on social cards. Leave empty to reuse the meta description. |
| `seoImage` | Social share image | image | For Facebook, LinkedIn, WhatsApp and X. 1200 x 630 works best. Leave empty to use the main image. |
| `twitterCard` | X (Twitter) card | segmented | How the link looks on X. Large image fills the width of the post and gets more clicks. Small shows a square thumbnail next to the text. |

### Schema

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiSchema` |  | aiSeo |  |
| `schemaPanel` |  | schemaPanel |  |
| `schemaMarkup.type` | Schema type | select | Automatic picks the right type for you (blog post, project, FAQ...). Choose a type when this page is something specific, like a service you sell, an... |
| `schemaMarkup.name` | Name or headline | text | The name of the thing this page describes. Empty uses the page title. |
| `schemaMarkup.description` | Description | textarea | One or two sentences. Empty uses the meta description. |
| `schemaMarkup.image` | Image | image | The main image for this schema item. Empty uses the share image or main image. |
| `schemaMarkup.serviceType` | Service type | text | The category of service, for example Web design, SEO audit or Website maintenance. |
| `schemaMarkup.areaServed` | Area served | text | Where you offer it: a city, a country or Worldwide. |
| `schemaMarkup.brand` | Brand | text | The brand or maker of the product. |
| `schemaMarkup.sku` | SKU or product code | text | Your own product code. Optional. |
| `schemaMarkup.appCategory` | App category | text | Google expects a value like BusinessApplication, DeveloperApplication or GameApplication. |
| `schemaMarkup.os` | Operating system | text | Where the app runs. |
| `schemaMarkup.price` | Price | number | The price people pay. Google can show it under your result. Use 0 for free. |
| `schemaMarkup.currency` | Currency | text | Three-letter currency code, for example USD, BDT or EUR. |
| `schemaMarkup.availability` | Availability | select | Whether people can buy or book it right now. |
| `schemaMarkup.ratingValue` | Average rating (1 to 5) | number | Your real average review score. Only add real ratings: Google can penalise made-up ones. |
| `schemaMarkup.ratingCount` | Number of reviews | number | How many reviews the average is based on. |
| `schemaMarkup.startDate` | Starts | datetime | Date and time the event begins. |
| `schemaMarkup.endDate` | Ends | datetime | Date and time the event ends. |
| `schemaMarkup.attendance` | Where it happens | segmented | In person, online or both. Google shows online events differently. |
| `schemaMarkup.locationName` | Venue name | text | The name of the place, for example Dhaka Convention Centre. |
| `schemaMarkup.address` | Venue address | text | Street, city and country of the venue. |
| `schemaMarkup.eventUrl` | Online event link | url | The page or meeting link where people join. |
| `schemaMarkup.totalTime` | Total time | text | How long it takes, in ISO format: PT30M is 30 minutes, PT1H30M is 1.5 hours. |
| `schemaMarkup.steps` | Steps | repeater | The steps in order. Google can show them as a numbered guide. |
| `schemaMarkup.steps[].name` | Step title | text | |
| `schemaMarkup.steps[].text` | What to do | textarea | |
| `schemaMarkup.videoUrl` | Video link | url | YouTube, Vimeo or a direct video file link. |
| `schemaMarkup.uploadDate` | Upload date | date | When the video was published. Required by Google for video results. |
| `schemaMarkup.duration` | Length | text | Video length in ISO format: PT2M30S is 2 minutes 30 seconds. |
| `schemaMarkup.faq` | Questions | repeater | Questions and answers for the FAQ schema. Leave empty to use the FAQ sections already on the page. |
| `schemaMarkup.faq[].q` | Question | text | |
| `schemaMarkup.faq[].a` | Answer | textarea | |
| `schemaMarkup.custom` | Custom JSON-LD (advanced) | json | Paste extra schema from a generator or Google docs. One object, an array of objects, or an object with @graph. It is merged into the single combined... |

### Advanced

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `canonical` | Canonical URL | url | Tells Google which address is the original when the same content exists in two places. Leave empty in almost every case. Only fill it if this page co... |
| `seoNoindex` | Hide this page from Google (noindex) | switch |  |
| `robots.nofollow` | Do not follow links on this page (nofollow) | switch | Asks search engines not to pass ranking value through the links on this page. Rarely needed, for example on pages full of paid or untrusted links. |
| `robots.noarchive` | No cached copy (noarchive) | switch | Asks search engines not to keep a cached copy of the page. Useful for prices or offers that change often. |
| `robots.nosnippet` | No text preview (nosnippet) | switch | Google shows the title only, with no description text and no AI overview quote from this page. Usually lowers clicks, so use with care. |
| `robots.noimageindex` | Keep images out of Google Images | switch | Asks Google not to show images from this page in image search. |
| `sitemap.exclude` | Leave out of the sitemap | switch | The page stays live and indexable, but is not listed in sitemap.xml. Pages set to noindex are always left out automatically. |
| `sitemap.priority` | Sitemap priority | select | How important this page is compared with your other pages (1.0 highest). A hint only; empty uses a sensible default. |
| `sitemap.changefreq` | How often it changes | select | A hint for search engines about how often to check this page again. Empty uses the default from SEO settings. |
| `breadcrumbTitle` | Breadcrumb title | text | A shorter name for this page in breadcrumbs and the breadcrumb schema, for example 'Pricing' instead of a long headline. Empty uses the title. |

### Code

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `code.head` | Code in <head> for this page | code | Added inside <head> only on this page. For a page-specific tracking pixel, verification tag, font or script. |
| `code.bodyStart` | Code after <body> opens | code | Added right after <body> starts, only on this page. For snippets that must load first. |
| `code.bodyEnd` | Code before </body> | code | Added at the very end of this page. For widgets, conversion scripts or anything that can load last. |
| `code.css` | Custom CSS for this page | code | Style rules that apply only on this page, for example .h-display { color: #fff }. No <style> tag needed. |

## Pricing page SEO (`seo-pricing`)

- Admin: `/admin/settings/seo-pricing`, area: **seo**

### SEO

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiSeo` |  | aiSeo |  |
| `seoPreview` |  | seo |  |
| `focusKeyword` | Focus keyword | text | The main phrase you want this page to rank for on Google. The checklist below grades the page against it, like Rank Math and Yoast do. Use one phrase... |
| `keywords` | Related keywords | tags | Other phrases and synonyms this page should also cover (secondary keywords). They are a reminder for you while writing and are added to the page sche... |
| `seoAnalysis` |  | seoAnalysis |  |
| `seoTitle` | Meta title | text | Shown exactly as typed. About 50 to 60 characters. Leave empty to use the title. |
| `seoDescription` | Meta description | textarea | About 120 to 160 characters. Leave empty to use the short description. |

### Social

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiSocial` |  | aiSeo |  |
| `socialPreview` |  | socialPreview |  |
| `ogTitle` | Social title | text | The headline shown when the link is shared on Facebook, LinkedIn, WhatsApp and X. Leave empty to reuse the meta title. Social titles can be more catc... |
| `ogDescription` | Social description | textarea | The short text under the headline on social cards. Leave empty to reuse the meta description. |
| `seoImage` | Social share image | image | For Facebook, LinkedIn, WhatsApp and X. 1200 x 630 works best. Leave empty to use the main image. |
| `twitterCard` | X (Twitter) card | segmented | How the link looks on X. Large image fills the width of the post and gets more clicks. Small shows a square thumbnail next to the text. |

### Schema

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiSchema` |  | aiSeo |  |
| `schemaPanel` |  | schemaPanel |  |
| `schemaMarkup.type` | Schema type | select | Automatic picks the right type for you (blog post, project, FAQ...). Choose a type when this page is something specific, like a service you sell, an... |
| `schemaMarkup.name` | Name or headline | text | The name of the thing this page describes. Empty uses the page title. |
| `schemaMarkup.description` | Description | textarea | One or two sentences. Empty uses the meta description. |
| `schemaMarkup.image` | Image | image | The main image for this schema item. Empty uses the share image or main image. |
| `schemaMarkup.serviceType` | Service type | text | The category of service, for example Web design, SEO audit or Website maintenance. |
| `schemaMarkup.areaServed` | Area served | text | Where you offer it: a city, a country or Worldwide. |
| `schemaMarkup.brand` | Brand | text | The brand or maker of the product. |
| `schemaMarkup.sku` | SKU or product code | text | Your own product code. Optional. |
| `schemaMarkup.appCategory` | App category | text | Google expects a value like BusinessApplication, DeveloperApplication or GameApplication. |
| `schemaMarkup.os` | Operating system | text | Where the app runs. |
| `schemaMarkup.price` | Price | number | The price people pay. Google can show it under your result. Use 0 for free. |
| `schemaMarkup.currency` | Currency | text | Three-letter currency code, for example USD, BDT or EUR. |
| `schemaMarkup.availability` | Availability | select | Whether people can buy or book it right now. |
| `schemaMarkup.ratingValue` | Average rating (1 to 5) | number | Your real average review score. Only add real ratings: Google can penalise made-up ones. |
| `schemaMarkup.ratingCount` | Number of reviews | number | How many reviews the average is based on. |
| `schemaMarkup.startDate` | Starts | datetime | Date and time the event begins. |
| `schemaMarkup.endDate` | Ends | datetime | Date and time the event ends. |
| `schemaMarkup.attendance` | Where it happens | segmented | In person, online or both. Google shows online events differently. |
| `schemaMarkup.locationName` | Venue name | text | The name of the place, for example Dhaka Convention Centre. |
| `schemaMarkup.address` | Venue address | text | Street, city and country of the venue. |
| `schemaMarkup.eventUrl` | Online event link | url | The page or meeting link where people join. |
| `schemaMarkup.totalTime` | Total time | text | How long it takes, in ISO format: PT30M is 30 minutes, PT1H30M is 1.5 hours. |
| `schemaMarkup.steps` | Steps | repeater | The steps in order. Google can show them as a numbered guide. |
| `schemaMarkup.steps[].name` | Step title | text | |
| `schemaMarkup.steps[].text` | What to do | textarea | |
| `schemaMarkup.videoUrl` | Video link | url | YouTube, Vimeo or a direct video file link. |
| `schemaMarkup.uploadDate` | Upload date | date | When the video was published. Required by Google for video results. |
| `schemaMarkup.duration` | Length | text | Video length in ISO format: PT2M30S is 2 minutes 30 seconds. |
| `schemaMarkup.faq` | Questions | repeater | Questions and answers for the FAQ schema. Leave empty to use the FAQ sections already on the page. |
| `schemaMarkup.faq[].q` | Question | text | |
| `schemaMarkup.faq[].a` | Answer | textarea | |
| `schemaMarkup.custom` | Custom JSON-LD (advanced) | json | Paste extra schema from a generator or Google docs. One object, an array of objects, or an object with @graph. It is merged into the single combined... |

### Advanced

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `canonical` | Canonical URL | url | Tells Google which address is the original when the same content exists in two places. Leave empty in almost every case. Only fill it if this page co... |
| `seoNoindex` | Hide this page from Google (noindex) | switch |  |
| `robots.nofollow` | Do not follow links on this page (nofollow) | switch | Asks search engines not to pass ranking value through the links on this page. Rarely needed, for example on pages full of paid or untrusted links. |
| `robots.noarchive` | No cached copy (noarchive) | switch | Asks search engines not to keep a cached copy of the page. Useful for prices or offers that change often. |
| `robots.nosnippet` | No text preview (nosnippet) | switch | Google shows the title only, with no description text and no AI overview quote from this page. Usually lowers clicks, so use with care. |
| `robots.noimageindex` | Keep images out of Google Images | switch | Asks Google not to show images from this page in image search. |
| `sitemap.exclude` | Leave out of the sitemap | switch | The page stays live and indexable, but is not listed in sitemap.xml. Pages set to noindex are always left out automatically. |
| `sitemap.priority` | Sitemap priority | select | How important this page is compared with your other pages (1.0 highest). A hint only; empty uses a sensible default. |
| `sitemap.changefreq` | How often it changes | select | A hint for search engines about how often to check this page again. Empty uses the default from SEO settings. |
| `breadcrumbTitle` | Breadcrumb title | text | A shorter name for this page in breadcrumbs and the breadcrumb schema, for example 'Pricing' instead of a long headline. Empty uses the title. |

### Code

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `code.head` | Code in <head> for this page | code | Added inside <head> only on this page. For a page-specific tracking pixel, verification tag, font or script. |
| `code.bodyStart` | Code after <body> opens | code | Added right after <body> starts, only on this page. For snippets that must load first. |
| `code.bodyEnd` | Code before </body> | code | Added at the very end of this page. For widgets, conversion scripts or anything that can load last. |
| `code.css` | Custom CSS for this page | code | Style rules that apply only on this page, for example .h-display { color: #fff }. No <style> tag needed. |

## Contact page SEO (`seo-contact`)

- Admin: `/admin/settings/seo-contact`, area: **seo**

### SEO

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiSeo` |  | aiSeo |  |
| `seoPreview` |  | seo |  |
| `focusKeyword` | Focus keyword | text | The main phrase you want this page to rank for on Google. The checklist below grades the page against it, like Rank Math and Yoast do. Use one phrase... |
| `keywords` | Related keywords | tags | Other phrases and synonyms this page should also cover (secondary keywords). They are a reminder for you while writing and are added to the page sche... |
| `seoAnalysis` |  | seoAnalysis |  |
| `seoTitle` | Meta title | text | Shown exactly as typed. About 50 to 60 characters. Leave empty to use the title. |
| `seoDescription` | Meta description | textarea | About 120 to 160 characters. Leave empty to use the short description. |

### Social

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiSocial` |  | aiSeo |  |
| `socialPreview` |  | socialPreview |  |
| `ogTitle` | Social title | text | The headline shown when the link is shared on Facebook, LinkedIn, WhatsApp and X. Leave empty to reuse the meta title. Social titles can be more catc... |
| `ogDescription` | Social description | textarea | The short text under the headline on social cards. Leave empty to reuse the meta description. |
| `seoImage` | Social share image | image | For Facebook, LinkedIn, WhatsApp and X. 1200 x 630 works best. Leave empty to use the main image. |
| `twitterCard` | X (Twitter) card | segmented | How the link looks on X. Large image fills the width of the post and gets more clicks. Small shows a square thumbnail next to the text. |

### Schema

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiSchema` |  | aiSeo |  |
| `schemaPanel` |  | schemaPanel |  |
| `schemaMarkup.type` | Schema type | select | Automatic picks the right type for you (blog post, project, FAQ...). Choose a type when this page is something specific, like a service you sell, an... |
| `schemaMarkup.name` | Name or headline | text | The name of the thing this page describes. Empty uses the page title. |
| `schemaMarkup.description` | Description | textarea | One or two sentences. Empty uses the meta description. |
| `schemaMarkup.image` | Image | image | The main image for this schema item. Empty uses the share image or main image. |
| `schemaMarkup.serviceType` | Service type | text | The category of service, for example Web design, SEO audit or Website maintenance. |
| `schemaMarkup.areaServed` | Area served | text | Where you offer it: a city, a country or Worldwide. |
| `schemaMarkup.brand` | Brand | text | The brand or maker of the product. |
| `schemaMarkup.sku` | SKU or product code | text | Your own product code. Optional. |
| `schemaMarkup.appCategory` | App category | text | Google expects a value like BusinessApplication, DeveloperApplication or GameApplication. |
| `schemaMarkup.os` | Operating system | text | Where the app runs. |
| `schemaMarkup.price` | Price | number | The price people pay. Google can show it under your result. Use 0 for free. |
| `schemaMarkup.currency` | Currency | text | Three-letter currency code, for example USD, BDT or EUR. |
| `schemaMarkup.availability` | Availability | select | Whether people can buy or book it right now. |
| `schemaMarkup.ratingValue` | Average rating (1 to 5) | number | Your real average review score. Only add real ratings: Google can penalise made-up ones. |
| `schemaMarkup.ratingCount` | Number of reviews | number | How many reviews the average is based on. |
| `schemaMarkup.startDate` | Starts | datetime | Date and time the event begins. |
| `schemaMarkup.endDate` | Ends | datetime | Date and time the event ends. |
| `schemaMarkup.attendance` | Where it happens | segmented | In person, online or both. Google shows online events differently. |
| `schemaMarkup.locationName` | Venue name | text | The name of the place, for example Dhaka Convention Centre. |
| `schemaMarkup.address` | Venue address | text | Street, city and country of the venue. |
| `schemaMarkup.eventUrl` | Online event link | url | The page or meeting link where people join. |
| `schemaMarkup.totalTime` | Total time | text | How long it takes, in ISO format: PT30M is 30 minutes, PT1H30M is 1.5 hours. |
| `schemaMarkup.steps` | Steps | repeater | The steps in order. Google can show them as a numbered guide. |
| `schemaMarkup.steps[].name` | Step title | text | |
| `schemaMarkup.steps[].text` | What to do | textarea | |
| `schemaMarkup.videoUrl` | Video link | url | YouTube, Vimeo or a direct video file link. |
| `schemaMarkup.uploadDate` | Upload date | date | When the video was published. Required by Google for video results. |
| `schemaMarkup.duration` | Length | text | Video length in ISO format: PT2M30S is 2 minutes 30 seconds. |
| `schemaMarkup.faq` | Questions | repeater | Questions and answers for the FAQ schema. Leave empty to use the FAQ sections already on the page. |
| `schemaMarkup.faq[].q` | Question | text | |
| `schemaMarkup.faq[].a` | Answer | textarea | |
| `schemaMarkup.custom` | Custom JSON-LD (advanced) | json | Paste extra schema from a generator or Google docs. One object, an array of objects, or an object with @graph. It is merged into the single combined... |

### Advanced

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `canonical` | Canonical URL | url | Tells Google which address is the original when the same content exists in two places. Leave empty in almost every case. Only fill it if this page co... |
| `seoNoindex` | Hide this page from Google (noindex) | switch |  |
| `robots.nofollow` | Do not follow links on this page (nofollow) | switch | Asks search engines not to pass ranking value through the links on this page. Rarely needed, for example on pages full of paid or untrusted links. |
| `robots.noarchive` | No cached copy (noarchive) | switch | Asks search engines not to keep a cached copy of the page. Useful for prices or offers that change often. |
| `robots.nosnippet` | No text preview (nosnippet) | switch | Google shows the title only, with no description text and no AI overview quote from this page. Usually lowers clicks, so use with care. |
| `robots.noimageindex` | Keep images out of Google Images | switch | Asks Google not to show images from this page in image search. |
| `sitemap.exclude` | Leave out of the sitemap | switch | The page stays live and indexable, but is not listed in sitemap.xml. Pages set to noindex are always left out automatically. |
| `sitemap.priority` | Sitemap priority | select | How important this page is compared with your other pages (1.0 highest). A hint only; empty uses a sensible default. |
| `sitemap.changefreq` | How often it changes | select | A hint for search engines about how often to check this page again. Empty uses the default from SEO settings. |
| `breadcrumbTitle` | Breadcrumb title | text | A shorter name for this page in breadcrumbs and the breadcrumb schema, for example 'Pricing' instead of a long headline. Empty uses the title. |

### Code

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `code.head` | Code in <head> for this page | code | Added inside <head> only on this page. For a page-specific tracking pixel, verification tag, font or script. |
| `code.bodyStart` | Code after <body> opens | code | Added right after <body> starts, only on this page. For snippets that must load first. |
| `code.bodyEnd` | Code before </body> | code | Added at the very end of this page. For widgets, conversion scripts or anything that can load last. |
| `code.css` | Custom CSS for this page | code | Style rules that apply only on this page, for example .h-display { color: #fff }. No <style> tag needed. |

## Products page SEO (`seo-apps`)

- Admin: `/admin/settings/seo-apps`, area: **seo**

### SEO

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiSeo` |  | aiSeo |  |
| `seoPreview` |  | seo |  |
| `focusKeyword` | Focus keyword | text | The main phrase you want this page to rank for on Google. The checklist below grades the page against it, like Rank Math and Yoast do. Use one phrase... |
| `keywords` | Related keywords | tags | Other phrases and synonyms this page should also cover (secondary keywords). They are a reminder for you while writing and are added to the page sche... |
| `seoAnalysis` |  | seoAnalysis |  |
| `seoTitle` | Meta title | text | Shown exactly as typed. About 50 to 60 characters. Leave empty to use the title. |
| `seoDescription` | Meta description | textarea | About 120 to 160 characters. Leave empty to use the short description. |

### Social

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiSocial` |  | aiSeo |  |
| `socialPreview` |  | socialPreview |  |
| `ogTitle` | Social title | text | The headline shown when the link is shared on Facebook, LinkedIn, WhatsApp and X. Leave empty to reuse the meta title. Social titles can be more catc... |
| `ogDescription` | Social description | textarea | The short text under the headline on social cards. Leave empty to reuse the meta description. |
| `seoImage` | Social share image | image | For Facebook, LinkedIn, WhatsApp and X. 1200 x 630 works best. Leave empty to use the main image. |
| `twitterCard` | X (Twitter) card | segmented | How the link looks on X. Large image fills the width of the post and gets more clicks. Small shows a square thumbnail next to the text. |

### Schema

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiSchema` |  | aiSeo |  |
| `schemaPanel` |  | schemaPanel |  |
| `schemaMarkup.type` | Schema type | select | Automatic picks the right type for you (blog post, project, FAQ...). Choose a type when this page is something specific, like a service you sell, an... |
| `schemaMarkup.name` | Name or headline | text | The name of the thing this page describes. Empty uses the page title. |
| `schemaMarkup.description` | Description | textarea | One or two sentences. Empty uses the meta description. |
| `schemaMarkup.image` | Image | image | The main image for this schema item. Empty uses the share image or main image. |
| `schemaMarkup.serviceType` | Service type | text | The category of service, for example Web design, SEO audit or Website maintenance. |
| `schemaMarkup.areaServed` | Area served | text | Where you offer it: a city, a country or Worldwide. |
| `schemaMarkup.brand` | Brand | text | The brand or maker of the product. |
| `schemaMarkup.sku` | SKU or product code | text | Your own product code. Optional. |
| `schemaMarkup.appCategory` | App category | text | Google expects a value like BusinessApplication, DeveloperApplication or GameApplication. |
| `schemaMarkup.os` | Operating system | text | Where the app runs. |
| `schemaMarkup.price` | Price | number | The price people pay. Google can show it under your result. Use 0 for free. |
| `schemaMarkup.currency` | Currency | text | Three-letter currency code, for example USD, BDT or EUR. |
| `schemaMarkup.availability` | Availability | select | Whether people can buy or book it right now. |
| `schemaMarkup.ratingValue` | Average rating (1 to 5) | number | Your real average review score. Only add real ratings: Google can penalise made-up ones. |
| `schemaMarkup.ratingCount` | Number of reviews | number | How many reviews the average is based on. |
| `schemaMarkup.startDate` | Starts | datetime | Date and time the event begins. |
| `schemaMarkup.endDate` | Ends | datetime | Date and time the event ends. |
| `schemaMarkup.attendance` | Where it happens | segmented | In person, online or both. Google shows online events differently. |
| `schemaMarkup.locationName` | Venue name | text | The name of the place, for example Dhaka Convention Centre. |
| `schemaMarkup.address` | Venue address | text | Street, city and country of the venue. |
| `schemaMarkup.eventUrl` | Online event link | url | The page or meeting link where people join. |
| `schemaMarkup.totalTime` | Total time | text | How long it takes, in ISO format: PT30M is 30 minutes, PT1H30M is 1.5 hours. |
| `schemaMarkup.steps` | Steps | repeater | The steps in order. Google can show them as a numbered guide. |
| `schemaMarkup.steps[].name` | Step title | text | |
| `schemaMarkup.steps[].text` | What to do | textarea | |
| `schemaMarkup.videoUrl` | Video link | url | YouTube, Vimeo or a direct video file link. |
| `schemaMarkup.uploadDate` | Upload date | date | When the video was published. Required by Google for video results. |
| `schemaMarkup.duration` | Length | text | Video length in ISO format: PT2M30S is 2 minutes 30 seconds. |
| `schemaMarkup.faq` | Questions | repeater | Questions and answers for the FAQ schema. Leave empty to use the FAQ sections already on the page. |
| `schemaMarkup.faq[].q` | Question | text | |
| `schemaMarkup.faq[].a` | Answer | textarea | |
| `schemaMarkup.custom` | Custom JSON-LD (advanced) | json | Paste extra schema from a generator or Google docs. One object, an array of objects, or an object with @graph. It is merged into the single combined... |

### Advanced

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `canonical` | Canonical URL | url | Tells Google which address is the original when the same content exists in two places. Leave empty in almost every case. Only fill it if this page co... |
| `seoNoindex` | Hide this page from Google (noindex) | switch |  |
| `robots.nofollow` | Do not follow links on this page (nofollow) | switch | Asks search engines not to pass ranking value through the links on this page. Rarely needed, for example on pages full of paid or untrusted links. |
| `robots.noarchive` | No cached copy (noarchive) | switch | Asks search engines not to keep a cached copy of the page. Useful for prices or offers that change often. |
| `robots.nosnippet` | No text preview (nosnippet) | switch | Google shows the title only, with no description text and no AI overview quote from this page. Usually lowers clicks, so use with care. |
| `robots.noimageindex` | Keep images out of Google Images | switch | Asks Google not to show images from this page in image search. |
| `sitemap.exclude` | Leave out of the sitemap | switch | The page stays live and indexable, but is not listed in sitemap.xml. Pages set to noindex are always left out automatically. |
| `sitemap.priority` | Sitemap priority | select | How important this page is compared with your other pages (1.0 highest). A hint only; empty uses a sensible default. |
| `sitemap.changefreq` | How often it changes | select | A hint for search engines about how often to check this page again. Empty uses the default from SEO settings. |
| `breadcrumbTitle` | Breadcrumb title | text | A shorter name for this page in breadcrumbs and the breadcrumb schema, for example 'Pricing' instead of a long headline. Empty uses the title. |

### Code

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `code.head` | Code in <head> for this page | code | Added inside <head> only on this page. For a page-specific tracking pixel, verification tag, font or script. |
| `code.bodyStart` | Code after <body> opens | code | Added right after <body> starts, only on this page. For snippets that must load first. |
| `code.bodyEnd` | Code before </body> | code | Added at the very end of this page. For widgets, conversion scripts or anything that can load last. |
| `code.css` | Custom CSS for this page | code | Style rules that apply only on this page, for example .h-display { color: #fff }. No <style> tag needed. |

## FAQ page SEO (`seo-faq`)

- Admin: `/admin/settings/seo-faq`, area: **seo**

### SEO

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiSeo` |  | aiSeo |  |
| `seoPreview` |  | seo |  |
| `focusKeyword` | Focus keyword | text | The main phrase you want this page to rank for on Google. The checklist below grades the page against it, like Rank Math and Yoast do. Use one phrase... |
| `keywords` | Related keywords | tags | Other phrases and synonyms this page should also cover (secondary keywords). They are a reminder for you while writing and are added to the page sche... |
| `seoAnalysis` |  | seoAnalysis |  |
| `seoTitle` | Meta title | text | Shown exactly as typed. About 50 to 60 characters. Leave empty to use the title. |
| `seoDescription` | Meta description | textarea | About 120 to 160 characters. Leave empty to use the short description. |

### Social

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiSocial` |  | aiSeo |  |
| `socialPreview` |  | socialPreview |  |
| `ogTitle` | Social title | text | The headline shown when the link is shared on Facebook, LinkedIn, WhatsApp and X. Leave empty to reuse the meta title. Social titles can be more catc... |
| `ogDescription` | Social description | textarea | The short text under the headline on social cards. Leave empty to reuse the meta description. |
| `seoImage` | Social share image | image | For Facebook, LinkedIn, WhatsApp and X. 1200 x 630 works best. Leave empty to use the main image. |
| `twitterCard` | X (Twitter) card | segmented | How the link looks on X. Large image fills the width of the post and gets more clicks. Small shows a square thumbnail next to the text. |

### Schema

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiSchema` |  | aiSeo |  |
| `schemaPanel` |  | schemaPanel |  |
| `schemaMarkup.type` | Schema type | select | Automatic picks the right type for you (blog post, project, FAQ...). Choose a type when this page is something specific, like a service you sell, an... |
| `schemaMarkup.name` | Name or headline | text | The name of the thing this page describes. Empty uses the page title. |
| `schemaMarkup.description` | Description | textarea | One or two sentences. Empty uses the meta description. |
| `schemaMarkup.image` | Image | image | The main image for this schema item. Empty uses the share image or main image. |
| `schemaMarkup.serviceType` | Service type | text | The category of service, for example Web design, SEO audit or Website maintenance. |
| `schemaMarkup.areaServed` | Area served | text | Where you offer it: a city, a country or Worldwide. |
| `schemaMarkup.brand` | Brand | text | The brand or maker of the product. |
| `schemaMarkup.sku` | SKU or product code | text | Your own product code. Optional. |
| `schemaMarkup.appCategory` | App category | text | Google expects a value like BusinessApplication, DeveloperApplication or GameApplication. |
| `schemaMarkup.os` | Operating system | text | Where the app runs. |
| `schemaMarkup.price` | Price | number | The price people pay. Google can show it under your result. Use 0 for free. |
| `schemaMarkup.currency` | Currency | text | Three-letter currency code, for example USD, BDT or EUR. |
| `schemaMarkup.availability` | Availability | select | Whether people can buy or book it right now. |
| `schemaMarkup.ratingValue` | Average rating (1 to 5) | number | Your real average review score. Only add real ratings: Google can penalise made-up ones. |
| `schemaMarkup.ratingCount` | Number of reviews | number | How many reviews the average is based on. |
| `schemaMarkup.startDate` | Starts | datetime | Date and time the event begins. |
| `schemaMarkup.endDate` | Ends | datetime | Date and time the event ends. |
| `schemaMarkup.attendance` | Where it happens | segmented | In person, online or both. Google shows online events differently. |
| `schemaMarkup.locationName` | Venue name | text | The name of the place, for example Dhaka Convention Centre. |
| `schemaMarkup.address` | Venue address | text | Street, city and country of the venue. |
| `schemaMarkup.eventUrl` | Online event link | url | The page or meeting link where people join. |
| `schemaMarkup.totalTime` | Total time | text | How long it takes, in ISO format: PT30M is 30 minutes, PT1H30M is 1.5 hours. |
| `schemaMarkup.steps` | Steps | repeater | The steps in order. Google can show them as a numbered guide. |
| `schemaMarkup.steps[].name` | Step title | text | |
| `schemaMarkup.steps[].text` | What to do | textarea | |
| `schemaMarkup.videoUrl` | Video link | url | YouTube, Vimeo or a direct video file link. |
| `schemaMarkup.uploadDate` | Upload date | date | When the video was published. Required by Google for video results. |
| `schemaMarkup.duration` | Length | text | Video length in ISO format: PT2M30S is 2 minutes 30 seconds. |
| `schemaMarkup.faq` | Questions | repeater | Questions and answers for the FAQ schema. Leave empty to use the FAQ sections already on the page. |
| `schemaMarkup.faq[].q` | Question | text | |
| `schemaMarkup.faq[].a` | Answer | textarea | |
| `schemaMarkup.custom` | Custom JSON-LD (advanced) | json | Paste extra schema from a generator or Google docs. One object, an array of objects, or an object with @graph. It is merged into the single combined... |

### Advanced

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `canonical` | Canonical URL | url | Tells Google which address is the original when the same content exists in two places. Leave empty in almost every case. Only fill it if this page co... |
| `seoNoindex` | Hide this page from Google (noindex) | switch |  |
| `robots.nofollow` | Do not follow links on this page (nofollow) | switch | Asks search engines not to pass ranking value through the links on this page. Rarely needed, for example on pages full of paid or untrusted links. |
| `robots.noarchive` | No cached copy (noarchive) | switch | Asks search engines not to keep a cached copy of the page. Useful for prices or offers that change often. |
| `robots.nosnippet` | No text preview (nosnippet) | switch | Google shows the title only, with no description text and no AI overview quote from this page. Usually lowers clicks, so use with care. |
| `robots.noimageindex` | Keep images out of Google Images | switch | Asks Google not to show images from this page in image search. |
| `sitemap.exclude` | Leave out of the sitemap | switch | The page stays live and indexable, but is not listed in sitemap.xml. Pages set to noindex are always left out automatically. |
| `sitemap.priority` | Sitemap priority | select | How important this page is compared with your other pages (1.0 highest). A hint only; empty uses a sensible default. |
| `sitemap.changefreq` | How often it changes | select | A hint for search engines about how often to check this page again. Empty uses the default from SEO settings. |
| `breadcrumbTitle` | Breadcrumb title | text | A shorter name for this page in breadcrumbs and the breadcrumb schema, for example 'Pricing' instead of a long headline. Empty uses the title. |

### Code

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `code.head` | Code in <head> for this page | code | Added inside <head> only on this page. For a page-specific tracking pixel, verification tag, font or script. |
| `code.bodyStart` | Code after <body> opens | code | Added right after <body> starts, only on this page. For snippets that must load first. |
| `code.bodyEnd` | Code before </body> | code | Added at the very end of this page. For widgets, conversion scripts or anything that can load last. |
| `code.css` | Custom CSS for this page | code | Style rules that apply only on this page, for example .h-display { color: #fff }. No <style> tag needed. |

## Help center page SEO (`seo-help`)

- Admin: `/admin/settings/seo-help`, area: **seo**

### SEO

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiSeo` |  | aiSeo |  |
| `seoPreview` |  | seo |  |
| `focusKeyword` | Focus keyword | text | The main phrase you want this page to rank for on Google. The checklist below grades the page against it, like Rank Math and Yoast do. Use one phrase... |
| `keywords` | Related keywords | tags | Other phrases and synonyms this page should also cover (secondary keywords). They are a reminder for you while writing and are added to the page sche... |
| `seoAnalysis` |  | seoAnalysis |  |
| `seoTitle` | Meta title | text | Shown exactly as typed. About 50 to 60 characters. Leave empty to use the title. |
| `seoDescription` | Meta description | textarea | About 120 to 160 characters. Leave empty to use the short description. |

### Social

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiSocial` |  | aiSeo |  |
| `socialPreview` |  | socialPreview |  |
| `ogTitle` | Social title | text | The headline shown when the link is shared on Facebook, LinkedIn, WhatsApp and X. Leave empty to reuse the meta title. Social titles can be more catc... |
| `ogDescription` | Social description | textarea | The short text under the headline on social cards. Leave empty to reuse the meta description. |
| `seoImage` | Social share image | image | For Facebook, LinkedIn, WhatsApp and X. 1200 x 630 works best. Leave empty to use the main image. |
| `twitterCard` | X (Twitter) card | segmented | How the link looks on X. Large image fills the width of the post and gets more clicks. Small shows a square thumbnail next to the text. |

### Schema

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiSchema` |  | aiSeo |  |
| `schemaPanel` |  | schemaPanel |  |
| `schemaMarkup.type` | Schema type | select | Automatic picks the right type for you (blog post, project, FAQ...). Choose a type when this page is something specific, like a service you sell, an... |
| `schemaMarkup.name` | Name or headline | text | The name of the thing this page describes. Empty uses the page title. |
| `schemaMarkup.description` | Description | textarea | One or two sentences. Empty uses the meta description. |
| `schemaMarkup.image` | Image | image | The main image for this schema item. Empty uses the share image or main image. |
| `schemaMarkup.serviceType` | Service type | text | The category of service, for example Web design, SEO audit or Website maintenance. |
| `schemaMarkup.areaServed` | Area served | text | Where you offer it: a city, a country or Worldwide. |
| `schemaMarkup.brand` | Brand | text | The brand or maker of the product. |
| `schemaMarkup.sku` | SKU or product code | text | Your own product code. Optional. |
| `schemaMarkup.appCategory` | App category | text | Google expects a value like BusinessApplication, DeveloperApplication or GameApplication. |
| `schemaMarkup.os` | Operating system | text | Where the app runs. |
| `schemaMarkup.price` | Price | number | The price people pay. Google can show it under your result. Use 0 for free. |
| `schemaMarkup.currency` | Currency | text | Three-letter currency code, for example USD, BDT or EUR. |
| `schemaMarkup.availability` | Availability | select | Whether people can buy or book it right now. |
| `schemaMarkup.ratingValue` | Average rating (1 to 5) | number | Your real average review score. Only add real ratings: Google can penalise made-up ones. |
| `schemaMarkup.ratingCount` | Number of reviews | number | How many reviews the average is based on. |
| `schemaMarkup.startDate` | Starts | datetime | Date and time the event begins. |
| `schemaMarkup.endDate` | Ends | datetime | Date and time the event ends. |
| `schemaMarkup.attendance` | Where it happens | segmented | In person, online or both. Google shows online events differently. |
| `schemaMarkup.locationName` | Venue name | text | The name of the place, for example Dhaka Convention Centre. |
| `schemaMarkup.address` | Venue address | text | Street, city and country of the venue. |
| `schemaMarkup.eventUrl` | Online event link | url | The page or meeting link where people join. |
| `schemaMarkup.totalTime` | Total time | text | How long it takes, in ISO format: PT30M is 30 minutes, PT1H30M is 1.5 hours. |
| `schemaMarkup.steps` | Steps | repeater | The steps in order. Google can show them as a numbered guide. |
| `schemaMarkup.steps[].name` | Step title | text | |
| `schemaMarkup.steps[].text` | What to do | textarea | |
| `schemaMarkup.videoUrl` | Video link | url | YouTube, Vimeo or a direct video file link. |
| `schemaMarkup.uploadDate` | Upload date | date | When the video was published. Required by Google for video results. |
| `schemaMarkup.duration` | Length | text | Video length in ISO format: PT2M30S is 2 minutes 30 seconds. |
| `schemaMarkup.faq` | Questions | repeater | Questions and answers for the FAQ schema. Leave empty to use the FAQ sections already on the page. |
| `schemaMarkup.faq[].q` | Question | text | |
| `schemaMarkup.faq[].a` | Answer | textarea | |
| `schemaMarkup.custom` | Custom JSON-LD (advanced) | json | Paste extra schema from a generator or Google docs. One object, an array of objects, or an object with @graph. It is merged into the single combined... |

### Advanced

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `canonical` | Canonical URL | url | Tells Google which address is the original when the same content exists in two places. Leave empty in almost every case. Only fill it if this page co... |
| `seoNoindex` | Hide this page from Google (noindex) | switch |  |
| `robots.nofollow` | Do not follow links on this page (nofollow) | switch | Asks search engines not to pass ranking value through the links on this page. Rarely needed, for example on pages full of paid or untrusted links. |
| `robots.noarchive` | No cached copy (noarchive) | switch | Asks search engines not to keep a cached copy of the page. Useful for prices or offers that change often. |
| `robots.nosnippet` | No text preview (nosnippet) | switch | Google shows the title only, with no description text and no AI overview quote from this page. Usually lowers clicks, so use with care. |
| `robots.noimageindex` | Keep images out of Google Images | switch | Asks Google not to show images from this page in image search. |
| `sitemap.exclude` | Leave out of the sitemap | switch | The page stays live and indexable, but is not listed in sitemap.xml. Pages set to noindex are always left out automatically. |
| `sitemap.priority` | Sitemap priority | select | How important this page is compared with your other pages (1.0 highest). A hint only; empty uses a sensible default. |
| `sitemap.changefreq` | How often it changes | select | A hint for search engines about how often to check this page again. Empty uses the default from SEO settings. |
| `breadcrumbTitle` | Breadcrumb title | text | A shorter name for this page in breadcrumbs and the breadcrumb schema, for example 'Pricing' instead of a long headline. Empty uses the title. |

### Code

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `code.head` | Code in <head> for this page | code | Added inside <head> only on this page. For a page-specific tracking pixel, verification tag, font or script. |
| `code.bodyStart` | Code after <body> opens | code | Added right after <body> starts, only on this page. For snippets that must load first. |
| `code.bodyEnd` | Code before </body> | code | Added at the very end of this page. For widgets, conversion scripts or anything that can load last. |
| `code.css` | Custom CSS for this page | code | Style rules that apply only on this page, for example .h-display { color: #fff }. No <style> tag needed. |

## Case studies page SEO (`seo-caseStudies`)

- Admin: `/admin/settings/seo-caseStudies`, area: **seo**

### SEO

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiSeo` |  | aiSeo |  |
| `seoPreview` |  | seo |  |
| `focusKeyword` | Focus keyword | text | The main phrase you want this page to rank for on Google. The checklist below grades the page against it, like Rank Math and Yoast do. Use one phrase... |
| `keywords` | Related keywords | tags | Other phrases and synonyms this page should also cover (secondary keywords). They are a reminder for you while writing and are added to the page sche... |
| `seoAnalysis` |  | seoAnalysis |  |
| `seoTitle` | Meta title | text | Shown exactly as typed. About 50 to 60 characters. Leave empty to use the title. |
| `seoDescription` | Meta description | textarea | About 120 to 160 characters. Leave empty to use the short description. |

### Social

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiSocial` |  | aiSeo |  |
| `socialPreview` |  | socialPreview |  |
| `ogTitle` | Social title | text | The headline shown when the link is shared on Facebook, LinkedIn, WhatsApp and X. Leave empty to reuse the meta title. Social titles can be more catc... |
| `ogDescription` | Social description | textarea | The short text under the headline on social cards. Leave empty to reuse the meta description. |
| `seoImage` | Social share image | image | For Facebook, LinkedIn, WhatsApp and X. 1200 x 630 works best. Leave empty to use the main image. |
| `twitterCard` | X (Twitter) card | segmented | How the link looks on X. Large image fills the width of the post and gets more clicks. Small shows a square thumbnail next to the text. |

### Schema

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiSchema` |  | aiSeo |  |
| `schemaPanel` |  | schemaPanel |  |
| `schemaMarkup.type` | Schema type | select | Automatic picks the right type for you (blog post, project, FAQ...). Choose a type when this page is something specific, like a service you sell, an... |
| `schemaMarkup.name` | Name or headline | text | The name of the thing this page describes. Empty uses the page title. |
| `schemaMarkup.description` | Description | textarea | One or two sentences. Empty uses the meta description. |
| `schemaMarkup.image` | Image | image | The main image for this schema item. Empty uses the share image or main image. |
| `schemaMarkup.serviceType` | Service type | text | The category of service, for example Web design, SEO audit or Website maintenance. |
| `schemaMarkup.areaServed` | Area served | text | Where you offer it: a city, a country or Worldwide. |
| `schemaMarkup.brand` | Brand | text | The brand or maker of the product. |
| `schemaMarkup.sku` | SKU or product code | text | Your own product code. Optional. |
| `schemaMarkup.appCategory` | App category | text | Google expects a value like BusinessApplication, DeveloperApplication or GameApplication. |
| `schemaMarkup.os` | Operating system | text | Where the app runs. |
| `schemaMarkup.price` | Price | number | The price people pay. Google can show it under your result. Use 0 for free. |
| `schemaMarkup.currency` | Currency | text | Three-letter currency code, for example USD, BDT or EUR. |
| `schemaMarkup.availability` | Availability | select | Whether people can buy or book it right now. |
| `schemaMarkup.ratingValue` | Average rating (1 to 5) | number | Your real average review score. Only add real ratings: Google can penalise made-up ones. |
| `schemaMarkup.ratingCount` | Number of reviews | number | How many reviews the average is based on. |
| `schemaMarkup.startDate` | Starts | datetime | Date and time the event begins. |
| `schemaMarkup.endDate` | Ends | datetime | Date and time the event ends. |
| `schemaMarkup.attendance` | Where it happens | segmented | In person, online or both. Google shows online events differently. |
| `schemaMarkup.locationName` | Venue name | text | The name of the place, for example Dhaka Convention Centre. |
| `schemaMarkup.address` | Venue address | text | Street, city and country of the venue. |
| `schemaMarkup.eventUrl` | Online event link | url | The page or meeting link where people join. |
| `schemaMarkup.totalTime` | Total time | text | How long it takes, in ISO format: PT30M is 30 minutes, PT1H30M is 1.5 hours. |
| `schemaMarkup.steps` | Steps | repeater | The steps in order. Google can show them as a numbered guide. |
| `schemaMarkup.steps[].name` | Step title | text | |
| `schemaMarkup.steps[].text` | What to do | textarea | |
| `schemaMarkup.videoUrl` | Video link | url | YouTube, Vimeo or a direct video file link. |
| `schemaMarkup.uploadDate` | Upload date | date | When the video was published. Required by Google for video results. |
| `schemaMarkup.duration` | Length | text | Video length in ISO format: PT2M30S is 2 minutes 30 seconds. |
| `schemaMarkup.faq` | Questions | repeater | Questions and answers for the FAQ schema. Leave empty to use the FAQ sections already on the page. |
| `schemaMarkup.faq[].q` | Question | text | |
| `schemaMarkup.faq[].a` | Answer | textarea | |
| `schemaMarkup.custom` | Custom JSON-LD (advanced) | json | Paste extra schema from a generator or Google docs. One object, an array of objects, or an object with @graph. It is merged into the single combined... |

### Advanced

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `canonical` | Canonical URL | url | Tells Google which address is the original when the same content exists in two places. Leave empty in almost every case. Only fill it if this page co... |
| `seoNoindex` | Hide this page from Google (noindex) | switch |  |
| `robots.nofollow` | Do not follow links on this page (nofollow) | switch | Asks search engines not to pass ranking value through the links on this page. Rarely needed, for example on pages full of paid or untrusted links. |
| `robots.noarchive` | No cached copy (noarchive) | switch | Asks search engines not to keep a cached copy of the page. Useful for prices or offers that change often. |
| `robots.nosnippet` | No text preview (nosnippet) | switch | Google shows the title only, with no description text and no AI overview quote from this page. Usually lowers clicks, so use with care. |
| `robots.noimageindex` | Keep images out of Google Images | switch | Asks Google not to show images from this page in image search. |
| `sitemap.exclude` | Leave out of the sitemap | switch | The page stays live and indexable, but is not listed in sitemap.xml. Pages set to noindex are always left out automatically. |
| `sitemap.priority` | Sitemap priority | select | How important this page is compared with your other pages (1.0 highest). A hint only; empty uses a sensible default. |
| `sitemap.changefreq` | How often it changes | select | A hint for search engines about how often to check this page again. Empty uses the default from SEO settings. |
| `breadcrumbTitle` | Breadcrumb title | text | A shorter name for this page in breadcrumbs and the breadcrumb schema, for example 'Pricing' instead of a long headline. Empty uses the title. |

### Code

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `code.head` | Code in <head> for this page | code | Added inside <head> only on this page. For a page-specific tracking pixel, verification tag, font or script. |
| `code.bodyStart` | Code after <body> opens | code | Added right after <body> starts, only on this page. For snippets that must load first. |
| `code.bodyEnd` | Code before </body> | code | Added at the very end of this page. For widgets, conversion scripts or anything that can load last. |
| `code.css` | Custom CSS for this page | code | Style rules that apply only on this page, for example .h-display { color: #fff }. No <style> tag needed. |

## Announcement bar (`announcement`)

- Admin: `/admin/settings/announcement`, area: **marketing**

### Bar

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `enabled` | Show the announcement bar | switch | On: the bar appears at the very top of every page that matches the rules below. |
| `messages` | Messages | repeater | Add more than one message to rotate between them automatically. |
| `messages[].icon` | Emoji | text | |
| `messages[].text` | Text | text | |
| `messages[].code` | Coupon code (optional) | text | |
| `messages[].linkLabel` | Link text | text | |
| `messages[].href` | Link to | text | |
| `messages[].newTab` | Open in a new tab | switch | |
| `rotate` | Switch message every (seconds) | number | How long each message stays when you have several. |
| `countdownTo` | Countdown ends | datetime | Shows a live countdown in the bar. Leave empty for none. |
| `countdownLabel` | Countdown label | text | Words before the timer, for example "Ends in". |

### Look

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `preset` | Colours | select | Brand blue is bold. Dark and Light match the site. Custom lets you choose. |
| `size` | Size | select | How tall the bar is. |
| `bg` | Background | color | Bar background colour. |
| `text` | Text colour | color | Text colour. Keep strong contrast. |
| `dismissible` | Visitors can close it | switch | Shows an X. A closed bar disappears and the page looks exactly like a normal site. |
| `rememberDays` | Stay closed for (days) | number | After closing, the bar does not return for this many days. |
| `hideOnMobile` | Hide on phones | switch | Hides the bar on small screens. |

### When and where

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `pages` | Pages | segmented | Where the bar shows. |
| `paths` | Page addresses | tags | Type an address and press Enter. / is the home page and /blog/* is every blog post. |
| `startAt` | Start showing | datetime | The bar waits until this date and time. |
| `endAt` | Stop showing | datetime | The bar disappears after this date and time. |

## Popup settings (`popups`)

- Admin: `/admin/settings/popups`, area: **marketing**

### Global rules

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `enabled` | Popups are allowed on the site | switch | Master switch. Off hides every popup at once without changing them. |
| `maxPerVisit` | Most popups per visit | number | Stops visitors from being buried in popups. 1 or 2 is polite. |
| `gapSeconds` | Quiet time between popups (seconds) | number | After one popup closes, wait this long before another can appear. |

## AI writer settings (`aiwriter`)

- Admin: `/admin/settings/aiwriter`, area: **blog**

### Free AI (no card needed)

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiKeysBox` |  | aiKeys |  |
| `provider` | Which AI writes your posts | segmented | Automatic uses the free providers that have a key, one after another. Pick one provider to use it first (the free ones still back it up). ChatGPT and... |
| `fallback` | If the chosen AI fails, try the other free ones | switch | On: a busy or failing provider is skipped automatically. Off: only the chosen provider is used. |
| `autoPolish` | Auto-polish: rewrite sections that still sound like AI | switch | Every section is cleaned for free (stock AI words swapped, long dashes removed). With this on, a section that still reads machine-made gets one extra... |
| `model` | Model for the chosen provider (optional) | text | Leave empty. Only fill it if you want a specific model for the provider chosen above. |

### Voice and defaults

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `brandVoice` | Your brand voice | textarea | Describe how you write: words you like, how formal, what to avoid. Every post follows it, so posts sound like you and not like a generic AI. |
| `audience` | Default audience | text | Who the posts are for, for example small business owners. You can change it for each post. |
| `tone` | Default tone | select | The tone new posts start with: Friendly expert, Professional, Techy, Developer, Beginner friendly, Conversational, Storytelling, Persuasive or Author... |
| `language` | Default language | select | The language new posts start with. You can pick English or Bengali for each post. |
| `words` | Default length (words) | number | A good length for most topics is 1,200 to 2,000 words. Long posts are written section by section. |

### Advanced: model lists and optional paid data

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `geminiModels` | Gemini models to try (one per line) | textarea | Tried in order. Empty uses a good default list. Change it only if Google renames a model. |
| `groqModels` | Groq models to try (one per line) | textarea | Tried in order. Empty uses a good default list. |
| `openrouterModels` | OpenRouter free models to try (one per line) | textarea | Use model names ending in :free. Empty uses a default list. OpenRouter changes its free models now and then; see openrouter.ai/models?max_price=0. |
| `semrushDatabase` | Semrush country code (only if you add SEMRUSH_API_KEY) | text | Optional and paid. Not needed. If you ever add SEMRUSH_API_KEY, real volume and difficulty appear in keyword research. Two letter code, for example u... |

### AI news feeds

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `feeds` | News feeds | repeater | The sources behind your AI news list. Add, remove or replace any of them. |
| `feeds[].name` | Name | text | |
| `feeds[].url` | RSS address | url | |
