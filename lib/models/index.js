import mongoose from 'mongoose';
const { Schema } = mongoose;
const Mixed = Schema.Types.Mixed;
const model = (name, schema) => mongoose.models[name] || mongoose.model(name, schema);

/* Search and social settings every public content type shares (Yoast / Rank Math style). */
const seo = {
  seoTitle: String, seoDescription: String, seoImage: String, seoNoindex: Boolean,
  focusKeyword: String, keywords: [String], canonical: String, ogTitle: String, ogDescription: String, twitterCard: String,
  robots: { nofollow: Boolean, noarchive: Boolean, nosnippet: Boolean, noimageindex: Boolean },
  sitemap: { exclude: Boolean, priority: Number, changefreq: String },
  breadcrumbTitle: String, schemaMarkup: Mixed, code: Mixed,
};
/* Trash: trashedAt marks an item as deleted (restorable); trashState keeps what to restore. */
const trash = { trashedAt: { type: Date, index: true }, trashState: Mixed };

export const Project = model('Project', new Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, index: true },
  client: String, industry: String, summary: String, content: String,
  liveUrl: String,
  bannerImage: String, scrollImage: String, imageAlt: String, useScrollAsBanner: { type: Boolean, default: true },
  scrollDirection: { type: String, enum: ['down', 'up'], default: 'down' },
  gallery: [String],
  platformType: { type: String, enum: ['cms', 'custom'], default: 'cms' },
  cms: String, technologies: [String], services: [String],
  duration: String, startDate: Date, endDate: Date,
  deliverables: [String], metrics: [{ value: String, label: String }],
  video: { provider: { type: String, default: 'none' }, url: String },
  accent: { type: String, default: '#5B8CFF' },
  workStatus: { type: String, default: 'completed' }, aiMeta: Mixed,
  featured: Boolean, published: { type: Boolean, default: true }, order: { type: Number, default: 0 },
  ...seo,
  ...trash,
}, { timestamps: true }));

export const Post = model('Post', new Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, index: true },
  kind: { type: String, enum: ['article', 'update'], default: 'article' },
  category: String, excerpt: String, cover: String, content: String, tags: [String], blocks: [Mixed], aiMeta: Mixed, aiScore: Number,
  featured: Boolean, published: { type: Boolean, default: true }, publishedAt: { type: Date, default: Date.now },
  ...seo,
  ...trash,
}, { timestamps: true }));

export const Category = model('Category', new Schema({
  name: { type: String, required: true }, slug: { type: String, unique: true },
  description: String, color: { type: String, default: '#5B8CFF' }, order: { type: Number, default: 0 }, ...seo,
  ...trash,
}, { timestamps: true }));

export const Service = model('Service', new Schema({
  name: { type: String, required: true }, slug: { type: String, unique: true },
  summary: String, description: String, icon: String, group: String,
  order: { type: Number, default: 0 }, active: { type: Boolean, default: true },
  ...trash,
}, { timestamps: true }));

export const Package = model('Package', new Schema({
  name: { type: String, required: true }, slug: { type: String, unique: true },
  service: String, tagline: String,
  price: { type: Number, default: 0 }, priceMax: Number, currency: { type: String, default: 'USD' },
  billing: { type: String, default: 'one-time' }, unitNote: String,
  deliveryDays: Number, revisions: String, features: [String],
  popular: Boolean, active: { type: Boolean, default: true }, order: { type: Number, default: 0 },
  ctaLabel: String, checkoutMode: { type: String, default: 'buy' }, checkoutNote: String,
  // Monthly / yearly choice: price is the monthly price, yearly = price x 12 minus the discount (or a typed yearlyPrice)
  monthlyYearly: { type: Boolean, default: false }, yearlyDiscount: { type: Number, default: 0 }, yearlyPrice: Number,
  ...trash,
}, { timestamps: true }));

