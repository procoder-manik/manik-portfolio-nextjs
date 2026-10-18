/* Card templates for the "Cards" section, the home Services and Process sections and the Features and Steps sections.
   Each template says which item fields it uses, so the admin shows a clear preview and sample. */
export const CARD_TEMPLATES = [
  { id: 'service', name: 'Service card', desc: 'Icon tile, bold title, short text and a LEARN MORE link.', uses: ['icon', 'title', 'body', 'link'] },
  { id: 'numbered', name: 'Numbered step', desc: 'Large outlined number, title, text and a small mono note such as DAY 0 FREE.', uses: ['title', 'body', 'meta'] },
  { id: 'image', name: 'Image card', desc: 'Picture on top, tag, title, text and link.', uses: ['image', 'tag', 'title', 'body', 'link'] },
  { id: 'stat', name: 'Big number', desc: 'A large value with a label and one line of detail.', uses: ['value', 'title', 'body'] },
  { id: 'quote', name: 'Testimonial', desc: 'Quote with the person, role and photo.', uses: ['body', 'name', 'role', 'avatar'] },
  { id: 'row', name: 'Compact row', desc: 'Small icon beside the title and text. Good for long lists.', uses: ['icon', 'title', 'body'] },
  { id: 'glass', name: 'Glow card', desc: 'Soft gradient border with a glowing icon.', uses: ['icon', 'title', 'body', 'link'] },
  { id: 'editorial', name: 'Editorial', desc: 'Clean top line, mono index, large title. No box.', uses: ['title', 'body', 'link'] },
  { id: 'price', name: 'Price card', desc: 'Tag, big price and a tick list (one point per line).', uses: ['tag', 'title', 'value', 'meta', 'list', 'link'] },
  { id: 'custom', name: 'My own HTML', desc: 'Write the card markup and CSS yourself. Use {title}, {body}, {icon}, {image}, {link}.', uses: [] },
];

export const SAMPLE = {
  service: { icon: 'Layout', title: 'Custom website design', body: 'From sleek portfolios to dynamic business sites, designs that match your brand.', linkLabel: 'Learn more', href: '/pricing' },
  numbered: { title: 'Discovery call', body: 'Thirty minutes on your business and goals. You leave with a scope, a price and a date.', meta: 'Day 0 / Free' },
  image: { image: '/seed/work/work-jslaw.svg', tag: 'Law firm', title: 'JS Law', body: 'A lead engine for a busy practice.', linkLabel: 'View project', href: '/portfolio' },
  stat: { value: '550+', title: 'Websites delivered', body: 'For clients in 14 countries.' },
  quote: { body: 'Fast, clear and the site actually brings us leads.', name: 'Sam Rivera', role: 'Founder, Harbour Co.', avatar: '/seed/avatars/avatar-sam.svg' },
  row: { icon: 'Gauge', title: 'Speed built in', body: 'Core Web Vitals pass on real phones.' },
  glass: { icon: 'Sparkles', title: 'Automation', body: 'Save hours every week with simple workflows.', linkLabel: 'Learn more', href: '/pricing' },
  editorial: { title: 'Website care plans', body: 'Updates, backups and monitoring so nothing breaks quietly.', linkLabel: 'See plans', href: '/pricing' },
  price: { tag: 'Popular', title: 'Business site', value: '$599', meta: 'one time', list: '10 pages\nSEO setup\n30 days support', linkLabel: 'Choose plan', href: '/pricing' },
  custom: { title: 'Your title', body: 'Your text', icon: 'Star', href: '/contact' },
};

export const CARD_DEFAULTS = { template: 'service', layout: 'grid', columns: '3', autoplay: false, items: [] };
