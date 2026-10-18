# Content types (admin lists and editors)

> Generated from the code by `scripts/gen-docs.ts`. Do not edit by hand; run the script again after changing the code.

Each row below is a list in the admin (`/admin/<name>`) with its own editor. "Area" is the permission group that may use it (see Security and roles).

## Portfolio (`projects`)

- Admin: `/admin/projects`, area: **content**, slug made from `title`
- List columns: scrollImage, Project, Built with, On home, Live

### Tab: Project

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `title` | Project name | text, required |  |
| `slug` | URL slug | slug |  |
| `liveUrl` | Website address | url |  |
| `client` | Client | text |  |
| `industry` | Industry | text |  |
| `summary` | Short description | textarea | Shown on the card. One or two sentences. |

### Tab: Images

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `scrollImage` | Full-page screenshot | image | Upload the whole page as one tall image. It scrolls slowly when someone hovers the card. |
| `scrollDirection` | Hover scroll direction | select |  |
| `useScrollAsBanner` | Use the screenshot as the banner | switch |  |
| `bannerImage` | Banner image | image | Used for social sharing and when the switch above is off. |
| `gallery` | Extra images | images |  |
| `accent` | Accent colour | color |  |

### Tab: How it was built

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `platformType` | Platform | segmented |  |
| `cms` | Which CMS | select |  |
| `technologies` | Languages and tools | multiselect | Shown on the card. Type to add one that is not listed. |
| `services` | Work type | tags | For example: Website design, Local SEO. |

### Tab: Timeline

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `startDate` | Start date | date |  |
| `endDate` | End date | date |  |
| `duration` | Duration | text | For example "3 weeks". Leave empty to work it out from the dates. |

### Tab: What I did

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `content` | Project story | markdown | The brief, what you did, and the result. |
| `deliverables` | Deliverables | list | One line each. |
| `metrics` | Results | repeater |  |
| `metrics[].value` | Number | text | |
| `metrics[].label` | Label | text | |

### Tab: Video walkthrough

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `video.provider` | Source | select |  |
| `video.url` | Video link | url |  |
| `video.url` | Video file | file |  |

### Tab: Publishing

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `published` | Published | switch |  |
| `featured` | Show on homepage | switch |  |
| `order` | Sort order | number | Lower numbers show first. |

### Tab: SEO

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `seoPreview` |  | seo |  |
| `focusKeyword` | Focus keyword | text | The main phrase you want this page to rank for on Google. The checklist below grades the page against it, like Rank Math and Yoast do. Use one phrase... |
| `keywords` | Related keywords | tags | Other phrases and synonyms this page should also cover (secondary keywords). They are a reminder for you while writing and are added to the page sche... |
| `seoAnalysis` |  | seoAnalysis |  |
| `seoTitle` | Meta title | text | Shown exactly as typed. About 50 to 60 characters. Leave empty to use the title. |
| `seoDescription` | Meta description | textarea | About 120 to 160 characters. Leave empty to use the short description. |

### Tab: Social

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `socialPreview` |  | socialPreview |  |
| `ogTitle` | Social title | text | The headline shown when the link is shared on Facebook, LinkedIn, WhatsApp and X. Leave empty to reuse the meta title. Social titles can be more catc... |
| `ogDescription` | Social description | textarea | The short text under the headline on social cards. Leave empty to reuse the meta description. |
| `seoImage` | Social share image | image | For Facebook, LinkedIn, WhatsApp and X. 1200 x 630 works best. Leave empty to use the main image. |
| `twitterCard` | X (Twitter) card | segmented | How the link looks on X. Large image fills the width of the post and gets more clicks. Small shows a square thumbnail next to the text. |

### Tab: Schema

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
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

### Tab: Advanced

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

