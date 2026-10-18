import { FORM_TEMPLATES, FORM_DEFAULTS } from './forms.js';
import { POPUP_TEMPLATES, POPUP_DEFAULTS } from './popups.js';
/* Default content. Used (1) by `npm run seed` to fill a fresh MongoDB, and
   (2) as a read-only fallback so the site still renders before MONGODB_URI is set.
   Edit everything from the admin panel after seeding; this file is only the start. */

const shot = (s) => `/seed/shots/${s}.svg`;
const work = (s) => `/seed/work/work-${s}.svg`;

const P = (o) => ({
  published: true, platformType: 'cms', cms: 'WordPress', technologies: [], useScrollAsBanner: false,
  scrollDirection: 'down', gallery: [], video: { provider: 'none', url: '' },
  metrics: [], ...o, bannerImage: work(o.slug), scrollImage: shot(o.slug),
});

export const projects = [
  P({ slug: 'jslaw', title: 'JS Law', client: 'JS Law', industry: 'Legal services', liveUrl: 'https://jslaw.ca/', accent: '#4F46E5', featured: true, order: 1,
    duration: '3 weeks', startDate: '2024-03-04', endDate: '2024-03-22', services: ['Website design', 'Local SEO'], technologies: ['Elementor', 'PHP'],
    summary: 'A law firm site rebuilt around the practice areas clients actually search for, with a clear path from landing page to consultation request.',
    deliverables: ['Practice-area pages structured around real client search terms', 'On-page SEO: metadata, schema markup and local search signals', 'Fast, mobile-first pages with a clear call to book a consultation'],
    content: `## The brief\n\nJS Law had one page trying to represent every practice area at once, with no way for a visitor to act outside business hours.\n\n## What I did\n\nI rebuilt the site around the specific areas clients actually search for. Each practice area got its own page, its own metadata and its own consultation path, so a visitor who lands from search sees exactly the service they looked for.\n\n- A dedicated page per practice area, each with its own SEO\n- Consultation booking that works whether or not the office is open\n- Local schema and metadata across every page, not just the homepage\n\n## The result\n\nThe firm now receives consultation requests around the clock instead of only during office hours.`,
    video: { provider: 'youtube', url: '' } }),
  P({ slug: 'bmccentre', title: 'BMC Centre', client: 'BMC Centre', industry: 'Healthcare and community services', liveUrl: 'https://bmccentre.org/', accent: '#0D9488', featured: true, order: 2,
    duration: '3 weeks', startDate: '2024-05-06', endDate: '2024-05-24', services: ['Website design', 'SEO'],
    summary: 'A healthcare organisation site built so visitors under time pressure can find services and contact details in a couple of clicks.',
    deliverables: ['Clear service and programme pages with simple navigation', 'Accessible, mobile-friendly layout for on-the-go visitors', 'On-page SEO and local search signals for the service area'] }),
  P({ slug: 'trueathletetraining', title: 'True Athlete Training', client: 'True Athlete Training', industry: 'Sports and fitness training', liveUrl: 'https://trueathletetraining.com/', accent: '#DC2626', featured: true, order: 3,
    duration: '2 weeks', startDate: '2024-07-01', endDate: '2024-07-12', services: ['Website design'],
    summary: 'A performance-training brand site built to showcase programmes and coaches and make signing up straightforward.',
    deliverables: ['Programme and coach pages with clear pricing and sign-up paths', 'Mobile-first build for visitors researching on the go', 'Speed and Core Web Vitals pass on every page'] }),
  P({ slug: 'seoshut', title: 'SEOShut', client: 'SEOShut', industry: 'SEO agency', liveUrl: 'https://seoshut.com/', accent: '#16A34A', featured: true, order: 4,
    duration: '3 weeks', startDate: '2024-02-05', endDate: '2024-02-23', services: ['Website design', 'Technical SEO'],
    summary: 'A site for an SEO-focused agency, built to be a credible, fast-loading proof point for its own services.',
    deliverables: ['Clean information architecture across services and case studies', 'Technical SEO and Core Web Vitals pass, since the site is the pitch', 'Lead-capture forms tied into the enquiry workflow'] }),
  P({ slug: 'kingshomecarenj', title: 'Kings Home Care NJ', client: 'Kings Home Care NJ', industry: 'Home care services', liveUrl: 'https://kingshomecarenj.com/', accent: '#E11D48', featured: true, order: 5,
    duration: '2 weeks', startDate: '2023-10-02', endDate: '2023-10-13', services: ['Website design', 'Local SEO'],
    summary: 'A home care provider site designed to reassure families making a sensitive decision and make enquiring simple.',
    deliverables: ['Service pages written for family decision-makers, not just patients', 'Straightforward enquiry form with a fast follow-up path', 'Local SEO across the service area'] }),
  P({ slug: 'divanodesigns', title: 'Divano Designs', client: 'Divano Designs', industry: 'Interior design studio', liveUrl: 'https://divanodesigns.com/', accent: '#7C3AED', featured: true, order: 6, cms: 'Webflow',
    duration: '3 weeks', startDate: '2024-04-01', endDate: '2024-04-19', services: ['Website design'],
    summary: 'A visual-first portfolio site for a design studio, built so the work itself carries the page and enquiries come easily.',
    deliverables: ['Gallery-led layout that keeps the focus on the design work', 'Lightweight image handling for fast load times on a visual site', 'Simple enquiry flow for new project requests'] }),
  P({ slug: 'johnportermd', title: 'Dr. John Porter, MD', client: 'Dr. John Porter, MD', industry: 'Medical practice', liveUrl: 'https://johnportermd.com/', accent: '#0284C7', order: 7, duration: '2 weeks', services: ['Website design', 'Local SEO'],
    summary: 'A physician practice site focused on building trust quickly and making it easy to book an appointment or ask a question.',
    deliverables: ['Trust-building layout: credentials, services and patient info up front', 'Appointment and contact flow simplified to a couple of steps', 'Local SEO for practice-area and condition-specific searches'] }),
  P({ slug: 'liteforcechiro', title: 'LiteForce Chiropractic', client: 'LiteForce Chiropractic', industry: 'Chiropractic care', liveUrl: 'https://www.liteforcechiro.com/', accent: '#EA580C', order: 8, duration: '2 weeks', services: ['Website design', 'Local SEO'],
    summary: 'A chiropractic clinic site rebuilt to explain treatments clearly and turn local searches into booked visits.',
    deliverables: ['Treatment pages written around real patient search intent', 'Booking and contact CTA placed on every page', 'Local SEO: Google Business alignment and on-page signals'] }),
  P({ slug: 'couplestherapymanchester', title: 'Couples Therapy Manchester', client: 'Couples Therapy Manchester', industry: 'Counselling and therapy', liveUrl: 'https://couplestherapymanchester.co.uk/', accent: '#DB2777', order: 9, duration: '2 weeks', services: ['Website design', 'Local SEO'],
    summary: 'A therapy practice site designed to feel calm and trustworthy, with an easy first step for someone reaching out for the first time.',
    deliverables: ['Warm, reassuring layout with a low-friction enquiry form', 'Service pages written in plain, non-clinical language', 'Local SEO for the practice service area'] }),
  P({ slug: 'fusionflo', title: 'FusionFlo', client: 'FusionFlo', industry: 'Digital services agency', liveUrl: 'https://fusionflo.ca/', accent: '#0891B2', order: 10, duration: '3 weeks', services: ['Website design', 'SEO'],
    summary: 'An agency site built to explain services clearly and route different types of visitors to the right next step.',
    deliverables: ['Service pages structured around what clients actually ask for', 'Clear calls to action tied to the sales process', 'On-page SEO groundwork across all core pages'] }),
  P({ slug: 'montrealseoagency', title: 'Montreal SEO Agency', client: 'Montreal SEO Agency', industry: 'SEO agency', liveUrl: 'https://montrealseoagency.ca/', accent: '#D97706', order: 11, duration: '2 weeks', services: ['Website design', 'Local SEO'],
    summary: 'A local SEO agency site, built to rank for the services it sells and convert visitors into discovery calls.',
    deliverables: ['Service pages targeted at Montreal-area search intent', 'On-page and local SEO signals across the site', 'Discovery-call booking flow front and centre'] }),
  P({ slug: 'edmontonmortgagebroker', title: 'Edmonton Mortgage Broker', client: 'Edmonton Mortgage Broker', industry: 'Mortgage brokerage', liveUrl: 'https://edmontonmortgagebroker.com/', accent: '#2563EB', order: 12, duration: '2 weeks', services: ['Website design', 'Local SEO'],
    summary: 'A mortgage broker site built to earn trust fast and make starting a rate conversation as easy as possible.',
    deliverables: ['Clear breakdown of mortgage products and the application process', 'Lead form wired for quick broker follow-up', 'Local SEO for rate and mortgage-broker searches in the area'] }),
  P({ slug: 'twobrosfoundationrepair', title: 'Two Bros Foundation Repair', client: 'Two Bros Foundation Repair', industry: 'Foundation and home repair', liveUrl: 'https://www.twobrosfoundationrepair.com/', accent: '#B45309', order: 13, duration: '2 weeks', services: ['Website design', 'Local SEO'],
    summary: 'A home-repair contractor site built for urgency: fast quote requests and proof the work is done right.',
    deliverables: ['Service pages built around common repair problems people search for', 'Quote-request form with clear expectations on response time', 'Local SEO and Google Business alignment for service areas'] }),
  P({ slug: 'storefriendly', title: 'Store Friendly', client: 'Store Friendly', industry: 'Self-storage', liveUrl: 'https://storefriendly.com.sg/', accent: '#475569', order: 14, platformType: 'custom', cms: '',
    technologies: ['Next.js', 'React', 'Node.js', 'Tailwind CSS'], duration: '3 weeks', services: ['Website design'], scrollDirection: 'up',
    summary: 'A self-storage brand site built so visitors can check locations, sizes and pricing paths without calling in.',
    deliverables: ['Location and unit-size pages structured for quick comparison', 'Enquiry flow built for self-service browsing before contact', 'On-page SEO for location-based storage searches'] }),
];

