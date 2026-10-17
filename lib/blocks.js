import { SERVICE_ICONS } from './options';

/* Pre-built page sections. Each block = { type, ...fields }. The admin "blocks" field
   uses these definitions; components/site/blocks renders them with the site design. */
const L = (name, label, type = 'text', extra = {}) => ({ name, label, type, ...extra });
const btn = (p, label) => [L(`${p}.label`, `${label} text`, 'text', { half: true }), L(`${p}.href`, `${label} link`, 'text', { half: true, placeholder: '/contact or https://' })];
const common = [
  L('background', 'Background', 'select', { half: true, options: [{ value: 'none', label: 'Plain' }, { value: 'surface', label: 'Tinted panel' }, { value: 'grid', label: 'Blueprint grid' }, { value: 'accent', label: 'Accent (blue)' }] }),
  L('anchor', 'Anchor id (for #links)', 'text', { half: true, placeholder: 'e.g. services' }),
];

export const BLOCKS = {
  hero: { label: 'Hero', icon: 'Sparkles', desc: 'Big headline, intro and buttons', fields: [L('heading', 'Headline', 'textarea'), L('text', 'Intro', 'textarea'), ...btn('primary', 'Main button'), ...btn('secondary', 'Second button'), L('image', 'Image (optional)', 'image'), L('align', 'Alignment', 'segmented', { options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Centre' }] })] },
  richText: { label: 'Text', icon: 'AlignLeft', desc: 'Formatted text with headings, lists and images', fields: [L('content', 'Content', 'markdown'), L('width', 'Width', 'segmented', { options: [{ value: 'narrow', label: 'Reading width' }, { value: 'wide', label: 'Full width' }] })] },
  split: { label: 'Image and text', icon: 'Columns2', desc: 'Image on one side, text on the other', fields: [L('heading', 'Heading'), L('body', 'Text', 'markdown'), L('image', 'Image', 'image'), L('imageSide', 'Image side', 'segmented', { options: [{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }] }), ...btn('button', 'Button')] },
  features: { label: 'Feature grid', icon: 'LayoutGrid', desc: 'Cards with icon, title and text', fields: [L('heading', 'Heading'), L('intro', 'Intro', 'textarea'), L('columns', 'Columns', 'segmented', { options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }] }), L('items', 'Cards', 'repeater', { fields: [L('icon', 'Icon', 'select', { half: true, options: SERVICE_ICONS }), L('title', 'Title', 'text', { half: true }), L('body', 'Text', 'textarea')] })] },
  stats: { label: 'Numbers', icon: 'BarChart3', desc: 'A row of big numbers', fields: [L('heading', 'Heading (optional)'), L('items', 'Numbers', 'repeater', { fields: [L('value', 'Value', 'text', { half: true }), L('label', 'Label', 'text', { half: true })] })] },
  steps: { label: 'Steps', icon: 'ListOrdered', desc: 'Numbered process', fields: [L('heading', 'Heading'), L('items', 'Steps', 'repeater', { fields: [L('title', 'Title', 'text', { half: true }), L('time', 'When', 'text', { half: true }), L('body', 'Text', 'textarea')] })] },
  projects: { label: 'Portfolio', icon: 'Briefcase', desc: 'Project cards with hover scroll', fields: [L('heading', 'Heading'), L('intro', 'Intro', 'textarea'), L('source', 'Which projects', 'segmented', { options: [{ value: 'featured', label: 'Featured' }, { value: 'latest', label: 'Latest' }] }), L('count', 'How many', 'number', { half: true })] },
  posts: { label: 'Blog posts', icon: 'Newspaper', desc: 'Latest articles', fields: [L('heading', 'Heading'), L('category', 'Category', 'ref', { source: 'categories', valueKey: 'slug', labelKey: 'name', half: true }), L('count', 'How many', 'number', { half: true })] },
  pricing: { label: 'Pricing', icon: 'Tag', desc: 'Package cards from your services', fields: [L('heading', 'Heading'), L('intro', 'Intro', 'textarea'), L('service', 'Only this service (empty = tabs for all)', 'ref', { source: 'services', valueKey: 'slug', labelKey: 'name' })] },
  caseStudies: { label: 'Case studies', icon: 'Trophy', desc: 'Client stories (hidden while the feature is off)', fields: [L('heading', 'Heading'), L('intro', 'Intro', 'textarea'), L('count', 'How many', 'number', { half: true })] },
  apps: { label: 'Products', icon: 'AppWindow', desc: 'Your apps and SaaS products', fields: [L('heading', 'Heading'), L('intro', 'Intro', 'textarea')] },
  testimonials: { label: 'Testimonials', icon: 'Quote', desc: 'Client quotes', fields: [L('heading', 'Heading'), L('useSite', 'Use the testimonials from Home page settings', 'switch'), L('items', 'Quotes', 'repeater', { showIf: (v) => !v.useSite, fields: [L('quote', 'Quote', 'textarea'), L('name', 'Name', 'text', { half: true }), L('source', 'Source', 'text', { half: true }), L('avatar', 'Photo', 'image')] })] },
  logos: { label: 'Logo strip', icon: 'GalleryHorizontal', desc: 'Scrolling client logos', fields: [L('heading', 'Heading (optional)'), L('images', 'Logos', 'images')] },
  gallery: { label: 'Gallery', icon: 'Images', desc: 'Image grid', fields: [L('heading', 'Heading (optional)'), L('images', 'Images', 'images'), L('columns', 'Columns', 'segmented', { options: [{ value: '2', label: '2' }, { value: '3', label: '3' }] })] },
  video: { label: 'Video', icon: 'PlayCircle', desc: 'YouTube, Vimeo, Loom or a file', fields: [L('heading', 'Heading (optional)'), L('url', 'Video link', 'url'), L('caption', 'Caption')] },
  faq: { label: 'FAQ', icon: 'HelpCircle', desc: 'Questions and answers', fields: [L('heading', 'Heading'), L('useSite', 'Use the FAQ from Home page settings', 'switch'), L('items', 'Questions', 'repeater', { showIf: (v) => !v.useSite, fields: [L('q', 'Question'), L('a', 'Answer', 'textarea')] })] },
  cta: { label: 'Call to action', icon: 'Megaphone', desc: 'Blue banner with buttons', fields: [L('heading', 'Heading'), L('body', 'Text', 'textarea'), ...btn('primary', 'Main button'), ...btn('secondary', 'Second button')] },
  contactForm: { label: 'Contact form', icon: 'Mail', desc: 'Your contact form with details', fields: [L('heading', 'Heading'), L('intro', 'Intro', 'textarea')] },
  spacer: { label: 'Spacer', icon: 'SeparatorHorizontal', desc: 'Space or a divider line', fields: [L('size', 'Size', 'segmented', { options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }] }), L('divider', 'Show a line', 'switch')] },
  html: { label: 'Custom HTML', icon: 'Code2', desc: 'Embed code or your own HTML', fields: [L('code', 'HTML', 'textarea', { hint: 'Scripts run on the live page. Only paste code you trust.' })] },
};