export const Order = model('Order', new Schema({
  number: { type: String, unique: true, index: true }, token: String,
  package: Mixed, amount: Number, currency: String,
  customer: { name: String, email: String, phone: String, company: String, country: String },
  requirements: String, method: String,
  status: { type: String, default: 'pending_payment' },
  payment: { provider: String, transactionId: String, senderNumber: String, reference: String, paidAt: Date, amountLocal: Number, raw: Mixed },
  notes: String, invoiceNumber: String, emails: [Mixed],
  history: [{ status: String, at: { type: Date, default: Date.now }, note: String }],
  // Customer portal: what the buyer sees in /account
  customerId: { type: Schema.Types.ObjectId, index: true },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  dueDate: Date,
  updates: [{ text: String, link: String, linkLabel: String, at: { type: Date, default: Date.now } }],
  deliverables: [{ label: String, url: String, note: String }],
  // Discounts: amount = subtotal - discount - creditUsed
  subtotal: Number, discount: { type: Number, default: 0 }, creditUsed: { type: Number, default: 0 },
  coupon: { code: String, type: { type: String }, value: Number },
  referral: { code: String, customerId: Schema.Types.ObjectId, kind: { type: String }, rewarded: Boolean },
  adjust: { couponReleased: Boolean, creditRestored: Boolean, voided: Boolean },
  // Subscription (monthly or yearly plans): the service runs from startsAt to endsAt
  subscription: {
    period: String, // monthly | yearly
    status: { type: String, default: 'none' }, // none | pending | active | expired | renewed | cancelled
    startsAt: Date, endsAt: Date, expiredAt: Date, reminders: [Number], renewedBy: String, noAuto: Boolean,
  },
}, { timestamps: true }));

export const Message = model('Message', new Schema({
  name: String, email: String, phone: String, subject: String, budget: String, service: String,
  message: String, read: { type: Boolean, default: false }, starred: Boolean, replies: [Mixed], autoReplied: Boolean,
  customerId: { type: Schema.Types.ObjectId, index: true }, orderNumber: String,
}, { timestamps: true }));

export const Page = model('Page', new Schema({
  title: { type: String, required: true }, slug: { type: String, unique: true },
  content: String, blocks: [Mixed], layout: { type: String, default: 'blocks' }, hideTitle: Boolean,
  builtin: { type: String, index: true }, // set on built-in pages (home, portfolio, blog...): the page key
  published: { type: Boolean, default: true }, showInFooter: Boolean, showInHeader: Boolean, ...seo,
  ...trash,
}, { timestamps: true }));

export const Media = model('Media', new Schema({
  url: String, name: String, type: String, size: Number,
}, { timestamps: true }));

export const Setting = model('Setting', new Schema({
  key: { type: String, unique: true }, data: Mixed,
}, { timestamps: true, minimize: false }));

export const User = model('User', new Schema({
  email: { type: String, unique: true }, name: String, passwordHash: String,
  role: { type: String, default: 'administrator' }, disabled: Boolean, avatar: String, phone: String, note: String,
  failedLogins: { type: Number, default: 0 }, lockUntil: Date, lastLoginAt: Date, lastLoginIp: String,
}, { timestamps: true }));

/* Buyers who sign up at /account. Secrets are excluded from queries by default (select: false). */
export const Customer = model('Customer', new Schema({
  email: { type: String, unique: true, index: true, lowercase: true, trim: true, required: true },
  name: String, phone: String, company: String, country: String,
  passwordHash: { type: String, select: false },
  emailVerified: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  tokenVersion: { type: Number, default: 0 },
  verifyTokenHash: { type: String, select: false }, verifyExpires: { type: Date, select: false },
  resetTokenHash: { type: String, select: false }, resetExpires: { type: Date, select: false },
  failedLogins: { type: Number, default: 0 }, lockUntil: Date, lastLoginAt: Date, lastLoginIp: String,
  messagesSeenAt: Date, notes: String,
  avatar: String,
  // Referrals and affiliates
  refCode: { type: String, unique: true, sparse: true, index: true },
  referredBy: { type: Schema.Types.ObjectId, index: true },
  credit: { type: Number, default: 0 },
  refStats: { clicks: { type: Number, default: 0 }, signups: { type: Number, default: 0 }, orders: { type: Number, default: 0 } },
  affiliate: {
    status: { type: String, default: 'none' }, // none | pending | approved | rejected | paused
    rate: Number, about: String, website: String, payoutMethod: String, payoutDetails: String,
    appliedAt: Date, approvedAt: Date, adminNote: String,
  },
  ...trash,
}, { timestamps: true }));