export const categories = [
  { name: 'Performance', slug: 'performance', color: '#5B8CFF', description: 'Speed, Core Web Vitals and hosting.', order: 1 },
  { name: 'SEO', slug: 'seo', color: '#22C55E', description: 'Rankings, migrations and technical SEO.', order: 2 },
  { name: 'E-commerce', slug: 'e-commerce', color: '#F59E0B', description: 'WooCommerce, Shopify and selling online.', order: 3 },
  { name: 'Work log', slug: 'work-log', color: '#EC4899', description: 'Short daily updates from the desk.', order: 4 },
];

export const posts = [
  { slug: 'five-things-slowing-down-wordpress', title: 'The five things slowing down almost every WordPress site', category: 'performance', kind: 'article', featured: true,
    publishedAt: '2026-09-02', tags: ['WordPress', 'Core Web Vitals'], cover: '/seed/work/work-fusionflo.svg',
    excerpt: 'It is rarely the theme. Here is the order I check things in, and what usually turns out to be the real problem.',
    content: `When a client tells me their WordPress site is slow, the theme gets blamed first. In most audits it is not the theme. Here is the order I check things in.\n\n## 1. Hosting and PHP version\n\nCheap shared hosting with an old PHP version will cap every other fix. Moving to PHP 8.2+ on decent hosting is often a 30 to 40 percent improvement on its own.\n\n## 2. Images\n\nUnresized uploads straight from a phone camera are the most common problem I see. Serve WebP or AVIF, set width and height attributes, and lazy-load anything below the fold.\n\n## 3. Plugins that load everywhere\n\nA contact form plugin that loads its scripts on every page, a slider used on one page that loads on all of them. Audit with Query Monitor and unload per page.\n\n## 4. Third-party scripts\n\nChat widgets, heatmaps and three different analytics tags. Each one costs main-thread time. Delay them until user interaction.\n\n## 5. Caching that is not configured\n\nA caching plugin is installed but page cache is off, or the CDN is caching nothing. Check the response headers, not the settings screen.\n\n> Fix them in this order. Each step makes the next one easier to measure.` },
  { slug: 'redesign-without-losing-rankings', title: 'How to redesign without losing your rankings', category: 'seo', kind: 'article',
    publishedAt: '2026-08-18', tags: ['SEO', 'Migration'], cover: '/seed/work/work-seoshut.svg',
    excerpt: 'A redirect map, a crawl before and after, and the two checks that catch most post-launch traffic drops.',
    content: `A redesign is the most common reason a healthy site loses traffic. It does not have to happen.\n\n## Crawl before you touch anything\n\nExport every indexable URL, its title, its H1 and its inbound links. This is your baseline.\n\n## Build the redirect map\n\nEvery old URL maps to the closest new URL. Not the homepage. One-to-one wherever possible.\n\n## The two checks after launch\n\n1. Crawl the old URL list against the live site and confirm every one returns a 301 to a 200.\n2. Compare titles and H1s on your top 50 landing pages against the baseline.\n\nThose two checks catch most of the drops I am asked to fix later.` },
  { slug: 'woocommerce-or-shopify', title: 'WooCommerce or Shopify: how I actually decide', category: 'e-commerce', kind: 'article',
    publishedAt: '2026-07-29', tags: ['WooCommerce', 'Shopify'], cover: '/seed/work/work-storefriendly.svg',
    excerpt: 'Four questions about your catalogue, your team and your margins. The answers usually pick the platform for you.',
    content: `I build on both. The right one depends on four questions.\n\n## Who will run the store day to day?\n\nA non-technical team that wants zero maintenance leans Shopify.\n\n## How unusual is the catalogue?\n\nComplex product logic, bookings or custom pricing rules lean WooCommerce.\n\n## What are the margins?\n\nShopify transaction and app fees add up on thin margins.\n\n## Where does content matter?\n\nIf content marketing drives sales, WordPress with WooCommerce keeps it all in one place.` },
  { slug: 'log-hover-scroll-cards', title: 'Shipped hover-scroll previews for the new portfolio', category: 'work-log', kind: 'update',
    publishedAt: '2026-10-14', tags: ['Next.js'],
    excerpt: 'Full-page screenshots now scroll slowly on hover, with speed tied to page height so long pages do not rush.',
    content: 'Full-page screenshots now scroll on hover. The scroll speed is tied to the image height, so a long landing page and a short one feel the same pace.' },
  { slug: 'log-core-web-vitals-client', title: 'Client store now passes Core Web Vitals on mobile', category: 'work-log', kind: 'update',
    publishedAt: '2026-10-10', tags: ['Performance'],
    excerpt: 'LCP down from 4.1s to 1.9s after moving hero images to AVIF and delaying chat scripts.',
    content: 'LCP went from 4.1s to 1.9s on mobile. The two changes that mattered: hero images as AVIF with explicit sizes, and the chat widget delayed until first interaction.' },
];

