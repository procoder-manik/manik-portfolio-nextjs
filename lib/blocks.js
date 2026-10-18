import { SERVICE_ICONS } from './options';
import { CARD_TEMPLATES } from './card-templates';

/* Pre-built page sections. Each block = { type, ...fields }. The admin "blocks" field
   uses these definitions; components/site/blocks renders them with the site design. */
const L = (name, label, type = 'text', extra = {}) => ({ name, label, type, ...extra });
const btn = (p, label) => [L(`${p}.label`, `${label} text`, 'text', { half: true }), L(`${p}.href`, `${label} link`, 'text', { half: true, placeholder: '/contact or https://' })];
const common = [
  L('background', 'Background', 'select', { half: true, options: [{ value: 'none', label: 'Plain' }, { value: 'surface', label: 'Tinted panel' }, { value: 'grid', label: 'Blueprint grid' }, { value: 'accent', label: 'Accent (blue)' }] }),
  L('anchor', 'Anchor id (for #links)', 'text', { half: true, placeholder: 'e.g. services' }),
];

const cardItems = L('items', 'Cards', 'repeater', { fields: [L('icon', 'Icon', 'select', { half: true, options: SERVICE_ICONS, info: 'The small picture on service, glow and compact cards. Empty picks one for you.' }), L('title', 'Title', 'text', { half: true, info: 'The card headline.' }), L('body', 'Text', 'textarea', { info: 'A short description. For testimonial cards this is the quote.' }), L('meta', 'Small note', 'text', { half: true, info: 'A small monospace line. Numbered cards: DAY 0 FREE. Price cards: the billing text like one time.' }), L('value', 'Big value', 'text', { half: true, info: 'Used by Big number cards (550+) and Price cards ($599).' }), L('tag', 'Tag', 'text', { half: true, info: 'A small label on image and price cards, for example Popular.' }), L('image', 'Image', 'image', { info: 'The picture on image cards.' }), L('name', 'Person name', 'text', { half: true, info: 'Testimonial cards: who said it.' }), L('role', 'Person role', 'text', { half: true, info: 'Testimonial cards: their job or company.' }), L('avatar', 'Person photo', 'image', { info: 'Testimonial cards: a small round photo.' }), L('list', 'List (one per line)', 'textarea', { info: 'Price cards: each line becomes a tick point.' }), L('linkLabel', 'Link text', 'text', { half: true, info: 'The words of the link, for example Learn more. Type a single dash - to hide the link on this card.' }), L('href', 'Link to', 'text', { half: true, info: 'A page like /pricing or a full https:// address.' })], info: 'Add one entry per card. Which boxes a card uses depends on the template you picked above.' });
const cardCtl = [
  L('template', 'Card design', 'cardTemplate', { info: 'Pick how every card looks. The preview below updates at once, so you can try each design.' }),
  L('layout', 'Layout', 'segmented', { half: true, options: [{ value: 'grid', label: 'Grid' }, { value: 'carousel', label: 'Carousel' }], info: 'Grid shows all cards at once in columns. Carousel shows a row you can swipe or slide with arrows, good for many cards or small screens.' }),
  L('columns', 'Cards per row', 'segmented', { half: true, options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }], info: 'How many cards sit side by side on a wide screen. Phones always show one.' }),
  L('autoplay', 'Slide automatically', 'switch', { showIf: (v) => v.layout === 'carousel', info: 'The carousel moves on by itself and pauses when the mouse is over it. Off: visitors slide with the arrows, the dots or a swipe.' }),
  L('interval', 'Seconds between slides', 'number', { half: true, showIf: (v) => v.layout === 'carousel' && v.autoplay, info: 'How long each slide stays before the next one. Between 2 and 30 seconds. Empty uses 5.' }),
  L('linkLabel', 'Default link text', 'text', { info: 'The link text used on cards that do not have their own, for example Learn more.' }),
  L('html', 'Card HTML', 'code', { showIf: (v) => v.template === 'custom', info: 'The markup of one card. Use {title}, {body}, {icon}, {image}, {link}, {number}, {meta}, {value}.' }),
  L('css', 'Card CSS', 'code', { showIf: (v) => v.template === 'custom', info: 'Style rules for your card markup. They only affect this section.' }),
];
export const layoutCtl = [
  L('layout', 'Layout', 'segmented', { half: true, options: [{ value: 'grid', label: 'Grid' }, { value: 'carousel', label: 'Carousel' }], info: 'Grid shows every card at once. Carousel shows a row visitors can slide.' }),
  L('columns', 'Cards per row', 'segmented', { half: true, options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }], info: 'How many cards sit side by side on a wide screen. Phones always show one.' }),
  L('autoplay', 'Slide automatically', 'switch', { showIf: (v) => v.layout === 'carousel', info: 'The carousel moves on by itself and pauses when the mouse is over it. Off: visitors slide with the arrows, the dots or a swipe.' }),
  L('interval', 'Seconds between slides', 'number', { half: true, showIf: (v) => v.layout === 'carousel' && v.autoplay, info: 'How long each slide stays before the next one. Between 2 and 30 seconds. Empty uses 5.' }),
];
export const BLOCKS = {
  hero: { label: 'Hero', icon: 'Sparkles', desc: 'Big headline, intro and buttons', fields: [L('heading', 'Headline', 'textarea'), L('text', 'Intro', 'textarea'), ...btn('primary', 'Main button'), ...btn('secondary', 'Second button'), L('image', 'Image (optional)', 'image'), L('align', 'Alignment', 'segmented', { options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Centre' }] })] },
  richText: { label: 'Text', icon: 'AlignLeft', desc: 'Formatted text with headings, lists and images', fields: [L('content', 'Content', 'markdown'), L('width', 'Width', 'segmented', { options: [{ value: 'narrow', label: 'Reading width' }, { value: 'wide', label: 'Full width' }] })] },
  split: { label: 'Image and text', icon: 'Columns2', desc: 'Image on one side, text on the other', fields: [L('heading', 'Heading'), L('body', 'Text', 'markdown'), L('image', 'Image', 'image'), L('imageSide', 'Image side', 'segmented', { options: [{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }] }), ...btn('button', 'Button')] },
  cards: { label: 'Cards', icon: 'LayoutGrid', desc: 'Service, step, image, price or testimonial cards in 10 designs, as grid or carousel', fields: [L('eyebrow', 'Small label above the heading', 'text', { info: 'A short uppercase line above the heading, for example WEB DESIGN AND DEVELOPMENT.' }), L('heading', 'Heading'), L('intro', 'Intro', 'textarea'), ...cardCtl, { name: 'cardsPreview', type: 'cardsPreview' }, cardItems] },
  timeline: { label: 'Timeline', icon: 'GitCommitVertical', desc: 'Animated vertical timeline for education, experience or history', fields: [L('heading', 'Heading'), L('intro', 'Intro', 'textarea'), L('items', 'Entries', 'repeater', { fields: [L('when', 'When', 'text', { half: true, placeholder: '2019 - 2024', info: 'The date or period, shown in small monospace type.' }), L('title', 'Title', 'text', { half: true, info: 'The main line of the entry.' }), L('sub', 'Place or subtitle', 'text', { info: 'Where it happened, for example a school or company.' }), L('body', 'Details', 'textarea', { info: 'Optional short description.' })], info: 'Entries from oldest to newest or the other way round. The line draws itself as visitors scroll.' })] },
  features: { label: 'Feature grid', icon: 'LayoutGrid', desc: 'Cards with icon, title and text', fields: [L('heading', 'Heading'), L('intro', 'Intro', 'textarea'), ...cardCtl, { name: 'cardsPreview', type: 'cardsPreview' }, cardItems] },
  stats: { label: 'Numbers', icon: 'BarChart3', desc: 'A row of big numbers', fields: [L('heading', 'Heading (optional)'), L('items', 'Numbers', 'repeater', { fields: [L('value', 'Value', 'text', { half: true }), L('label', 'Label', 'text', { half: true })] })] },
  steps: { label: 'Steps', icon: 'ListOrdered', desc: 'Numbered process cards', fields: [L('heading', 'Heading'), L('intro', 'Intro', 'textarea'), ...cardCtl, { name: 'cardsPreview', type: 'cardsPreview' }, cardItems] },
  projects: { label: 'Portfolio', icon: 'Briefcase', desc: 'Project cards with hover scroll', fields: [L('heading', 'Heading'), L('intro', 'Intro', 'textarea'), L('source', 'Which projects', 'segmented', { options: [{ value: 'featured', label: 'Featured' }, { value: 'latest', label: 'Latest' }] }), L('count', 'How many', 'number', { half: true }), ...layoutCtl] },
  posts: { label: 'Blog posts', icon: 'Newspaper', desc: 'Latest articles', fields: [L('heading', 'Heading'), L('category', 'Category', 'ref', { source: 'categories', valueKey: 'slug', labelKey: 'name', half: true }), L('count', 'How many', 'number', { half: true }), ...layoutCtl] },
  pricing: { label: 'Pricing', icon: 'Tag', desc: 'Package cards from your services', fields: [L('heading', 'Heading'), L('intro', 'Intro', 'textarea'), L('service', 'Only this service (empty = tabs for all)', 'ref', { source: 'services', valueKey: 'slug', labelKey: 'name' }), ...layoutCtl] },
  caseStudies: { label: 'Case studies', icon: 'Trophy', desc: 'Client stories (hidden while the feature is off)', fields: [L('heading', 'Heading'), L('intro', 'Intro', 'textarea'), L('count', 'How many', 'number', { half: true })] },
  apps: { label: 'Products', icon: 'AppWindow', desc: 'Your apps and SaaS products', fields: [L('heading', 'Heading'), L('intro', 'Intro', 'textarea')] },
  testimonials: { label: 'Testimonials', icon: 'Quote', desc: 'Client quotes', fields: [L('heading', 'Heading'), ...layoutCtl, L('useSite', 'Use the testimonials from Home page settings', 'switch'), L('items', 'Quotes', 'repeater', { showIf: (v) => !v.useSite, fields: [L('quote', 'Quote', 'textarea'), L('name', 'Name', 'text', { half: true }), L('source', 'Source', 'text', { half: true }), L('avatar', 'Photo', 'image')] })] },
  logos: { label: 'Logo strip', icon: 'GalleryHorizontal', desc: 'Scrolling client logos', fields: [L('heading', 'Heading (optional)'), L('images', 'Logos', 'images')] },
  gallery: { label: 'Gallery', icon: 'Images', desc: 'Image grid', fields: [L('heading', 'Heading (optional)'), L('images', 'Images', 'images'), L('columns', 'Columns', 'segmented', { options: [{ value: '2', label: '2' }, { value: '3', label: '3' }] })] },
  video: { label: 'Video', icon: 'PlayCircle', desc: 'YouTube, Vimeo, Loom or a file', fields: [L('heading', 'Heading (optional)'), L('url', 'Video link', 'url'), L('caption', 'Caption')] },
  faq: { label: 'FAQ', icon: 'HelpCircle', desc: 'Questions and answers', fields: [L('heading', 'Heading'), L('useSite', 'Use the FAQ from Home page settings', 'switch'), L('items', 'Questions', 'repeater', { showIf: (v) => !v.useSite, fields: [L('q', 'Question'), L('a', 'Answer', 'textarea')] })] },
  cta: { label: 'Call to action', icon: 'Megaphone', desc: 'Blue banner with buttons', fields: [L('heading', 'Heading'), L('body', 'Text', 'textarea'), ...btn('primary', 'Main button'), ...btn('secondary', 'Second button')] },
  contactForm: { label: 'Contact form', icon: 'Mail', desc: 'Your contact form with details', fields: [L('heading', 'Heading'), L('intro', 'Intro', 'textarea')] },
  form: { label: 'Form (form builder)', icon: 'ClipboardList', desc: 'Any form you built in Marketing > Forms', fields: [L('heading', 'Heading'), L('intro', 'Intro', 'textarea'), L('form', 'Which form', 'ref', { source: 'forms', valueKey: 'slug', labelKey: 'name', hint: 'Create and edit forms in Marketing > Forms.' }), L('layout', 'Layout', 'segmented', { options: [{ value: 'beside', label: 'Text beside the form' }, { value: 'stacked', label: 'Text above the form' }] })] },
  spacer: { label: 'Spacer', icon: 'SeparatorHorizontal', desc: 'Space or a divider line', fields: [L('size', 'Size', 'segmented', { options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }] }), L('divider', 'Show a line', 'switch')] },
  html: { label: 'Custom HTML', icon: 'Code2', desc: 'Embed code or your own HTML', fields: [L('code', 'HTML', 'textarea', { hint: 'Scripts run on the live page. Only paste code you trust.' })] },
};

export const blockFields = (type) => [...(BLOCKS[type]?.fields || []), ...(['spacer', 'html'].includes(type) ? [] : common)];

export const BLOCK_DEFAULTS = {
  hero: { heading: 'A clear headline', text: 'One or two sentences that explain the offer.', primary: { label: 'Get started', href: '/contact' }, align: 'left', background: 'grid' },
  richText: { content: '## Heading\n\nWrite here.', width: 'narrow' },
  split: { heading: 'Heading', body: 'Text', imageSide: 'right' },
  cards: { heading: 'What I do', template: 'service', layout: 'grid', columns: '3', items: [{ icon: 'Layout', title: 'Custom website design', body: 'Short description of the service.', linkLabel: 'Learn more', href: '/pricing' }, { icon: 'RefreshCw', title: 'Website redesign', body: 'Short description of the service.', linkLabel: 'Learn more', href: '/pricing' }, { icon: 'FolderPlus', title: 'Website migration', body: 'Short description of the service.', linkLabel: 'Learn more', href: '/pricing' }] },
  timeline: { heading: 'My journey', items: [{ when: '2019 - 2024', title: 'Degree or role', sub: 'Where' }, { when: '2024 - Now', title: 'Next step', sub: 'Where' }] },
  features: { heading: 'What you get', template: 'service', layout: 'grid', columns: '3', items: [{ icon: 'Layout', title: 'Feature', body: 'Short description.' }] },
  stats: { items: [{ value: '550+', label: 'Websites delivered' }] },
  steps: { heading: 'How it works', template: 'numbered', layout: 'grid', columns: '4', items: [{ title: 'Step', body: 'What happens.', meta: 'Day 1' }] },
  projects: { heading: 'Recent work', source: 'featured', count: 3 },
  posts: { heading: 'From the blog', count: 3 },
  pricing: { heading: 'Packages' },
  apps: { heading: 'Products' },
  caseStudies: { heading: 'Case studies', count: 3 },
  testimonials: { heading: 'What clients say', useSite: true },
  faq: { heading: 'Questions', useSite: true },
  cta: { heading: "Let's build something", body: 'Tell me about your project.', primary: { label: 'Start a project', href: '/contact' } },
  contactForm: { heading: 'Get in touch' },
  form: { heading: 'Tell me about your project', layout: 'beside' },
  spacer: { size: 'md', divider: true },
  gallery: { columns: '3' },
};