/* Discount codes made in Admin > Coupons (source admin) or given as referral rewards (source referral). */
export const Coupon = model('Coupon', new Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: String,
  type: { type: String, enum: ['percent', 'fixed'], default: 'percent' },
  value: { type: Number, default: 10, min: 0 }, currency: { type: String, default: 'USD' },
  maxDiscount: Number, minAmount: Number, packages: [String],
  startsAt: Date, expiresAt: Date,
  maxUses: Number, usesCount: { type: Number, default: 0 }, perCustomer: Number,
  firstOrderOnly: Boolean, customersOnly: Boolean,
  assignedTo: { type: Schema.Types.ObjectId, index: true },
  source: { type: String, default: 'admin' },
  active: { type: Boolean, default: true },
  ...trash,
}, { timestamps: true }));

/* Every reward earned: affiliate commission (cash) or referral reward (store credit or coupon). */
export const Commission = model('Commission', new Schema({
  kind: { type: String, enum: ['affiliate', 'referral'] },
  customerId: { type: Schema.Types.ObjectId, index: true },
  orderId: Schema.Types.ObjectId, orderNumber: String, buyerName: String,
  base: Number, rate: Number, amount: Number, currency: String,
  couponCode: String,
  status: { type: String, default: 'pending' }, // pending | requested | paid | void | credited
  availableAt: Date, payoutId: Schema.Types.ObjectId, note: String,
}, { timestamps: true }));

export const Payout = model('Payout', new Schema({
  customerId: { type: Schema.Types.ObjectId, index: true }, name: String, email: String,
  amount: Number, currency: String, method: String, details: String,
  status: { type: String, default: 'requested' }, // requested | paid | rejected
  reference: String, note: String, paidAt: Date,
}, { timestamps: true }));

export const CaseStudy = model('CaseStudy', new Schema({
  title: { type: String, required: true }, slug: { type: String, unique: true, index: true },
  client: String, clientLogo: String, industry: String, location: String, liveUrl: String, project: String,
  summary: String, cover: String, scrollImage: String, accent: { type: String, default: '#6391FF' },
  duration: String, startDate: Date, endDate: Date, services: [String], technologies: [String], platform: String, team: String,
  overview: String, challengeIntro: String, challenges: [{ title: String, body: String }],
  approachIntro: String, approach: [{ phase: String, duration: String, title: String, body: String }],
  resultsIntro: String, results: String, metrics: [{ label: String, before: String, after: String, value: String }],
  testimonial: { quote: String, name: String, role: String, avatar: String },
  gallery: [String], blocks: [Mixed],
  featured: Boolean, published: { type: Boolean, default: true }, order: { type: Number, default: 0 }, publishedAt: { type: Date, default: Date.now },
  ...seo,
  ...trash,
}, { timestamps: true }));

export const App = model('App', new Schema({
  name: { type: String, required: true }, slug: { type: String, unique: true },
  tagline: String, description: String, logo: String, image: String, url: String,
  status: { type: String, default: 'live' }, category: String, tech: [String],
  featured: Boolean, showInFooter: { type: Boolean, default: true }, published: { type: Boolean, default: true }, order: { type: Number, default: 0 },
  ...trash,
}, { timestamps: true }));