export const services = [
  { slug: 'website-design-development', name: 'Website design and development', icon: 'Layout', order: 1, summary: 'One-time builds, priced by scope. WordPress and Shopify or WooCommerce cover most of these; the top tier is custom-coded.' },
  { slug: 'seo', name: 'SEO services', icon: 'Search', order: 2, summary: 'On-page and technical work, sold as a one-time fix or an ongoing retainer depending on how competitive the space is.' },
  { slug: 'automation-crm', name: 'Automation and CRM', icon: 'Workflow', order: 3, summary: 'n8n, Zapier and Make workflows, plus CRM setup so leads stop falling through the cracks.' },
  { slug: 'maintenance', name: 'Ongoing maintenance', icon: 'Wrench', order: 4, summary: 'Keeps a finished site healthy after launch. A common add-on to any package.' },
];

const K = (o) => ({ currency: 'USD', active: true, checkoutMode: 'buy', ...o });
export const packages = [
  K({ slug: 'landing-page', service: 'website-design-development', name: 'Landing page', price: 150, priceMax: 400, billing: 'one-time', unitNote: '1 page', deliveryDays: 7, order: 1, tagline: 'A single high-intent page for a campaign, launch or offer.', features: ['Custom responsive design', 'Lead form and basic tracking', 'Speed and mobile pass'] }),
  K({ slug: 'small-business-site', service: 'website-design-development', name: 'Small business site', price: 300, priceMax: 900, billing: 'one-time', unitNote: '5 to 10 pages', deliveryDays: 18, popular: true, order: 2, tagline: 'A full WordPress site: home, services, about, contact and more.', features: ['Everything in Landing page', 'On-page SEO across every page', 'Content upload included', '30 days post-launch support'] }),
  K({ slug: 'ecommerce-store', service: 'website-design-development', name: 'E-commerce store', price: 600, priceMax: 2000, billing: 'one-time', unitNote: 'WooCommerce or Shopify', deliveryDays: 30, order: 3, tagline: 'Product catalogue, checkout and payment setup done properly.', features: ['Full storefront build', 'Payment and shipping setup', 'Product import (up to about 100 SKUs)'] }),
  K({ slug: 'custom-web-app', service: 'website-design-development', name: 'Custom web app (MERN)', price: 1500, priceMax: 6000, billing: 'one-time', unitNote: 'Scoped project', order: 4, checkoutMode: 'quote', tagline: 'Dashboards, booking systems, or anything a template cannot do.', features: ['React front end with a Node and Express API', 'MongoDB data layer, auth included', 'Scoped after a discovery call'] }),
  K({ slug: 'seo-audit', service: 'seo', name: 'SEO audit', price: 150, priceMax: 400, billing: 'one-time', deliveryDays: 5, order: 1, tagline: 'Full crawl, on-page and technical fixes, delivered as a report and a punch-list.', features: ['Full site crawl and indexing check', 'On-page fixes across key pages', 'Written report and priority list'] }),
  K({ slug: 'local-seo', service: 'seo', name: 'Local SEO', price: 200, priceMax: 600, billing: 'monthly', order: 2, tagline: 'For single-location businesses trying to win the map pack.', features: ['Google Business Profile management', 'Local citations and NAP consistency', 'Monthly report you can read'] }),
  K({ slug: 'seo-retainer', service: 'seo', name: 'Full SEO retainer', price: 400, priceMax: 1200, billing: 'monthly', popular: true, order: 3, tagline: 'On-page, technical and off-page worked together every month.', features: ['Everything in Local SEO', 'Technical SEO: speed, crawl, schema', 'Content and link-building work', 'Cancel any month, no lock-in'] }),
  K({ slug: 'ecommerce-seo', service: 'seo', name: 'E-commerce SEO', price: 500, priceMax: 1500, billing: 'monthly', order: 4, tagline: 'Category and product-page SEO at catalogue scale.', features: ['Category and product page optimisation', 'Structured data for products', 'Crawl-budget cleanup at scale'] }),
  K({ slug: 'workflow-automation', service: 'automation-crm', name: 'Workflow automation', price: 80, priceMax: 300, billing: 'one-time', unitNote: 'Per workflow', deliveryDays: 4, order: 1, tagline: 'A single automated flow: form to CRM, lead to Slack, invoice to email.', features: ['Built in n8n, Zapier or Make', 'Error handling and a test run', 'Short handover doc'] }),
  K({ slug: 'crm-setup', service: 'automation-crm', name: 'CRM setup and integration', price: 250, priceMax: 800, billing: 'one-time', deliveryDays: 10, popular: true, order: 2, tagline: 'Your CRM configured and wired to your site, forms and inbox.', features: ['Pipeline and stages configured', 'Forms and inbox connected', 'Team training session included'] }),
  K({ slug: 'automation-care', service: 'automation-crm', name: 'Ongoing automation care', price: 150, priceMax: 500, billing: 'monthly', order: 3, tagline: 'Monitoring, fixes and new workflows added as the business grows.', features: ['Uptime monitoring for key flows', 'One or two new workflows per month', 'Cancel any month, no lock-in'] }),
  K({ slug: 'basic-maintenance', service: 'maintenance', name: 'Basic maintenance', price: 40, priceMax: 120, billing: 'monthly', order: 1, tagline: 'The essentials so nothing quietly breaks.', features: ['Core, plugin and theme updates', 'Daily backups and uptime monitoring', 'Security scans'] }),
  K({ slug: 'priority-support', service: 'maintenance', name: 'Priority support', price: 120, priceMax: 350, billing: 'monthly', popular: true, order: 2, tagline: 'Everything in Basic, plus small edits and same-day fixes.', features: ['Everything in Basic maintenance', 'Small content edits included', 'Same-day response on issues'] }),
];

export const pages = [
  { slug: 'work-with-me', title: 'Work with me', showInFooter: false, showInHeader: false, published: true, hideTitle: true,
    seoTitle: 'Work with Manik Hossain', seoDescription: 'How I work, what you get and how to start a website or SEO project.',
    blocks: [
      { type: 'hero', heading: 'A website partner who ships, ranks and sticks around', text: 'Design, build and SEO under one roof. Clear prices, a dated plan and a site you can edit yourself.', primary: { label: 'Start a project', href: '/contact' }, secondary: { label: 'See pricing', href: '/pricing' }, align: 'left', background: 'grid' },
      { type: 'stats', items: [{ value: '7+', label: 'Years building for the web' }, { value: '550+', label: 'Websites delivered' }, { value: '185+', label: 'Clients worldwide' }, { value: '14', label: 'Countries' }] },
      { type: 'features', heading: 'What you get', intro: 'Every build includes the parts that usually get skipped.', columns: '3', items: [
        { icon: 'Layout', title: 'Design that converts', body: 'Pages structured around how your customers decide, not just how they look.' },
        { icon: 'Gauge', title: 'Speed built in', body: 'Core Web Vitals pass on real phones, image pipelines and caching set up.' },
        { icon: 'Search', title: 'SEO from day one', body: 'Schema, metadata, redirects and analytics in place before launch.' },
        { icon: 'ShieldCheck', title: 'Secure and backed up', body: 'Updates, backups and monitoring so nothing breaks quietly.' },
        { icon: 'PenTool', title: 'Easy to edit', body: 'A video walkthrough and an editor you can actually use.' },
        { icon: 'Rocket', title: '30 days of support', body: 'Free fixes and tweaks for a month after launch.' },
      ] },
      { type: 'projects', heading: 'Recent work', source: 'featured', count: 3 },
      { type: 'testimonials', heading: 'What clients say', useSite: true, background: 'surface' },
      { type: 'pricing', heading: 'Packages', intro: 'Pick a package and pay online, or ask for a quote.' },
      { type: 'faq', heading: 'Before you ask', useSite: true },
      { type: 'cta', heading: "Let's build your next site", body: 'Tell me what you need. You get a scope, a timeline and a real number within a day.', primary: { label: 'Start a project', href: '/contact' }, secondary: { label: 'Book a call', href: 'https://calendly.com/developermanikhossain/30min' } },
    ] },
  { slug: 'privacy-policy', title: 'Privacy policy', showInFooter: true, published: true, content: `This site collects only what you send through the contact and checkout forms: your name, email, phone number and project details. It is used to reply to you and deliver the work you order.\n\n## Payments\n\nCard and PayPal payments are processed by the payment provider. Card numbers never reach this server.\n\n## Contact\n\nEmail admin@manikhossain.in to have your data removed.` },
  { slug: 'terms-and-conditions', title: 'Terms and conditions', showInFooter: true, published: true, content: `## Payment\n\nProjects start once payment, or the agreed deposit, is confirmed. Larger projects can be split across milestones.\n\n## Revisions\n\nEach package lists its revisions. Extra changes outside the agreed scope are quoted before work begins.\n\n## Refunds\n\nIf work has not started, you can cancel for a full refund. After work starts, refunds are pro-rated to the work delivered.` },
];

