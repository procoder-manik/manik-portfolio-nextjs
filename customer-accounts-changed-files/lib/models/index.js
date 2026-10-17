import mongoose from 'mongoose';
const { Schema } = mongoose;
const Mixed = Schema.Types.Mixed;
const model = (name, schema) => mongoose.models[name] || mongoose.model(name, schema);

const seo = { seoTitle: String, seoDescription: String };

export const Project = model('Project', new Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, index: true },
  client: String, industry: String, summary: String, content: String,
  liveUrl: String,
  bannerImage: String, scrollImage: String, useScrollAsBanner: { type: Boolean, default: true },
  scrollDirection: { type: String, enum: ['down', 'up'], default: 'down' },
  gallery: [String],
  platformType: { type: String, enum: ['cms', 'custom'], default: 'cms' },
  cms: String, technologies: [String], services: [String],
  duration: String, startDate: Date, endDate: Date,
  deliverables: [String], metrics: [{ value: String, label: String }],
  video: { provider: { type: String, default: 'none' }, url: String },
  accent: { type: String, default: '#5B8CFF' },
  featured: Boolean, published: { type: Boolean, default: true }, order: { type: Number, default: 0 },
  ...seo,
}, { timestamps: true }));

export const Post = model('Post', new Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, index: true },
  kind: { type: String, enum: ['article', 'update'], default: 'article' },
  category: String, excerpt: String, cover: String, content: String, tags: [String], blocks: [Mixed],
  featured: Boolean, published: { type: Boolean, default: true }, publishedAt: { type: Date, default: Date.now },
  ...seo,
}, { timestamps: true }));

export const Category = model('Category', new Schema({
  name: { type: String, required: true }, slug: { type: String, unique: true },
  description: String, color: { type: String, default: '#5B8CFF' }, order: { type: Number, default: 0 },
}, { timestamps: true }));

export const Service = model('Service', new Schema({
  name: { type: String, required: true }, slug: { type: String, unique: true },
  summary: String, description: String, icon: String, group: String,
  order: { type: Number, default: 0 }, active: { type: Boolean, default: true },
}, { timestamps: true }));

export const Package = model('Package', new Schema({
  name: { type: String, required: true }, slug: { type: String, unique: true },
  service: String, tagline: String,
  price: { type: Number, default: 0 }, priceMax: Number, currency: { type: String, default: 'USD' },
  billing: { type: String, default: 'one-time' }, unitNote: String,
  deliveryDays: Number, revisions: String, features: [String],
  popular: Boolean, active: { type: Boolean, default: true }, order: { type: Number, default: 0 },
  ctaLabel: String, checkoutMode: { type: String, default: 'buy' }, checkoutNote: String,
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
}, { timestamps: true }));

export const Message = model('Message', new Schema({
  name: String, email: String, phone: String, subject: String, budget: String, service: String,
  message: String, read: { type: Boolean, default: false }, starred: Boolean, replies: [Mixed], autoReplied: Boolean,
  customerId: { type: Schema.Types.ObjectId, index: true }, orderNumber: String,
}, { timestamps: true }));

export const Page = model('Page', new Schema({
  title: { type: String, required: true }, slug: { type: String, unique: true },
  content: String, blocks: [Mixed], layout: { type: String, default: 'blocks' }, hideTitle: Boolean,
  published: { type: Boolean, default: true }, showInFooter: Boolean, showInHeader: Boolean, ...seo,
}, { timestamps: true }));

export const Media = model('Media', new Schema({
  url: String, name: String, type: String, size: Number,
}, { timestamps: true }));

export const Setting = model('Setting', new Schema({
  key: { type: String, unique: true }, data: Mixed,
}, { timestamps: true, minimize: false }));

export const User = model('User', new Schema({
  email: { type: String, unique: true }, name: String, passwordHash: String,
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
  seoTitle: String, seoDescription: String,
}, { timestamps: true }));

export const App = model('App', new Schema({
  name: { type: String, required: true }, slug: { type: String, unique: true },
  tagline: String, description: String, logo: String, image: String, url: String,
  status: { type: String, default: 'live' }, category: String, tech: [String],
  featured: Boolean, showInFooter: { type: Boolean, default: true }, published: { type: Boolean, default: true }, order: { type: Number, default: 0 },
}, { timestamps: true }));

export const Contact = model('Contact', new Schema({
  email: { type: String, unique: true, index: true }, name: String, phone: String, company: String, country: String,
  stage: { type: String, default: 'new' }, value: Number, tags: [String], notes: String, source: String,
  lastContactAt: Date, orders: { type: Number, default: 0 }, messages: { type: Number, default: 0 }, spent: { type: Number, default: 0 },
  activity: [{ type: { type: String }, text: String, at: { type: Date, default: Date.now } }],
}, { timestamps: true }));

export const RateHit = model('RateHit', new Schema({
  key: { type: String, unique: true }, count: { type: Number, default: 0 }, expiresAt: { type: Date, index: { expires: 0 } },
}));

export const MODELS = { projects: Project, posts: Post, categories: Category, services: Service, packages: Package, orders: Order, messages: Message, pages: Page, media: Media, apps: App, contacts: Contact, customers: Customer, 'case-studies': CaseStudy };