### Tab: Code

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `code.head` | Code in <head> for this page | code | Added inside <head> only on this page. For a page-specific tracking pixel, verification tag, font or script. |
| `code.bodyStart` | Code after <body> opens | code | Added right after <body> starts, only on this page. For snippets that must load first. |
| `code.bodyEnd` | Code before </body> | code | Added at the very end of this page. For widgets, conversion scripts or anything that can load last. |
| `code.css` | Custom CSS for this page | code | Style rules that apply only on this page, for example .h-display { color: #fff }. No <style> tag needed. |

## Blog (`posts`)

- Admin: `/admin/posts`, area: **blog**, slug made from `title`
- List columns: cover, Title, Type, Category, Date, Content score, Live

### Tab: Post

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `kind` | Type | segmented |  |
| `title` | Title | text, required |  |
| `slug` | URL slug | slug |  |
| `category` | Category | ref |  |
| `publishedAt` | Publish date | date |  |
| `excerpt` | Excerpt | textarea |  |
| `cover` | Cover image | image |  |
| `content` | Content | markdown |  |
| `tags` | Tags | tags |  |
| `featured` | Feature at the top of the blog | switch |  |
| `published` | Published | switch |  |

### Tab: Extra sections

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `blocks` | Sections after the article | blocks | Optional: add a call to action, pricing, FAQ or any section under the post. |

### Tab: AI plan

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `aiPlan` |  | aiPlan |  |

### Tab: SEO

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `seoPreview` |  | seo |  |
| `focusKeyword` | Focus keyword | text | The main phrase you want this page to rank for on Google. The checklist below grades the page against it, like Rank Math and Yoast do. Use one phrase... |
| `keywords` | Related keywords | tags | Other phrases and synonyms this page should also cover (secondary keywords). They are a reminder for you while writing and are added to the page sche... |
| `seoAnalysis` |  | seoAnalysis |  |
| `seoTitle` | Meta title | text | Shown exactly as typed. About 50 to 60 characters. Leave empty to use the title. |
| `seoDescription` | Meta description | textarea | About 120 to 160 characters. Leave empty to use the short description. |

### Tab: Social

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `socialPreview` |  | socialPreview |  |
| `ogTitle` | Social title | text | The headline shown when the link is shared on Facebook, LinkedIn, WhatsApp and X. Leave empty to reuse the meta title. Social titles can be more catc... |
| `ogDescription` | Social description | textarea | The short text under the headline on social cards. Leave empty to reuse the meta description. |
| `seoImage` | Social share image | image | For Facebook, LinkedIn, WhatsApp and X. 1200 x 630 works best. Leave empty to use the main image. |
| `twitterCard` | X (Twitter) card | segmented | How the link looks on X. Large image fills the width of the post and gets more clicks. Small shows a square thumbnail next to the text. |

### Tab: Schema

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
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

### Tab: Advanced

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

### Tab: Code

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `code.head` | Code in <head> for this page | code | Added inside <head> only on this page. For a page-specific tracking pixel, verification tag, font or script. |
| `code.bodyStart` | Code after <body> opens | code | Added right after <body> starts, only on this page. For snippets that must load first. |
| `code.bodyEnd` | Code before </body> | code | Added at the very end of this page. For widgets, conversion scripts or anything that can load last. |
| `code.css` | Custom CSS for this page | code | Style rules that apply only on this page, for example .h-display { color: #fff }. No <style> tag needed. |

## Categories (`categories`)

- Admin: `/admin/categories`, area: **blog**, slug made from `name`
- List columns: color, Name, Slug

### Tab: Category

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `name` | Name | text, required |  |
| `slug` | URL slug | slug |  |
| `description` | Description | textarea |  |
| `color` | Colour | color |  |
| `order` | Sort order | number |  |

### Tab: SEO

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `seoPreview` |  | seo |  |
| `focusKeyword` | Focus keyword | text | The main phrase you want this page to rank for on Google. The checklist below grades the page against it, like Rank Math and Yoast do. Use one phrase... |
| `keywords` | Related keywords | tags | Other phrases and synonyms this page should also cover (secondary keywords). They are a reminder for you while writing and are added to the page sche... |
| `seoAnalysis` |  | seoAnalysis |  |
| `seoTitle` | Meta title | text | Shown exactly as typed. About 50 to 60 characters. Leave empty to use the title. |
| `seoDescription` | Meta description | textarea | About 120 to 160 characters. Leave empty to use the short description. |

### Tab: Social

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `socialPreview` |  | socialPreview |  |
| `ogTitle` | Social title | text | The headline shown when the link is shared on Facebook, LinkedIn, WhatsApp and X. Leave empty to reuse the meta title. Social titles can be more catc... |
| `ogDescription` | Social description | textarea | The short text under the headline on social cards. Leave empty to reuse the meta description. |
| `seoImage` | Social share image | image | For Facebook, LinkedIn, WhatsApp and X. 1200 x 630 works best. Leave empty to use the main image. |
| `twitterCard` | X (Twitter) card | segmented | How the link looks on X. Large image fills the width of the post and gets more clicks. Small shows a square thumbnail next to the text. |

### Tab: Schema

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
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

### Tab: Advanced

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

### Tab: Code

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `code.head` | Code in <head> for this page | code | Added inside <head> only on this page. For a page-specific tracking pixel, verification tag, font or script. |
| `code.bodyStart` | Code after <body> opens | code | Added right after <body> starts, only on this page. For snippets that must load first. |
| `code.bodyEnd` | Code before </body> | code | Added at the very end of this page. For widgets, conversion scripts or anything that can load last. |
| `code.css` | Custom CSS for this page | code | Style rules that apply only on this page, for example .h-display { color: #fff }. No <style> tag needed. |

## Services (`services`)

- Admin: `/admin/services`, area: **shop**, slug made from `name`
- List columns: Service, Order, Live

### Tab: Service

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `name` | Service name | text, required |  |
| `slug` | URL slug | slug |  |
| `summary` | Summary | textarea | Shown above its packages on the pricing page. |
| `icon` | Icon | select |  |
| `order` | Sort order | number |  |
| `active` | Show on pricing page | switch |  |

## Packages (`packages`)

- Admin: `/admin/packages`, area: **shop**, slug made from `name`
- List columns: Package, Service, Price, Billing, Live

### Tab: Package

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `service` | Service | ref, required |  |
| `name` | Package name | text, required |  |
| `slug` | URL slug | slug |  |
| `tagline` | One-line description | textarea |  |

### Tab: Price

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `price` | Price (charged at checkout) | number, required |  |
| `priceMax` | Up to (optional, shows a range) | number |  |
| `currency` | Currency | select |  |
| `billing` | Billing | select |  |
| `monthlyYearly` | Let the buyer choose Monthly or Yearly | switch | On: the card gets a Monthly / Yearly switch. The Price above becomes the MONTHLY price and the yearly price is worked out below. Off: the package is... |
| `yearlyDiscount` | Yearly discount (%) | number | Percent taken off 12 months of the monthly price. Example: monthly 100 and 20 percent gives 960 per year, and the card shows Save 240. |
| `yearlyPrice` | Or type the yearly price yourself (optional) | number | Leave empty to use the discount percent. If you type a number here it wins, and the saving is worked out from it. |
| `checkoutMode` | Button | segmented |  |
| `checkoutNote` | Note shown at checkout | textarea | For example: "This is the starting price. Extra pages are quoted after the brief." |

### Tab: What is included

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `unitNote` | Scope note | text |  |
| `deliveryDays` | Delivery (days) | number |  |
| `revisions` | Revisions | text |  |
| `features` | Features | list |  |
| `ctaLabel` | Button label | text |  |

### Tab: Display

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `popular` | Highlight as most popular | switch |  |
| `active` | Live | switch |  |
| `order` | Sort order | number |  |

## Pages (`pages`)

- Admin: `/admin/pages`, area: **content**, slug made from `title`
- List columns: Title, URL, In header, Schema, Noindex, Live

### Tab: Page

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `title` | Title | text, required |  |
| `slug` | URL slug | slug |  |
| `published` | Published | switch |  |
| `hideTitle` | Hide the page title (use a Hero section instead) | switch |  |
| `showInHeader` | Link in header menu | switch |  |
| `showInFooter` | Link in footer | switch |  |

### Tab: Sections

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `blocks` | Page sections | blocks | Build the page from ready-made sections. Drag order with the arrows. |

### Tab: Plain text (optional)

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `content` | Text shown above the sections | markdown | Good for legal pages. Leave empty when you use sections. |

### Tab: SEO

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `seoPreview` |  | seo |  |
| `focusKeyword` | Focus keyword | text | The main phrase you want this page to rank for on Google. The checklist below grades the page against it, like Rank Math and Yoast do. Use one phrase... |
| `keywords` | Related keywords | tags | Other phrases and synonyms this page should also cover (secondary keywords). They are a reminder for you while writing and are added to the page sche... |
| `seoAnalysis` |  | seoAnalysis |  |
| `seoTitle` | Meta title | text | Shown exactly as typed. About 50 to 60 characters. Leave empty to use the title. |
| `seoDescription` | Meta description | textarea | About 120 to 160 characters. Leave empty to use the short description. |

### Tab: Social

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `socialPreview` |  | socialPreview |  |
| `ogTitle` | Social title | text | The headline shown when the link is shared on Facebook, LinkedIn, WhatsApp and X. Leave empty to reuse the meta title. Social titles can be more catc... |
| `ogDescription` | Social description | textarea | The short text under the headline on social cards. Leave empty to reuse the meta description. |
| `seoImage` | Social share image | image | For Facebook, LinkedIn, WhatsApp and X. 1200 x 630 works best. Leave empty to use the main image. |
| `twitterCard` | X (Twitter) card | segmented | How the link looks on X. Large image fills the width of the post and gets more clicks. Small shows a square thumbnail next to the text. |

### Tab: Schema

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
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

### Tab: Advanced

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

### Tab: Code

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `code.head` | Code in <head> for this page | code | Added inside <head> only on this page. For a page-specific tracking pixel, verification tag, font or script. |
| `code.bodyStart` | Code after <body> opens | code | Added right after <body> starts, only on this page. For snippets that must load first. |
| `code.bodyEnd` | Code before </body> | code | Added at the very end of this page. For widgets, conversion scripts or anything that can load last. |
| `code.css` | Custom CSS for this page | code | Style rules that apply only on this page, for example .h-display { color: #fff }. No <style> tag needed. |

## Case studies (`case-studies`)

- Admin: `/admin/case-studies`, area: **content**, slug made from `title`
- List columns: cover, Case study, Client, On home, Live

### Tab: Basics

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `title` | Headline | text, required | Lead with the outcome, e.g. "Turning a one-page site into a 24/7 lead engine". |
| `slug` | URL slug | slug |  |
| `client` | Client | text |  |
| `industry` | Industry | text |  |
| `location` | Location | text |  |
| `liveUrl` | Website | url |  |
| `summary` | Summary | textarea | Two sentences shown on cards and at the top of the page. |
| `project` | Linked portfolio project | ref | Optional. Adds a link to the project page. |

### Tab: Images

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `cover` | Cover image | image |  |
| `clientLogo` | Client logo | image |  |
| `accent` | Accent colour | color |  |
| `scrollImage` | Full-page screenshot (scrolls on hover) | image |  |
| `gallery` | Gallery | images |  |

### Tab: Project facts

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `duration` | Duration | text |  |
| `platform` | Platform | text |  |
| `startDate` | Start date | date |  |
| `endDate` | End date | date |  |
| `team` | Team or role | text |  |
| `services` | Services | tags |  |
| `technologies` | Tools and tech | tags |  |

### Tab: The story

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `overview` | Overview (the client and their situation) | textarea |  |
| `challengeIntro` | Challenge intro | text |  |
| `challenges` | Challenges | repeater |  |
| `challenges[].title` | Challenge | text | |
| `challenges[].body` | Details | textarea | |
| `approachIntro` | Approach intro | text |  |
| `approach` | How I solved it (steps) | repeater |  |
| `approach[].phase` | When | text | |
| `approach[].title` | Step | text | |
| `approach[].body` | Details | textarea | |

### Tab: Results

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `resultsIntro` | Results headline | text |  |
| `metrics` | Key numbers | repeater | Use Before and After for a change (e.g. 4.1s to 1.9s), or just Value for a single number. |
| `metrics[].label` | Label | text | |
| `metrics[].before` | Before | text | |
| `metrics[].after` | After | text | |
| `metrics[].value` | Or a single value | text | |
| `results` | Results in detail | markdown |  |
| `testimonial.quote` | Client quote | textarea |  |
| `testimonial.name` | Name | text |  |
| `testimonial.role` | Role | text |  |
| `testimonial.avatar` | Photo | image |  |

### Tab: Extra sections

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `blocks` | Sections at the end | blocks |  |

### Tab: Publishing

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `published` | Published | switch |  |
| `featured` | Show on homepage | switch |  |
| `publishedAt` | Date | date |  |
| `order` | Sort order | number |  |

### Tab: SEO

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `seoPreview` |  | seo |  |
| `focusKeyword` | Focus keyword | text | The main phrase you want this page to rank for on Google. The checklist below grades the page against it, like Rank Math and Yoast do. Use one phrase... |
| `keywords` | Related keywords | tags | Other phrases and synonyms this page should also cover (secondary keywords). They are a reminder for you while writing and are added to the page sche... |
| `seoAnalysis` |  | seoAnalysis |  |
| `seoTitle` | Meta title | text | Shown exactly as typed. About 50 to 60 characters. Leave empty to use the title. |
| `seoDescription` | Meta description | textarea | About 120 to 160 characters. Leave empty to use the short description. |

### Tab: Social

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `socialPreview` |  | socialPreview |  |
| `ogTitle` | Social title | text | The headline shown when the link is shared on Facebook, LinkedIn, WhatsApp and X. Leave empty to reuse the meta title. Social titles can be more catc... |
| `ogDescription` | Social description | textarea | The short text under the headline on social cards. Leave empty to reuse the meta description. |
| `seoImage` | Social share image | image | For Facebook, LinkedIn, WhatsApp and X. 1200 x 630 works best. Leave empty to use the main image. |
| `twitterCard` | X (Twitter) card | segmented | How the link looks on X. Large image fills the width of the post and gets more clicks. Small shows a square thumbnail next to the text. |

### Tab: Schema

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
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

### Tab: Advanced

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

### Tab: Code

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `code.head` | Code in <head> for this page | code | Added inside <head> only on this page. For a page-specific tracking pixel, verification tag, font or script. |
| `code.bodyStart` | Code after <body> opens | code | Added right after <body> starts, only on this page. For snippets that must load first. |
| `code.bodyEnd` | Code before </body> | code | Added at the very end of this page. For widgets, conversion scripts or anything that can load last. |
| `code.css` | Custom CSS for this page | code | Style rules that apply only on this page, for example .h-display { color: #fff }. No <style> tag needed. |

## Forms (`forms`)

- Admin: `/admin/forms`, area: **marketing**, slug made from `name`
- List columns: Form, Name for blocks, Answers, Open, Created

## Popups (`popups`)

- Admin: `/admin/popups`, area: **marketing**, slug made from `name`
- List columns: Popup, Style, Priority, Views, Clicks, On

### Tab: Start

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `name` | Popup name | text, required | A name for you only, for example "Free audit, blog pages". Visitors never see it. |
| `slug` | Popup id | slug | A short id. You can open this popup from any button or link with href="#popup-this-id" or data-popup="this-id", but only while the popup is switched... |
| `active` | Popup is on | switch | On: visitors who match the rules below will see it. Off: saved but never shown. |
| `priority` | Priority | number | When two popups are ready at the same time, the one with the higher number is shown first. The other waits. |
| `popupTemplates` |  | popupTemplates |  |

### Tab: Content

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `contentType` | How do you want to build it? | segmented | Visual builder gives you headline, text, image, coupon, countdown, form and buttons with a ready design. My own HTML lets you write everything yourse... |
| `content.badge` | Small label | text | A short tag above the headline, for example "Limited offer" or "New". |
| `content.icon` | Emoji or icon text | text | One emoji shown above the headline. Leave empty for none. |
| `content.heading` | Headline | text | The big line. Say the benefit in a few words. |
| `content.body` | Text | textarea | One or two short sentences that explain the offer. |
| `content.image` | Image | image | A photo, product shot or illustration. Choose where it sits below. |
| `content.imagePosition` | Image position | segmented | Top: wide banner above the text. Left or Right: split design. Background: the image fills the whole popup behind the text. |
| `content.coupon` | Coupon code to show | text | Shows the code with a Copy button. Create the code in Coupons first so it really works at checkout. |
| `content.countdownTo` | Countdown ends | datetime | Shows a live countdown to this date and time. Real deadlines make people act. Leave empty for none. |
| `content.countdownLabel` | Countdown label | text | The words above the timer, for example "Offer ends in". |
| `content.form` | Form inside the popup | ref | Show one of your Form builder forms inside the popup, for example a newsletter or quote form. Create forms in Marketing > Forms. |
| `content.primary.label` | Main button text | text | Text on the main button. Leave empty for no button. |
| `content.primary.action` | Main button does | select | What happens when the button is clicked. |
| `content.primary.href` | Main button link | text | Where the button goes. A page like /pricing, a full https:// address, or a phone number for the call action. |
| `content.secondary.label` | Second button text | text | A quieter button, usually "No thanks". Leave empty to hide it. |
| `content.secondary.action` | Second button does | select | What the second button does. |
| `content.secondary.href` | Second button link | text | Where the second button goes. |
| `content.note` | Small print | text | A tiny line under the buttons, for example "No spam. Cancel any time." |
| `content.html` | HTML | code | Your own HTML. Add the attribute data-popup-close to any button to close the popup. Links work as normal. Scripts are not run inside popups, for safe... |
| `content.css` | CSS | code | Your own style rules for the HTML above. They only affect this popup. |

### Tab: Design

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `popupPreview` |  | popupPreview |  |
| `layout` | Type | select | Centre popup darkens the page and focuses attention. Corner slide-in is gentle and does not block the page. Bar is a slim strip. Drawer slides from t... |
| `size` | Size | select | How wide the popup is on a computer. On phones it always fits the screen. |
| `position` | Position | select | Where it appears. Bars use Top or Bottom, drawers use Left or Right, slide-ins use a bottom corner. |
| `design.theme` | Colours | select | Match my site follows your light or dark theme. Brand blue is a bold accent background. My own colours lets you pick below. |
| `design.bg` | Background colour | color | The popup background. |
| `design.text` | Text colour | color | The text colour. Keep strong contrast so it is easy to read. |
| `design.accent` | Button colour | color | The main button and highlight colour. |
| `design.radius` | Corners | segmented | How rounded the corners are. |
| `design.align` | Text alignment | segmented | Aligns the text inside the popup. |
| `design.animation` | Entrance animation | select | How it appears. Turned off automatically for visitors who prefer reduced motion. |
| `design.overlay` | Darken the page behind it | switch | On: a dark layer covers the page so the popup stands out. Off: the page stays fully visible and usable. |
| `design.overlayOpacity` | Darkness (0 to 90) | number | How dark the layer behind the popup is. |
| `design.blur` | Blur the page behind it | switch | Softly blurs the page behind the popup for a modern look. |
| `design.closeButton` | Show the close (X) button | switch | Always keep this on unless you give another clear way to close. People leave if they cannot close a popup, and Google can penalise intrusive popups. |
| `design.closeOnOverlay` | Close when clicking outside | switch | On: clicking the dark area or pressing Escape closes the popup. |

### Tab: When to show

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `trigger.load.enabled` | After the page loads | switch | Shows the popup a few seconds after a page opens. |
| `trigger.load.delay` | Wait (seconds) | number | How many seconds after the page loads. 5 to 15 is polite. |
| `trigger.scroll.enabled` | After scrolling down | switch | Shows when the visitor has read part of the page, so they are interested. |
| `trigger.scroll.percent` | Scrolled (percent of page) | number | For example 50 means halfway down the page. |
| `trigger.exit.enabled` | When the visitor is about to leave | switch | Shows when the mouse moves to the top of the window (computer) or when scrolling up fast (phone). A last chance to win them back. |
| `trigger.idle.enabled` | After the visitor is idle | switch | Shows when the visitor stops moving or scrolling for a while. |
| `trigger.idle.seconds` | Idle for (seconds) | number | How long without activity. |
| `trigger.pageviews.enabled` | After several pages | switch | Shows once the visitor has opened a number of pages, a sign of real interest. |
| `trigger.pageviews.count` | Pages viewed | number | For example 3 shows it on the third page they open. |
| `trigger.click.enabled` | When a button or link is clicked | switch | Opens the popup when someone clicks an element you choose, like a "Get a quote" button. |
| `trigger.click.selector` | Which element | text | A CSS selector: .class-name or #id of the button or link. You can also use href="#popup-your-popup-id" on any link with no selector. |

### Tab: Where and who

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `target.pages` | Pages | segmented | Choose where the popup can appear. |
| `target.paths` | Page addresses | tags | Type an address and press Enter. / is the home page. /blog/* means every blog post. /pricing is only the pricing page. |
| `target.devices.desktop` | Computers | switch | Show on desktop and laptop screens. |
| `target.devices.tablet` | Tablets | switch | Show on tablets. |
| `target.devices.mobile` | Phones | switch | Show on phones. Google penalises big popups that cover a phone screen, so prefer a slide-in or bar here. |
| `target.visitors` | Visitors | segmented | New: first visit on this browser. Returning: they have been here before. |
| `target.referrer` | Came from (contains) | text | Only show to visitors who arrived from a site whose address contains this text, for example google or facebook. Leave empty for all. |
| `target.startAt` | Start showing | datetime | The popup waits until this date and time. Leave empty to start straight away. |
| `target.endAt` | Stop showing | datetime | The popup disappears after this date and time. Perfect for sales. |
| `frequency.mode` | How often | select | How often the same visitor sees this popup. Showing it too often annoys people. |
| `frequency.days` | Days between | number | After a visitor closes it, wait this many days before showing it again. |
| `frequency.stopAfterConversion` | Stop after they click the button or send the form | switch | On: someone who already accepted the offer never sees this popup again. |

## Redirects (`redirects`)

- Admin: `/admin/redirects`, area: **marketing**
- List columns: From, To, Type, Hits, On

### Tab: Redirect

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `from` | Old address (From) | text, required | The address people or Google still use. Write it like /old-page. Use * at the end to match everything below it, for example /old-blog/*. With the pat... |
| `to` | New address (To) | text | Where visitors should land. A page like /new-page or a full https:// address. For a prefix rule ending in /*, end this with /* too to keep the rest o... |
| `code` | Type | select | 301: the page moved for good (best for SEO, passes ranking). 302 or 307: moved for a short time. 410: the page is deleted on purpose and Google shoul... |
| `match` | How to match | segmented | Exact: only that one address. Starts with: that address and everything under it. Pattern: a regular expression, with $1 $2 in the new address for cap... |
| `keepQuery` | Keep the ?query part | switch | On: /old?utm=x goes to /new?utm=x so campaign tracking survives. |
| `active` | Redirect is on | switch | Off: the rule is saved but ignored. |
| `note` | Note | text | A private reminder of why this redirect exists. |

## Taught answers (`knowledge`)

- Admin: `/admin/knowledge`, area: **content**
- List columns: Question, Group, On FAQ page, Bot uses it, Source

### Tab: Answer

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `question` | Question | text, required | The question a visitor might ask, written the way they would say it. This is also the heading on the FAQ page. |
| `answer` | Answer | textarea, required | Your answer in your own words. The chatbot gives this answer as it is, or uses it as the facts for a longer reply. Be specific: prices, timelines and... |
| `category` | Group | text | The group on the FAQ page. Use the name of a service (for example SEO services) so questions are sorted by service. Use General or Payments and proce... |
| `keywords` | Other ways people ask this | tags | Words and short phrases that should lead to this answer, for example cost, budget, how much. They help the bot match the question even when the wordi... |
| `body` | Longer article (optional) | textarea | For the Help center only. Add more detail, steps or examples in Markdown (## headings, lists, links). It shows under the short answer on the question... |
| `slug` | Help center address | text | The last part of the Help center link for this question. Leave empty and it is made from the question. Use lowercase words with dashes. |
| `showInHelp` | Show in the Help center | switch | On: the question has its own page in the Help center (/help) and shows in its search. Off: only the chatbot and the FAQ page use it. |
| `showOnFaq` | Show on the FAQ page | switch | On: this question also appears on /faq and in its FAQ schema for Google. Off: only the chatbot knows it (good for private or detailed rules). |
| `active` | Chatbot uses this answer | switch | Off: the bot stops using it and it leaves the FAQ page, but it stays saved. |
| `order` | Sort order | number | Lower numbers show first inside the group. |

## Products (`apps`)

- Admin: `/admin/apps`, area: **content**, slug made from `name`
- List columns: logo, Product, Status, On home, In footer, Live

### Tab: Product

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `name` | Name | text, required |  |
| `slug` | URL slug | slug |  |
| `tagline` | One-line pitch | text |  |
| `description` | Description | textarea |  |
| `url` | App link | url |  |
| `status` | Status | segmented |  |
| `logo` | Logo or icon | image |  |
| `category` | Category | text |  |
| `tech` | Built with | tags |  |
| `published` | Published | switch |  |
| `featured` | Show in home section | switch |  |
| `showInFooter` | Link in footer | switch |  |
| `order` | Sort order | number |  |

## CRM (`contacts`)

- Admin: `/admin/contacts`, area: **shop**
- List columns: Name, Email, Stage, Last contact

### Tab: Contact

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `name` | Name | text |  |
| `email` | Email | email, required |  |
| `phone` | Phone | text |  |
| `company` | Company | text |  |
| `country` | Country | text |  |
| `value` | Deal value (USD) | number |  |
| `stage` | Stage | segmented |  |
| `tags` | Tags | tags |  |
| `notes` | Notes | textarea |  |

## Customers (`customers`)

- Admin: `/admin/customers`, area: **shop**
- List columns: avatar, Name, Email, Credit, Email confirmed, Blocked, Joined

### Tab: Customer

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `name` | Name | text |  |
| `email` | Email | email, required |  |
| `phone` | Phone | text |  |
| `company` | Business | text |  |
| `country` | Country | text |  |
| `emailVerified` | Email confirmed | switch | Turn on only if you know this email belongs to them. It shows every order placed with this email. |
| `disabled` | Block sign-in | switch |  |
| `avatar` | Profile photo | image |  |
| `notes` | Private notes | textarea |  |

### Tab: Referrals

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `refCode` | Referral code | text | Created automatically. Their link is yoursite/?ref=CODE |
| `credit` | Store credit | number | In the store currency. Used as a discount at checkout. |
| `affiliate.status` | Affiliate status | select |  |
| `affiliate.rate` | Own commission % | number | Empty uses the program rate. |
| `affiliate.payoutMethod` | Payout method | text |  |
| `affiliate.payoutDetails` | Payout details | text |  |

## Coupons (`coupons`)

- Admin: `/admin/coupons`, area: **shop**
- List columns: Code, Type, Value, Used, Expires, Active

### Tab: Coupon

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `code` | Code | text, required | Letters and numbers. Saved in capitals. |
| `active` | Active | switch |  |
| `type` | Discount type | segmented |  |
| `value` | Value | number | For example 10 means 10% or 10 USD. |
| `currency` | Currency (fixed amount) | text |  |
| `maxDiscount` | Biggest discount allowed | number | Optional cap, in the package currency. |
| `description` | Internal note | text |  |

### Tab: Rules

| Field | Label | Type | What it does |
| --- | --- | --- | --- |
| `packages` | Only these packages | tags | Package slugs, for example small-business-site. Empty means every package. |
| `minAmount` | Minimum package price | number |  |
| `maxUses` | Total uses allowed | number | Empty means no limit. |
| `perCustomer` | Uses per customer | number |  |
| `usesCount` | Used so far | number |  |
| `startsAt` | Starts | date |  |
| `expiresAt` | Expires | date |  |
| `firstOrderOnly` | First order only | switch |  |
| `customersOnly` | Signed-in customers only | switch |  |