/* Example case studies built from real projects. Edit the wording and add your real numbers
   before switching the feature on in Admin > Site and contact > Features. */
export const caseStudies = [
  { slug: 'js-law-consultations-around-the-clock', title: 'Turning a one-page law firm site into a 24/7 consultation engine', client: 'JS Law', industry: 'Legal services', location: 'Canada',
    liveUrl: 'https://jslaw.ca/', project: 'jslaw', accent: '#4F46E5', cover: '/seed/work/work-jslaw.svg', scrollImage: '/seed/shots/jslaw.svg', featured: true, order: 1, published: true, publishedAt: '2026-09-20',
    duration: '3 weeks', startDate: '2024-03-04', endDate: '2024-03-22', platform: 'WordPress', team: 'Solo: design, build and SEO',
    services: ['Website redesign', 'Local SEO', 'Conversion design'], technologies: ['WordPress', 'Elementor', 'Schema markup'],
    summary: 'JS Law had one page trying to cover every practice area and no way to act outside office hours. A rebuilt structure, page-level SEO and an always-on booking path changed that.',
    overview: 'JS Law is a Canadian law firm with several practice areas. Their site was a single long page: everything was there, but nothing was easy to find, and nothing ranked for the specific services clients search for.',
    challengeIntro: 'The site looked fine. The problem was structure.',
    challenges: [
      { title: 'One page for every practice area', body: 'Search engines and visitors could not tell what the firm actually does best, so specific searches landed on competitors.' },
      { title: 'No path to act after hours', body: 'Potential clients who found the site in the evening had to wait for the office to open, and many never came back.' },
      { title: 'No local search signals', body: 'There was no schema, inconsistent metadata and nothing tying the firm to the area it serves.' },
    ],
    approachIntro: 'Structure first, visuals second, SEO built in rather than bolted on.',
    approach: [
      { phase: 'Week 1', title: 'Map the practice areas', body: 'Listed what clients actually search for and planned one focused page per practice area, each with its own consultation path.' },
      { phase: 'Week 2', title: 'Design and build', body: 'Built the new pages mobile-first on WordPress with a booking flow that works whether or not the office is open.' },
      { phase: 'Week 3', title: 'SEO and launch', body: 'Added local schema and metadata to every page, mapped redirects from the old layout and launched with analytics connected.' },
    ],
    resultsIntro: 'The firm now hears from new clients around the clock.',
    results: 'Consultation requests now arrive in the evenings and on weekends, not just during office hours. Each practice area has its own page that can rank on its own.',
    metrics: [{ label: 'Consultation requests', before: 'Office hours only', after: '24/7' }, { label: 'Practice areas with their own page', before: 'None', after: 'All' }, { label: 'Build time', value: '3 weeks' }],
    testimonial: { quote: '', name: '', role: '' } },
  { slug: 'bmc-centre-find-help-in-two-clicks', title: 'Helping visitors under pressure find care in a couple of clicks', client: 'BMC Centre', industry: 'Healthcare and community services',
    liveUrl: 'https://bmccentre.org/', project: 'bmccentre', accent: '#0D9488', cover: '/seed/work/work-bmccentre.svg', scrollImage: '/seed/shots/bmccentre.svg', featured: true, order: 2, published: true, publishedAt: '2026-09-10',
    duration: '3 weeks', startDate: '2024-05-06', endDate: '2024-05-24', platform: 'WordPress', team: 'Solo: design, build and SEO',
    services: ['Website design', 'Accessibility', 'SEO'], technologies: ['WordPress', 'Elementor'],
    summary: 'People visiting a healthcare site are often stressed and on a phone. The new site puts services and contact details within a couple of clicks from any page.',
    overview: 'BMC Centre offers healthcare and community programmes. Their visitors are often in a hurry, on mobile, and looking for one specific thing.',
    challengeIntro: 'Every extra click costs someone who needs help.',
    challenges: [
      { title: 'Services were buried', body: 'Programmes were spread across long pages, so visitors had to scroll and guess.' },
      { title: 'Mobile visitors struggled', body: 'Most visitors arrive on phones, but the layout and buttons were built for desktop.' },
      { title: 'Low visibility in local search', body: 'The centre was hard to find for the area it serves.' },
    ],
    approachIntro: 'Design for the most stressed visitor first.',
    approach: [
      { phase: 'Week 1', title: 'Simplify navigation', body: 'Grouped every service into clear pages and put contact details in the header and footer of every page.' },
      { phase: 'Week 2', title: 'Accessible, mobile-first build', body: 'Large tap targets, readable type and high contrast on every page.' },
      { phase: 'Week 3', title: 'Local SEO and launch', body: 'On-page SEO and local search signals for the service area, then launch and handover.' },
    ],
    resultsIntro: 'Help is now a couple of clicks away from anywhere on the site.',
    results: 'Services and contact details can be reached in about two clicks from any page, on any device.',
    metrics: [{ label: 'Clicks to contact details', before: 'Several', after: '2' }, { label: 'Layout', before: 'Desktop-first', after: 'Mobile-first' }, { label: 'Build time', value: '3 weeks' }],
    testimonial: { quote: '', name: '', role: '' } },
];

export const apps = [
  { slug: 'example-app-one', name: 'Example app one', tagline: 'Replace this with your first SaaS product.', description: 'Short description of what the app does and who it helps.', status: 'live', url: 'https://example.com', category: 'SaaS', tech: ['Next.js', 'MongoDB'], featured: true, showInFooter: true, published: false, order: 1 },
  { slug: 'example-app-two', name: 'Example app two', tagline: 'A tool you are building next.', description: 'Mark it as Beta or Coming soon until it launches.', status: 'coming-soon', url: '', category: 'Tool', tech: ['React'], featured: true, showInFooter: true, published: false, order: 2 },
];

