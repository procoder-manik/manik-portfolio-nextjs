export const CMS_OPTIONS = ['WordPress', 'Shopify', 'WooCommerce', 'Squarespace', 'Webflow', 'Wix', 'Framer', 'Duda', 'Joomla', 'Drupal', 'Ghost', 'BigCommerce', 'Magento', 'Bubble', 'HubSpot CMS', 'Strapi', 'Sanity', 'Contentful', 'Other'];

export const TECH_OPTIONS = ['HTML5', 'CSS3', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue', 'Nuxt', 'Svelte', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'MySQL', 'PHP', 'Laravel', 'Python', 'Django', 'Tailwind CSS', 'Bootstrap', 'SCSS', 'GSAP', 'Three.js', 'Firebase', 'Supabase', 'GraphQL', 'Liquid', 'Elementor', 'Figma'];

export const VIDEO_PROVIDERS = [
  { value: 'none', label: 'No video' }, { value: 'youtube', label: 'YouTube' }, { value: 'vimeo', label: 'Vimeo' },
  { value: 'loom', label: 'Loom' }, { value: 'upload', label: 'Uploaded video file' }, { value: 'other', label: 'Other embed link' },
];

export const ORDER_STATUS = {
  pending_payment: { label: 'Awaiting payment', tone: 'amber' },
  verifying: { label: 'Verifying payment', tone: 'amber' },
  paid: { label: 'Paid', tone: 'good' },
  in_progress: { label: 'In progress', tone: 'signal' },
  completed: { label: 'Completed', tone: 'good' },
  cancelled: { label: 'Cancelled', tone: 'bad' },
  failed: { label: 'Payment failed', tone: 'bad' },
};

/* Payment methods. "manual" ones show your account details and ask the buyer for a
   transaction ID, which you confirm from Admin > Orders. "card" and "paypal" can run
   automatically when the env keys are set (see .env.example). */
export const PAYMENT_METHODS = [
  { id: 'bkash', name: 'bKash', kind: 'wallet', local: true, color: '#E2136E' },
  { id: 'nagad', name: 'Nagad', kind: 'wallet', local: true, color: '#F6921E' },
  { id: 'rocket', name: 'Rocket', kind: 'wallet', local: true, color: '#8C3494' },
  { id: 'bank', name: 'Bank transfer', kind: 'bank', local: false, color: '#0F766E' },
  { id: 'card', name: 'Debit or credit card', kind: 'card', local: true, color: '#1D4ED8' },
  { id: 'paypal', name: 'PayPal', kind: 'paypal', local: false, color: '#003087' },
  { id: 'payoneer', name: 'Payoneer', kind: 'payoneer', local: false, color: '#FF4800' },
];

export const SERVICE_ICONS = ['Layout', 'Code2', 'ShoppingBag', 'Search', 'Gauge', 'Workflow', 'Wrench', 'ShieldCheck', 'PenTool', 'Rocket', 'Smartphone', 'LineChart', 'Database', 'Globe'];