export const blockFields = (type) => [...(BLOCKS[type]?.fields || []), ...(['spacer', 'html'].includes(type) ? [] : common)];

export const BLOCK_DEFAULTS = {
  hero: { heading: 'A clear headline', text: 'One or two sentences that explain the offer.', primary: { label: 'Get started', href: '/contact' }, align: 'left', background: 'grid' },
  richText: { content: '## Heading\n\nWrite here.', width: 'narrow' },
  split: { heading: 'Heading', body: 'Text', imageSide: 'right' },
  features: { heading: 'What you get', columns: '3', items: [{ icon: 'Layout', title: 'Feature', body: 'Short description.' }] },
  stats: { items: [{ value: '550+', label: 'Websites delivered' }] },
  steps: { heading: 'How it works', items: [{ title: 'Step', body: 'What happens.' }] },
  projects: { heading: 'Recent work', source: 'featured', count: 3 },
  posts: { heading: 'From the blog', count: 3 },
  pricing: { heading: 'Packages' },
  apps: { heading: 'Products' },
  caseStudies: { heading: 'Case studies', count: 3 },
  testimonials: { heading: 'What clients say', useSite: true },
  faq: { heading: 'Questions', useSite: true },
  cta: { heading: "Let's build something", body: 'Tell me about your project.', primary: { label: 'Start a project', href: '/contact' } },
  contactForm: { heading: 'Get in touch' },
  spacer: { size: 'md', divider: true },
  gallery: { columns: '3' },
};