export const settings = {
  referrals: {
    cookieDays: 30,
    coupons: { enabled: true },
    referral: {
      enabled: false, rewardMode: 'credit', rate: 10, maxReward: 50, rewardCoupon: '', couponDays: 90, friendCoupon: '', firstOrderOnly: true,
      heading: 'Invite a friend, save on your next order',
      intro: 'Share your link. When a friend orders and pays, you get a reward you can use on your next order.',
    },
    affiliate: {
      enabled: false, rate: 20, autoApprove: false, holdDays: 14, minPayout: 50,
      payoutMethods: ['bKash', 'Nagad', 'PayPal', 'Payoneer', 'Bank transfer'],
      heading: 'Earn by recommending my work',
      intro: 'Send clients my way with your affiliate link and earn a commission on every paid order.',
      terms: 'Commission is paid on the amount the client actually pays. It becomes available after the holding period, once the order is not cancelled. Self-referrals and coupon sites are not allowed. Payouts are sent within 7 working days of a request.',
    },
  },
  integrations: {
    seo: { titleTemplate: '%s | Manik Hossain', keywords: 'web designer Bangladesh, WordPress expert, SEO specialist, Shopify developer, Next.js developer', noindex: false },
    searchConsole: { enabled: false, code: '' }, bing: { enabled: false, code: '' },
    ga4: { enabled: false, id: '' }, gtm: { enabled: false, id: '' },
    googleAds: { enabled: false, id: '', conversionLabel: '' }, metaPixel: { enabled: false, id: '' }, clarity: { enabled: false, id: '' },
    customCode: { head: { enabled: false, code: '' }, bodyStart: { enabled: false, code: '' }, bodyEnd: { enabled: false, code: '' } },
    chat: {
      mode: 'builtin', embedCode: '', title: 'Chat with Manik', greeting: "Hi! I'm Manik's assistant. Ask about services, prices or timelines, or leave a message and he will reply within a working day.",
      ai: { provider: 'off', model: '' },
      whatsappHandoff: true, quickReplies: ['How much does a website cost?', 'How long does a website take?', 'Do you do SEO?', 'How can I pay?'],
    },
  },
  navigation: {
    header: [
      { label: 'About', href: '/#about' }, { label: 'Work', href: '/portfolio' }, { label: 'Services', href: '/#services' },
      { label: 'Resume', href: '/resume' }, { label: 'Blog', href: '/blog' }, { label: 'Pricing', href: '/pricing' },
    ],
    cta: { show: true, label: 'Hire me', href: '/contact' },
    footerColumns: [
      { title: 'Explore', links: [{ label: 'About', href: '/#about' }, { label: 'Portfolio', href: '/portfolio' }, { label: 'Resume', href: '/resume' }, { label: 'Blog', href: '/blog' }, { label: 'Pricing', href: '/pricing' }] },
      { title: 'Company', links: [{ label: 'FAQ', href: '/faq' }, { label: 'Contact', href: '/contact' }, { label: 'Products', href: '/apps' }] },
    ],
    showPagesInFooter: true, showAppsInFooter: true, appsTitle: 'Products', bottomText: 'Built with Next.js and MongoDB.',
  },
  email: {
    aiReply: { provider: 'chat', model: '', instructions: '' },
    fromName: 'Manik Hossain', replyTo: 'admin@manikhossain.in', signature: 'Manik Hossain\nWeb designer, WordPress expert and SEO specialist',
    autoReply: { enabled: true, subject: 'Got it, {name}. Your project is on my desk', heading: 'Thanks for reaching out, {name}', body: "Your message just landed in my inbox. I read every brief myself and reply within one working day, usually sooner.\n\nWhile you wait, have a look at recent work or book a free 30-minute call if you would rather talk it through." },
    orders: {
      placed: { enabled: true, subject: 'Order {number} received: {package}', body: 'Thanks for your order. Complete the payment using the details on your order page and I will confirm it within a few hours.' },
      paid: { enabled: true, subject: 'Payment confirmed for {number}', body: 'Your payment is confirmed and your project is booked. I will email you within one working day to kick things off. Your invoice is attached as a link below.' },
      in_progress: { enabled: true, subject: 'Work has started on {package}', body: 'Good news: work on your project has started. You will get progress updates as we go.' },
      completed: { enabled: true, subject: 'Your project is delivered', body: 'Your project is complete. Thank you for working with me. If anything needs a tweak in the next 30 days, just reply to this email.' },
      cancelled: { enabled: true, subject: 'Order {number} has been cancelled', body: 'Your order has been cancelled. If you think this is a mistake or want to restart, reply to this email.' },
    },
    subscription: {
      ownerAlerts: true, reminderDays: '7, 1',
      reminder: { enabled: true, subject: 'Your {package} plan ends on {endDate}', body: 'Your {package} plan ({period}) ends on {endDate}, in {days} days. To keep everything running without a break, renew before that date. If you do not renew, the service is switched off when the plan ends.' },
      expired: { enabled: true, subject: 'Your {package} plan has ended', body: 'Your {package} plan ended on {endDate}, so the service has been switched off. You can renew any time with the button below and I will switch everything back on.' },
    },
  },
  site: {
    name: 'Manik Hossain', role: 'Web designer, WordPress expert and SEO specialist',
    tagline: 'Websites that rank, convert and grow your business.',
    email: 'admin@manikhossain.in', phone: '+880 16500-43801', phoneTel: '+8801650043801',
    whatsapp: 'https://wa.link/fanjtg', calendly: 'https://calendly.com/developermanikhossain/30min',
    location: 'Bangladesh, working worldwide', replyTime: 'Within one working day',
    available: true, availabilityText: 'Available for new projects',
    avatar: '/seed/img/manik-portrait.jpg', cvFile: '/docs/Manik-Hossain-CV.pdf',
    features: { caseStudies: false, caseStudiesInMenu: true, customerAccounts: true, trashDays: 30 },
    socials: [
      { label: 'LinkedIn', url: 'https://www.linkedin.com/in/pro-coder-manik/' },
      { label: 'Facebook', url: 'https://www.facebook.com/ProCoderManik' },
      { label: 'Instagram', url: 'https://www.instagram.com/pro_coder_manik/' },
      { label: 'Fiverr', url: 'https://www.fiverr.com/s/6Y6WK4B' },
      { label: 'Upwork', url: 'https://www.upwork.com/freelancers/~01d223d12ed999fd3c' },
    ],
    footerNote: 'Web designer, WordPress and WooCommerce expert, SEO specialist. 7+ years, 550+ websites, 185+ clients worldwide.',
    seoTitle: 'Manik Hossain | Web Designer, WordPress Expert and SEO Specialist',
    seoDescription: '7+ years of experience, 550+ websites delivered, 185+ happy clients. Custom web design, WordPress, Shopify and SEO that ranks and converts.',
    ogImage: '/seed/img/og-image.svg',
  },
  home: {
    sections: { about: true, services: true, work: true, caseStudies: true, apps: true, process: true, resume: true, pricing: true, testimonials: true, blog: true, faq: true },
    caseStudies: { heading: 'Case studies', intro: 'The problem, what I did about it and what changed. A closer look at a few projects.', count: 3 },
    apps: { heading: 'Products I am building', intro: 'Small, focused tools from my own desk. Some are live, some are on the way.' },
    hero: {
      headline: 'I build websites that rank, convert and grow your business.',
      intro: "I'm Manik Hossain. For 7+ years I've designed and shipped SEO-ready websites on WordPress, Shopify and custom code for clients in 14 countries.",
      primaryLabel: 'Book a free session', secondaryLabel: 'See the work',
    },
    stats: [
      { value: '7+', label: 'years building for the web' }, { value: '550+', label: 'websites delivered' },
      { value: '185+', label: 'clients worldwide' }, { value: '100%', label: 'Core Web Vitals pass on new builds' },
    ],
    tools: ['WordPress', 'Shopify', 'WooCommerce', 'Webflow', 'Squarespace', 'Wix', 'Next.js', 'React', 'Node.js', 'MongoDB', 'Tailwind CSS', 'PHP', 'Figma', 'n8n', 'Zapier', 'HubSpot'],
    about: {
      heading: 'A designer who also cares what happens after launch',
      body: "I'm a web designer, WordPress expert and SEO specialist from Bangladesh. Since 2019 I've built and optimised more than 550 websites, from one-page launches to multi-vendor stores.\n\nI start with how your customers search and decide, then design the structure around that. Speed, schema and analytics go in while I build, not as an afterthought.",
      quote: 'A website should be more than a digital placeholder. It is your story, your brand and your growth engine.',
      image: '/seed/img/manik-portrait.jpg',
    },
    services: {
      heading: 'What I can take off your plate', template: 'service', layout: 'grid', columns: '3', showLinks: true, linkLabel: 'Learn more',
      intro: 'Design, build, and the search work that makes the build worth paying for. Pick one area or hand over the whole thing.',
      groups: [
        { title: 'Web design and development', items: [
          { icon: 'Layout', title: 'Custom website design', body: 'Pixel-perfect designs for portfolios and business sites that match your brand.' },
          { icon: 'RefreshCw', title: 'Redesign and modernisation', body: 'Fresh design, better UX and mobile responsiveness for outdated sites.' },
          { icon: 'FolderPlus', title: 'Website migration', body: 'Move to WordPress or Shopify with no downtime, no data loss and no lost rankings.' },
        ] },
        { title: 'WordPress and e-commerce', items: [
          { icon: 'Code2', title: 'WordPress development', body: 'Custom themes, plugins and functionality built around how you work.' },
          { icon: 'ShoppingBag', title: 'WooCommerce and Shopify stores', body: 'Stores with payment gateways, product management and accurate inventory.' },
          { icon: 'ShieldCheck', title: 'Maintenance and security', body: 'Updates, backups, malware scans and monitoring so nothing breaks quietly.' },
        ] },
        { title: 'SEO and optimisation', items: [
          { icon: 'Search', title: 'On-page and technical SEO', body: 'Meta, structure, crawl errors and indexing problems found and fixed.' },
          { icon: 'Gauge', title: 'Speed optimisation', body: 'Caching, image pipelines and code cleanup that pass Core Web Vitals on real phones.' },
          { icon: 'LineChart', title: 'Keyword research and content', body: 'Search intent mapped to pages, then copy written to rank and convert.' },
        ] },
      ],
    },
    work: { heading: 'Recent work', intro: 'Hover a site to scroll through it. Open any project for the brief, the build and the result.', count: 6 },
    process: {
      heading: 'Four steps, no surprises', template: 'numbered', layout: 'grid', columns: '4',
      steps: [
        { title: 'Discovery call', body: 'Thirty minutes on your business, your customers and what the site has to achieve. You leave with a scope, a price and a date.', time: 'Day 0, free' },
        { title: 'Structure and design', body: 'Sitemap and page structure first, visuals second. You approve the layout before a single pixel gets polished.', time: 'Days 1 to 5' },
        { title: 'Build and optimise', body: 'Development on a staging URL you can watch daily. Speed work, on-page SEO and schema go in as I build.', time: 'Days 6 to 16' },
        { title: 'Launch and support', body: 'Go live with redirects mapped and analytics connected, plus a video walkthrough. Then 30 days of free support.', time: 'Day 17 onward' },
      ],
    },
    resume: { heading: 'Experience and education', intro: 'Two tracks, run in parallel since 2019.' },
    pricing: { heading: 'Packages', intro: 'Clear starting prices. Pick a package and pay online, or book a call for a custom quote.' },
    testimonials: {
      heading: 'What clients say',
      items: [
        { quote: 'This guy is exceptional. He made the delivery in a few hours when I was expecting at least 2 days. Great communication and unmatched skills when it comes to the web.', name: 'Bilal Rajpot', source: 'Fiverr client', avatar: '/seed/avatars/avatar-bilal.svg' },
        { quote: "Bloody awesome work, very professional. My website has already got bookings and it's only been live a few days. Will definitely recommend.", name: 'Tre Vordye', source: 'Fiverr client', avatar: '/seed/avatars/avatar-tre.svg' },
        { quote: "Manik did an awesome job making the website I wanted. He fixed everything that went wrong and I'm really happy with his work. I'll definitely hire him again.", name: 'Kajol598', source: 'Fiverr client', avatar: '/seed/avatars/avatar-kajol.svg' },
      ],
      logos: ['northline', 'veloce', 'harbour-co', 'bloom', 'stackframe', 'mirage', 'cedarroast', 'summittours', 'aurorasupply', 'letzmarket', 'atech', 'officequip'].map((n) => `/seed/logos/${n}.svg`),
    },
    blog: { heading: 'Notes from the build queue', intro: 'Practical write-ups and daily updates from real projects.', count: 3 },
    faq: {
      heading: 'Answers before you ask',
      items: [
        { q: 'How long does a website take to build?', a: 'A landing page takes about 5 to 9 days. A business site of up to 10 pages takes 2 to 3 weeks. Stores and marketplaces take 4 to 6 weeks. You get a dated schedule before any work begins.' },
        { q: 'Do you work with clients outside Bangladesh?', a: 'Most of my work is for clients in Australia, the UK, the US, Canada and the UAE. I keep overlapping hours with your timezone and reply within one working day.' },
        { q: 'What do you need from me to get started?', a: 'Your logo and brand files, any text and images you want used, hosting or domain access, and two or three sites you like. If your content is not ready, I can write and source it.' },
        { q: 'Do you offer ongoing maintenance and support?', a: 'Yes. Every project includes 30 days of free support after launch. After that, monthly care covers updates, backups, security monitoring and content changes.' },
        { q: 'Will my website be mobile-friendly and SEO-optimised?', a: 'Every build is mobile-first and ships with clean heading structure, meta tags, schema markup, compressed images, an XML sitemap and a Core Web Vitals pass.' },
        { q: 'How can I pay?', a: 'bKash, Nagad, Rocket, bank transfer, debit or credit card, PayPal and Payoneer. Pick a package on the pricing page and choose your method at checkout.' },
      ],
    },
    cta: { heading: "Let's make something together", body: "Tell me what you're building. I'll tell you what it takes: scope, timeline and a real number." },
    contact: { heading: 'Start a project', intro: 'Tell me about the site you need. I reply within one working day with next steps and a rough number.' },
  },
  resume: {
    headline: 'Web designer and developer',
    summary: 'Web designer, WordPress expert and SEO specialist with 7+ years of experience and 550+ websites delivered for 185+ clients worldwide. I combine design, development and search so sites look good, load fast and bring in enquiries.',
    experience: [
      { role: 'Web Designer and Developer', company: 'Jumper Media', start: 'Nov 2025', end: 'Present', bullets: ['Design and build marketing sites and landing pages', 'Own on-page SEO and performance for new launches'] },
      { role: 'Technical Expert and Developer', company: 'rankandtrend.com', start: '2024', end: '2025', bullets: ['Technical SEO audits and fixes for client sites', 'Custom WordPress functionality and integrations'] },
      { role: 'Web Designer and WordPress Expert', company: 'seoshut.com', start: '2024', end: '2024', bullets: ['Built and maintained WordPress sites for agency clients'] },
      { role: 'Web Designer and SEO Specialist', company: 'atech.com.bd and letzmarket.com', start: '2023', end: 'Oct 2024', bullets: ['Designed e-commerce and business sites', 'Ran on-page and local SEO campaigns'] },
      { role: 'Web Designer, WordPress, WooCommerce and Shopify Expert', company: 'biditlab.com', start: '2022', end: '2023', bullets: ['Shipped WooCommerce and Shopify stores end to end'] },
      { role: 'WordPress Instructor', company: 'sorobindu.com', start: '2021', end: 'Jun 2022', bullets: ['Taught WordPress site building to new freelancers'] },
      { role: 'Web Designer and Developer', company: 'lfwfacademy.com', start: '2020', end: '2021', bullets: ['Built client websites and course landing pages'] },
    ],
    education: [
      { degree: 'BBA, Finance and Banking', school: 'Hajee Mohammad Danesh Science and Technology University, Dinajpur', start: '2019', end: '2024' },
      { degree: 'Web Design and Development', school: 'Learning and Earning Development Project, ICT Division', start: 'Jan 2019', end: 'Dec 2019' },
      { degree: 'WordPress Website Development', school: 'Learn Freelancing with Fun (LFWF) Academy', start: 'Jan 2019', end: 'Jun 2019' },
      { degree: 'Web Development', school: 'Sorobindu.com', start: 'Jul 2019', end: 'Dec 2019' },
    ],
    skills: [
      { group: 'Development', items: ['HTML5', 'CSS3 and Tailwind', 'JavaScript', 'PHP'], level: 92 },
      { group: 'Platforms and CMS', items: ['WordPress', 'Shopify', 'WooCommerce', 'Squarespace', 'Wix', 'Webflow', 'Bubble'], level: 95 },
      { group: 'Search', items: ['On-page SEO', 'Technical SEO', 'Local SEO', 'Schema markup', 'GA4 and Search Console'], level: 90 },
      { group: 'Full-stack (MERN)', items: ['MongoDB', 'Express.js', 'React', 'Node.js', 'Next.js'], level: 78 },
      { group: 'Automation and CRM', items: ['n8n', 'Zapier', 'Make', 'HubSpot', 'CRM setup'], level: 82 },
    ],
    certifications: [],
    languages: [{ name: 'Bengali', level: 'Native' }, { name: 'English', level: 'Professional' }],
    highlights: [{ value: '7+', label: 'Years' }, { value: '550+', label: 'Websites' }, { value: '185+', label: 'Clients' }, { value: '14', label: 'Countries' }],
    topSkills: [
      { name: 'WordPress', level: 96 }, { name: 'Elementor and page builders', level: 94 }, { name: 'Shopify and WooCommerce', level: 90 },
      { name: 'Technical SEO', level: 90 }, { name: 'HTML, CSS and Tailwind', level: 92 }, { name: 'JavaScript', level: 80 },
      { name: 'React and Next.js', level: 76 }, { name: 'Node.js and MongoDB', level: 72 }, { name: 'Automation (n8n, Zapier)', level: 82 },
    ],
    tools: ['Figma', 'VS Code', 'Git and GitHub', 'Google Analytics 4', 'Search Console', 'Ahrefs', 'Semrush', 'Screaming Frog', 'Cloudflare', 'cPanel', 'Vercel', 'n8n'],
    availability: 'Open to freelance projects and long-term remote roles.',
  },
  seo: {
    titleTemplate: '%s | Manik Hossain', keywords: '', noindex: false, defaultDescription: '',
    business: {
      type: 'ProfessionalService', name: 'Manik Hossain | Web Design and SEO', legalName: '', logo: '/seed/img/favicon.svg', image: '/seed/img/og-image.svg',
      description: 'Web design, WordPress, Shopify and SEO services for small businesses worldwide.',
      phone: '+8801650043801', email: 'admin@manikhossain.in', priceRange: '$$', areaServed: 'Worldwide', foundingDate: '',
      street: '', city: '', region: '', postalCode: '', country: 'BD', lat: '', lng: '', mapUrl: '',
      hours: [],
      sameAs: [], ratingValue: null, ratingCount: null, knowsAbout: ['Web design', 'WordPress', 'Shopify', 'WooCommerce', 'SEO', 'Next.js', 'MERN stack'],
    },
    defaults: { noindexCategories: false, maxImagePreview: 'large', maxSnippet: -1, maxVideoPreview: -1, postSchema: 'BlogPosting', twitterCard: 'summary_large_image' },
    social: { twitter: '', facebookAppId: '', locale: 'en_US' },
    schema: { enabled: true, breadcrumbs: true, global: '' },
    sitemap: { enabled: true, images: true, builtin: true, projects: true, posts: true, categories: true, caseStudies: true, pages: true, exclude: [], changefreq: 'weekly' },
    robots: { mode: 'auto', disallow: ['/admin', '/api', '/checkout', '/order', '/invoice', '/account'], allow: [], blockAi: [], custom: '', extra: '' },
    ai: { llms: true, llmsFull: true, summary: '', details: '', include: { pages: true, services: true, projects: true, posts: true, caseStudies: true } },
    indexnow: { enabled: false, key: '' },
    redirects: { autoSlug: true, monitor404: true },
  },
  aiwriter: {
    provider: 'auto', fallback: true, autoPolish: true, model: '', geminiModels: '', groqModels: '', openrouterModels: '', brandVoice: 'Plain, practical and honest, like a freelancer explaining things to a client over coffee. Short words. Real examples. No hype.', audience: 'small business owners', tone: 'friendly', language: 'English', words: 1500, semrushDatabase: 'us',
    feeds: [
      { name: 'Google News: AI', url: 'https://news.google.com/rss/search?q=artificial+intelligence+when:7d&hl=en-US&gl=US&ceid=US:en' },
      { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
      { name: 'The Verge AI', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml' },
      { name: 'MIT Technology Review AI', url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed' },
      { name: 'Google AI blog', url: 'https://blog.google/technology/ai/rss/' },
      { name: 'OpenAI news', url: 'https://openai.com/news/rss.xml' },
      { name: 'VentureBeat AI', url: 'https://venturebeat.com/category/ai/feed/' },
    ],
  },
  announcement: {
    enabled: false, preset: 'brand', bg: '#2F63E6', text: '#FFFFFF', size: 'normal', dismissible: true, rememberDays: 7, rotate: 6,
    messages: [{ icon: '🎉', text: 'This month only: 20% off every website package with code', code: 'WELCOME20', linkLabel: 'See packages', href: '/pricing', newTab: false }],
    countdownTo: '', countdownLabel: 'Ends in', pages: 'all', paths: [], startAt: '', endAt: '', hideOnMobile: false,
  },
  popups: { enabled: true, maxPerVisit: 2, gapSeconds: 30, mobileFriendly: true },
  payments: {
    currency: 'USD', bdtRate: 122,
    instructions: 'Send the exact amount, then enter the transaction ID below. I confirm the payment and start within one working day.',
    bkash: { enabled: true, accountType: 'Personal', number: '01650043801', note: 'Use Send Money. Add your order number as the reference.' },
    nagad: { enabled: true, accountType: 'Personal', number: '01650043801', note: 'Use Send Money. Add your order number as the reference.' },
    rocket: { enabled: true, accountType: 'Personal', number: '016500438011', note: 'Rocket numbers have 12 digits. Use Send Money.' },
    bank: { enabled: true, bankName: 'Your bank name', accountName: 'Manik Hossain', accountNumber: '0000000000000', branch: 'Branch name', routing: '', swift: '', note: 'International clients: include the SWIFT code above.' },
    card: { enabled: true, note: 'Visa, Mastercard and Amex through SSLCommerz secure checkout.' },
    paypal: { enabled: true, email: 'admin@manikhossain.in', link: '', note: 'Send as Goods and Services, then enter the PayPal transaction ID.' },
    payoneer: { enabled: true, email: 'admin@manikhossain.in', note: 'I will send a Payoneer payment request to your email within a few hours.' },
  },
};

/* Starter forms for the form builder, built from the ready-made templates. */
const tpl = (id) => JSON.parse(JSON.stringify(FORM_TEMPLATES.find((t) => t.id === id).form));
const mk = (name, slug, id, extra = {}) => {
  const t = tpl(id);
  return { ...FORM_DEFAULTS, ...t, name, slug, settings: { ...FORM_DEFAULTS.settings, ...(t.settings || {}) }, notify: { ...FORM_DEFAULTS.notify }, autoReply: { ...FORM_DEFAULTS.autoReply }, payment: { ...FORM_DEFAULTS.payment, ...(t.payment || {}) }, style: { ...FORM_DEFAULTS.style, ...(t.style || {}) }, ...extra };
};
export const forms = [
  mk('Project enquiry', 'project-enquiry', 'quote'),
  mk('Client survey', 'client-survey', 'survey'),
  mk('Newsletter', 'newsletter', 'newsletter'),
];

const ptpl = (id) => JSON.parse(JSON.stringify(POPUP_TEMPLATES.find((t) => t.id === id).doc));
const deep = (a, b) => { const o = { ...a }; for (const k of Object.keys(b || {})) o[k] = b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object' ? deep(a[k], b[k]) : b[k]; return o; };
export const popups = [
  { ...deep(POPUP_DEFAULTS, ptpl('lead-magnet')), name: 'Free audit offer', slug: 'free-audit', template: 'lead-magnet', active: false },
  { ...deep(POPUP_DEFAULTS, ptpl('exit-intent')), name: 'Exit intent', slug: 'exit-intent', template: 'exit-intent', active: false },
];

/* Starter answers for the chatbot (AI IQ) and the /faq page. Grouped by service. Edit or add more in Admin > AI IQ. */
const KB = (category, rows) => rows.map(([question, answer, keywords = []], i) => ({ category, question, answer, keywords, order: i, active: true, showOnFaq: true, source: 'manual' }));
export const knowledge = [
  ...KB('Website design and development', [
    ['How much does a website cost?', 'It depends on the scope. A landing page starts around $150 and goes up to about $400. A small business site of 5 to 10 pages is roughly $300 to $900. An online store on WooCommerce or Shopify is about $600 to $2,000. A custom web app is scoped on its own. The pricing page shows each package, and I confirm an exact price after a short call.', ['cost', 'price', 'budget', 'how much']],
    ['How long does it take to build a website?', 'A landing page takes about 7 days. A small business site takes around 18 days and an online store around 30 days from the day we agree on the brief and content. Fast feedback from you is the biggest factor in the final date.', ['time', 'timeline', 'delivery', 'how long']],
    ['Which platform do you build on, WordPress or Shopify?', 'Most business sites are built on WordPress. Online stores run on WooCommerce or Shopify depending on your catalogue and how you want to sell. Dashboards, booking systems and bigger tools are custom-coded with the MERN stack. I recommend the platform after hearing what you need.', ['wordpress', 'shopify', 'woocommerce', 'platform', 'cms']],
    ['Will my website work well on phones?', 'Yes. Every page is designed for phones first and tested on real devices, then checked for speed and layout on tablets and desktops.', ['mobile', 'responsive', 'phone']],
    ['Can I edit the website myself after launch?', 'Yes. I build it so you can change text, images, products and pages without code, and I record a short video walkthrough so you know where everything is.', ['edit', 'update', 'cms', 'admin']],
    ['Do you redesign or migrate an existing website?', 'Yes. A redesign refreshes the look, structure and speed of an older site. A migration moves your site to WordPress or Shopify with no downtime and with redirects mapped so you keep your Google rankings.', ['redesign', 'migrate', 'migration', 'move']],
    ['Do I get support after the website goes live?', 'Yes. Every project includes 30 days of free support for fixes and small tweaks. After that you can add a monthly maintenance plan if you want ongoing care.', ['support', 'after launch', 'warranty']],
  ]),
  ...KB('SEO services', [
    ['What does an SEO audit include?', 'A full site crawl, on-page and technical checks, speed and indexing problems, and a clear report with a punch-list of fixes in priority order. Audits start around $150 and take about 5 days.', ['audit', 'seo audit', 'report']],
    ['How long does SEO take to show results?', 'Technical fixes can show up within weeks. Rankings for competitive phrases usually take three to six months of steady work. I will tell you honestly if a phrase is too competitive for your budget.', ['results', 'how long', 'rank', 'timeline']],
    ['Do you offer local SEO for a single-location business?', 'Yes. Local SEO covers your Google Business Profile, local citations, reviews and on-page signals so you can win the map pack. It is a monthly service starting around $200.', ['local', 'google business', 'map', 'near me']],
    ['Can you guarantee a number one ranking?', 'No honest SEO can. Google decides rankings and nobody controls them. What I promise is clear work, regular reporting and fixes based on data, so your traffic and leads grow over time.', ['guarantee', 'first page', 'number one']],
    ['Do you do SEO for online stores?', 'Yes. E-commerce SEO covers category and product pages, structured data, internal links and crawl budget at catalogue scale. It is a monthly service starting around $500.', ['ecommerce', 'store', 'product pages']],
    ['Will you write content for my website?', 'Yes. I map search intent to pages first, then write copy that is useful to readers and built to rank, with proper headings, meta titles and descriptions.', ['content', 'blog', 'copywriting', 'keywords']],
  ]),
  ...KB('Automation and CRM', [
    ['What can you automate for my business?', 'Common examples are sending form leads straight into your CRM, alerting your team in Slack or WhatsApp, creating invoices, following up with new leads and syncing data between tools. I build them with n8n, Zapier or Make.', ['automation', 'automate', 'zapier', 'n8n', 'make']],
    ['How much does a workflow automation cost?', 'A single workflow starts around $80 and goes up to about $300 depending on the number of tools and steps. Most take around 4 days.', ['price', 'cost', 'workflow']],
    ['Which CRM do you set up?', 'I set up the CRM that fits your team and connect it to your website, forms and inbox so no lead is lost. We choose it together after a short call. Setup is usually 10 days and starts around $250.', ['crm', 'hubspot', 'pipedrive', 'leads']],
    ['What happens if an automation breaks?', 'Ongoing automation care includes monitoring for key workflows, fixes when an app changes and new workflows as your business grows. Without a plan, I can still fix issues as a one-off job.', ['broken', 'monitor', 'fix']],
  ]),
  ...KB('Ongoing maintenance', [
    ['What does website maintenance cover?', 'Core, plugin and theme updates, daily backups, uptime and security monitoring and malware checks. Priority support adds small edits and same-day fixes.', ['maintenance', 'updates', 'backup', 'security']],
    ['How much is a maintenance plan?', 'Basic maintenance starts around $40 a month and Priority support around $120 a month. The final price depends on the size of your site.', ['price', 'monthly', 'plan']],
    ['My website got hacked, can you help?', 'Yes. I clean the malware, close the hole that was used, restore from a clean backup if needed and set up monitoring so it is caught early next time. Contact me as soon as you notice it.', ['hacked', 'malware', 'virus']],
    ['Can you make my slow website faster?', 'Yes. Speed work covers caching, image handling, code cleanup and hosting checks, aimed at passing Core Web Vitals on real phones, not only on a test tool.', ['speed', 'slow', 'core web vitals', 'performance']],
  ]),
  ...KB('Payments and process', [
    ['How can I pay?', 'You can pay by bKash, Nagad, Rocket, bank transfer, debit or credit card, PayPal or Payoneer. Choose the method at checkout after picking a package.', ['pay', 'payment', 'bkash', 'nagad', 'paypal']],
    ['How does the process work?', 'It starts with a free 30 minute discovery call. Then I plan the structure and design for your approval, build on a staging link you can watch, and launch with analytics and redirects set up. You get 30 days of free support afterwards.', ['process', 'steps', 'how it works']],
    ['Do you work with clients outside Bangladesh?', 'Yes. I work with clients in 14 countries and we communicate by email, WhatsApp and video calls. Payment is available in USD by card, PayPal or Payoneer.', ['international', 'abroad', 'country']],
    ['How do I get started?', 'Book a free call or send a short message about your project. You get a scope, a price and a date within a working day, whether or not you hire me.', ['start', 'hire', 'contact', 'book']],
  ]),
];