export const Contact = model('Contact', new Schema({
  email: { type: String, unique: true, index: true }, name: String, phone: String, company: String, country: String,
  stage: { type: String, default: 'new' }, value: Number, tags: [String], notes: String, source: String,
  lastContactAt: Date, orders: { type: Number, default: 0 }, messages: { type: Number, default: 0 }, spent: { type: Number, default: 0 },
  activity: [{ type: { type: String }, text: String, at: { type: Date, default: Date.now } }],
  ...trash,
}, { timestamps: true }));

export const RateHit = model('RateHit', new Schema({
  key: { type: String, unique: true }, count: { type: Number, default: 0 }, expiresAt: { type: Date, index: { expires: 0 } },
}));

/* Form builder: a form definition and the answers people send. */
export const Form = model('Form', new Schema({
  name: { type: String, required: true }, slug: { type: String, unique: true, index: true },
  title: String, description: String, fields: [Mixed], settings: Mixed, notify: Mixed, autoReply: Mixed, payment: Mixed, style: Mixed,
  active: { type: Boolean, default: true }, entries: { type: Number, default: 0 }, views: { type: Number, default: 0 },
  ...trash,
}, { timestamps: true, minimize: false }));

export const FormEntry = model('FormEntry', new Schema({
  formId: { type: Schema.Types.ObjectId, index: true }, formSlug: String, formName: String,
  data: Mixed, labels: Mixed, email: String, name: String,
  status: { type: String, default: 'new', index: true }, // new | read | starred | spam
  payment: { orderNumber: String, amount: Number, currency: String, method: String, lines: Mixed },
  page: String, referrer: String, ip: String, ua: String,
}, { timestamps: true }));

export const Popup = model('Popup', new Schema({
  name: { type: String, required: true }, slug: { type: String, unique: true, index: true },
  active: { type: Boolean, default: false }, priority: { type: Number, default: 0 },
  template: String, layout: String, position: String, size: String, contentType: String,
  content: Mixed, design: Mixed, trigger: Mixed, target: Mixed, frequency: Mixed,
  stats: { views: { type: Number, default: 0 }, clicks: { type: Number, default: 0 }, conversions: { type: Number, default: 0 } },
  ...trash,
}, { timestamps: true, minimize: false }));

export const Redirect = model('Redirect', new Schema({
  from: { type: String, required: true, index: true }, to: String,
  code: { type: Number, default: 301 }, match: { type: String, default: 'exact' }, // exact | prefix | regex
  keepQuery: { type: Boolean, default: true }, active: { type: Boolean, default: true }, note: String,
  hits: { type: Number, default: 0 }, lastHitAt: Date, auto: Boolean,
  ...trash,
}, { timestamps: true }));

export const NotFoundHit = model('NotFoundHit', new Schema({
  path: { type: String, unique: true }, hits: { type: Number, default: 0 }, lastAt: Date, referrer: String, ua: String,
}, { timestamps: true }));

/* AI IQ: answers you teach the chatbot (and show on /faq), and questions it could not answer. */
export const Knowledge = model('Knowledge', new Schema({
  question: { type: String, required: true }, answer: { type: String, required: true },
  category: { type: String, default: 'General', index: true }, keywords: [String],
  active: { type: Boolean, default: true }, showOnFaq: { type: Boolean, default: true }, order: { type: Number, default: 0 },
  slug: String, showInHelp: { type: Boolean, default: true }, body: String, // Help center: own address, on or off, optional longer article
  source: { type: String, default: 'manual' }, // manual | ai | learned | import
  ...trash,
}, { timestamps: true }));

export const ChatGap = model('ChatGap', new Schema({
  question: { type: String, unique: true }, count: { type: Number, default: 1 }, lastAt: Date, resolved: { type: Boolean, default: false },
}, { timestamps: true }));

export const MODELS = { projects: Project, posts: Post, categories: Category, services: Service, packages: Package, orders: Order, messages: Message, pages: Page, media: Media, apps: App, contacts: Contact, customers: Customer, coupons: Coupon, 'case-studies': CaseStudy, forms: Form, popups: Popup, redirects: Redirect, knowledge: Knowledge };
