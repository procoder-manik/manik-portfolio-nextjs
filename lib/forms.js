/* Form builder core. Pure functions shared by the admin builder, the public form and the submit API,
   so conditional logic, totals and validation always agree between browser and server. */

export const FIELD_TYPES = {
  text: { label: 'Single line text', icon: 'Type', group: 'Standard', input: true },
  textarea: { label: 'Paragraph', icon: 'AlignLeft', group: 'Standard', input: true },
  email: { label: 'Email', icon: 'AtSign', group: 'Standard', input: true },
  phone: { label: 'Phone', icon: 'Phone', group: 'Standard', input: true },
  number: { label: 'Number', icon: 'Hash', group: 'Standard', input: true },
  url: { label: 'Website link', icon: 'Link2', group: 'Standard', input: true },
  select: { label: 'Dropdown', icon: 'ChevronDownSquare', group: 'Choices', input: true, options: true },
  radio: { label: 'Multiple choice', icon: 'CircleDot', group: 'Choices', input: true, options: true },
  checkbox: { label: 'Checkboxes', icon: 'CheckSquare', group: 'Choices', input: true, options: true, multi: true },
  rating: { label: 'Star rating', icon: 'Star', group: 'Choices', input: true },
  scale: { label: 'Linear scale (1 to 10)', icon: 'SlidersHorizontal', group: 'Choices', input: true },
  grid: { label: 'Choice grid (survey)', icon: 'Grid3x3', group: 'Choices', input: true },
  date: { label: 'Date', icon: 'CalendarDays', group: 'Advanced', input: true },
  time: { label: 'Time', icon: 'Clock3', group: 'Advanced', input: true },
  file: { label: 'File upload', icon: 'Paperclip', group: 'Advanced', input: true },
  consent: { label: 'Consent checkbox', icon: 'ShieldCheck', group: 'Advanced', input: true },
  hidden: { label: 'Hidden value', icon: 'EyeOff', group: 'Advanced', input: true },
  heading: { label: 'Section heading', icon: 'Heading2', group: 'Layout' },
  html: { label: 'Text or HTML', icon: 'Code2', group: 'Layout' },
  divider: { label: 'Divider', icon: 'Minus', group: 'Layout' },
  page: { label: 'Page break (next step)', icon: 'StepForward', group: 'Layout' },
  product: { label: 'Product or ticket', icon: 'ShoppingCart', group: 'Payment', input: true },
  total: { label: 'Total', icon: 'Calculator', group: 'Payment' },
};
export const GROUPS = ['Standard', 'Choices', 'Advanced', 'Layout', 'Payment'];

export const uid = () => Math.random().toString(36).slice(2, 9);
export const keyOf = (label = '', used = []) => {
  const base = String(label).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40) || 'field';
  let k = base; let i = 2; while (used.includes(k)) k = `${base}_${i++}`;
  return k;
};

const OPT = (...labels) => labels.map((l) => (typeof l === 'string' ? { label: l } : l));

export function newField(type, used = []) {
  const t = FIELD_TYPES[type] || FIELD_TYPES.text;
  const f = { id: uid(), type, label: t.label, required: false, width: 'full' };
  if (type === 'heading') Object.assign(f, { label: 'Section title', help: '' });
  if (type === 'html') Object.assign(f, { label: 'Text', html: '<p>Write any text or HTML here.</p>' });
  if (type === 'page') Object.assign(f, { label: 'Next step', nextLabel: 'Next', prevLabel: 'Back' });
  if (t.options) f.options = OPT('Option 1', 'Option 2', 'Option 3');
  if (type === 'rating') f.max = 5;
  if (type === 'scale') Object.assign(f, { min: 1, max: 10, minLabel: 'Not likely', maxLabel: 'Very likely' });
  if (type === 'grid') Object.assign(f, { rows: ['Quality', 'Speed', 'Communication'], columns: ['Poor', 'Fair', 'Good', 'Excellent'] });
  if (type === 'consent') Object.assign(f, { label: 'Consent', text: 'I agree to the [privacy policy](/privacy-policy).', required: true });
  if (type === 'file') Object.assign(f, { maxSizeMB: 5, accept: '.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx', multiple: false });
  if (type === 'product') Object.assign(f, { label: 'Product', price: 50, choice: 'single', quantity: true, options: OPT({ label: 'Standard', price: 50 }, { label: 'Premium', price: 120 }) });
  if (type === 'total') f.label = 'Total';
  if (type === 'email') f.label = 'Email';
  if (type === 'phone') f.label = 'Phone';
  if (t.input) f.key = keyOf(f.label, used);
  return f;
}

/* ---------- Conditional logic ---------- */
const asArr = (v) => (Array.isArray(v) ? v : v == null || v === '' ? [] : [v]);
function test(rule, values) {
  const v = values[rule.field];
  const want = String(rule.value ?? '').toLowerCase();
  const vals = asArr(v).map((x) => String(typeof x === 'object' ? x.label || x.name || '' : x).toLowerCase());
  switch (rule.op) {
    case 'is': return vals.includes(want);
    case 'not': return !vals.includes(want);
    case 'contains': return vals.some((x) => x.includes(want));
    case 'empty': return !vals.length || vals.every((x) => !x);
    case 'filled': return vals.length > 0 && vals.some((x) => x);
    case 'gt': return Number(v) > Number(rule.value);
    case 'lt': return Number(v) < Number(rule.value);
    default: return true;
  }
}

/* Fields visible for the current answers. A field hidden by logic counts as empty for later rules. */
export function visibleFields(fields = [], values = {}) {
  const shown = new Set(); const byKey = {};
  for (const f of fields) {
    const lg = f.logic;
    let ok = true;
    if (lg?.enabled && lg.rules?.length) {
      const vals = Object.fromEntries(Object.entries(values).filter(([k]) => !byKey[k] || shown.has(byKey[k])));
      const res = lg.rules.filter((r) => r.field).map((r) => test(r, vals));
      const pass = res.length ? (lg.match === 'any' ? res.some(Boolean) : res.every(Boolean)) : true;
      ok = lg.action === 'hide' ? !pass : pass;
    }
    if (f.key) byKey[f.key] = f.id;
    if (ok) shown.add(f.id);
  }
  return fields.filter((f) => shown.has(f.id));
}

/* Splits fields into steps at each page break. */
export function stepsOf(fields = []) {
  const steps = [[]];
  for (const f of fields) { if (f.type === 'page') steps.push([]); else steps[steps.length - 1].push(f); }
  return steps.filter((s, i) => s.length || i === 0);
}

/* ---------- Prices ---------- */
const num = (x) => (Number.isFinite(Number(x)) ? Number(x) : 0);
export function optionPrice(f, label) {
  const o = (f.options || []).find((x) => x.label === label || x.value === label);
  return o ? num(o.price) : 0;
}

/* { total, lines: [{ label, amount }] } from the visible fields only. */
export function computeTotal(form, values = {}) {
  const pay = form.payment || {};
  if (!pay.enabled) return { total: 0, lines: [] };
  const lines = [];
  for (const f of visibleFields(form.fields, values)) {
    const v = values[f.key];
    if (f.type === 'product') {
      const qty = f.quantity ? Math.max(0, Math.min(999, Math.floor(num(values[`${f.key}__qty`] ?? 1)))) : 1;
      if (f.choice === 'single' || !(f.options || []).length) { if (qty) lines.push({ label: `${f.label}${qty > 1 ? ` x ${qty}` : ''}`, amount: num(f.price) * qty }); }
      else if (v) { const p = optionPrice(f, v); if (qty) lines.push({ label: `${f.label}: ${v}${qty > 1 ? ` x ${qty}` : ''}`, amount: p * qty }); }
    } else if (['select', 'radio', 'checkbox'].includes(f.type) && (f.options || []).some((o) => num(o.price))) {
      for (const x of asArr(v)) { const p = optionPrice(f, x); if (p) lines.push({ label: `${f.label}: ${x}`, amount: p }); }
    }
  }
  if (num(pay.fixedAmount)) lines.unshift({ label: pay.productName || form.name || 'Payment', amount: num(pay.fixedAmount) });
  const total = Math.round(lines.reduce((a, l) => a + l.amount, 0) * 100) / 100;
  return { total, lines };
}

/* ---------- Validation (server and browser) ---------- */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function validate(form, raw = {}) {
  const errors = {}; const clean = {};
  const shown = visibleFields(form.fields, raw).filter((f) => FIELD_TYPES[f.type]?.input && f.key);
  for (const f of shown) {
    let v = raw[f.key];
    const empty = v == null || v === '' || (Array.isArray(v) && !v.length) || (f.type === 'grid' && (!v || !Object.keys(v).length)) || (f.type === 'consent' && v !== true && v !== 'true');
    if (f.required && empty && f.type !== 'hidden' && !(f.type === 'product' && f.choice === 'single')) { errors[f.id] = f.type === 'consent' ? 'Please tick this box to continue.' : 'This field is required.'; continue; }
    if (empty && f.type !== 'product') continue;
    switch (f.type) {
      case 'email': v = String(v).trim().slice(0, 160); if (!EMAIL.test(v)) errors[f.id] = 'Enter a valid email address.'; break;
      case 'phone': v = String(v).trim().slice(0, 40); if (!/^[+\d][\d\s().-]{5,}$/.test(v)) errors[f.id] = 'Enter a valid phone number.'; break;
      case 'url': v = String(v).trim().slice(0, 300); if (!/^https?:\/\/\S+\.\S+/.test(v) && !/^\S+\.\S{2,}/.test(v)) errors[f.id] = 'Enter a valid web address.'; break;
      case 'number': {
        const n = Number(v); if (!Number.isFinite(n)) { errors[f.id] = 'Enter a number.'; break; }
        if (f.min != null && f.min !== '' && n < Number(f.min)) errors[f.id] = `The lowest allowed is ${f.min}.`;
        if (f.max != null && f.max !== '' && n > Number(f.max)) errors[f.id] = `The highest allowed is ${f.max}.`;
        v = n; break;
      }
      case 'select': case 'radio': {
        const ok = (f.options || []).some((o) => o.label === v) || (f.allowOther && String(v).length <= 200);
        if (!ok) errors[f.id] = 'Pick one of the options.'; v = String(v).slice(0, 200); break;
      }
      case 'checkbox': {
        v = asArr(v).map((x) => String(x).slice(0, 200)).filter((x) => (f.options || []).some((o) => o.label === x) || f.allowOther).slice(0, 50);
        if (f.min && v.length < Number(f.min)) errors[f.id] = `Pick at least ${f.min}.`;
        if (f.max && v.length > Number(f.max)) errors[f.id] = `Pick at most ${f.max}.`;
        break;
      }
      case 'rating': { const n = Math.round(Number(v)); if (!(n >= 1 && n <= (Number(f.max) || 5))) errors[f.id] = 'Pick a rating.'; v = n; break; }
      case 'scale': { const n = Math.round(Number(v)); if (!(n >= (Number(f.min) || 1) && n <= (Number(f.max) || 10))) errors[f.id] = 'Pick a value.'; v = n; break; }
      case 'grid': {
        const out = {}; for (const r of f.rows || []) if (v?.[r] && (f.columns || []).includes(v[r])) out[r] = v[r];
        if (f.required && Object.keys(out).length < (f.rows || []).length) errors[f.id] = 'Answer every row.';
        v = out; break;
      }
      case 'consent': v = true; break;
      case 'file': v = asArr(v).filter((x) => x && typeof x.url === 'string' && /^(https:\/\/|\/media\/)/.test(x.url)).slice(0, 10).map((x) => ({ url: x.url, name: String(x.name || 'file').slice(0, 120), size: Number(x.size) || 0 })); if (f.required && !v.length) errors[f.id] = 'Attach a file.'; break;
      case 'product': {
        if (f.choice !== 'single' && (f.options || []).length) { if (v && !(f.options || []).some((o) => o.label === v)) errors[f.id] = 'Pick an option.'; if (f.required && !v) errors[f.id] = 'Pick an option.'; }
        else v = f.label;
        const q = raw[`${f.key}__qty`]; if (f.quantity && q != null) clean[`${f.key}__qty`] = Math.max(0, Math.min(999, Math.floor(num(q))));
        break;
      }
      case 'date': v = String(v).slice(0, 10); if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) errors[f.id] = 'Pick a date.'; break;
      case 'time': v = String(v).slice(0, 5); break;
      default: v = String(v).slice(0, f.type === 'textarea' ? 10000 : f.type === 'hidden' ? 500 : 1000);
        if (f.minLength && v.length < Number(f.minLength)) errors[f.id] = `Write at least ${f.minLength} characters.`;
        if (f.maxLength && v.length > Number(f.maxLength)) errors[f.id] = `Use at most ${f.maxLength} characters.`;
    }
    clean[f.key] = v;
  }
  return { errors, clean, fields: shown };
}

/* Human-readable value for emails, CSV and the entries screen. */
export function display(f, v) {
  if (v == null || v === '') return '';
  if (f?.type === 'file') return asArr(v).map((x) => x.url).join(', ');
  if (f?.type === 'grid') return Object.entries(v || {}).map(([r, c]) => `${r}: ${c}`).join('; ');
  if (f?.type === 'consent') return v ? 'Yes' : 'No';
  if (f?.type === 'rating') return `${v} / ${f.max || 5}`;
  if (Array.isArray(v)) return v.join(', ');
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

/* The public copy of a form: never includes notification addresses or private settings. */
export function publicForm(form, methods = []) {
  if (!form) return null;
  const pay = form.payment || {};
  const allowed = (pay.methods || []).length ? methods.filter((m) => pay.methods.includes(m.id)) : methods;
  return {
    _id: String(form._id || ''), name: form.name, slug: form.slug, title: form.title, description: form.description,
    fields: (form.fields || []).map(({ adminNote, ...f }) => f),
    settings: { submitLabel: form.settings?.submitLabel, successMessage: form.settings?.successMessage, successType: form.settings?.successType, redirectUrl: form.settings?.redirectUrl, closed: formClosed(form), closedMessage: form.settings?.closedMessage },
    payment: pay.enabled ? { enabled: true, currency: pay.currency || 'USD', fixedAmount: pay.fixedAmount, productName: pay.productName, note: pay.note, methods: allowed } : { enabled: false },
    style: form.style || {},
  };
}

export function formClosed(form, count) {
  const s = form.settings || {};
  const now = Date.now();
  if (form.active === false || form.trashedAt) return 'This form is not accepting answers.';
  if (s.openAt && new Date(s.openAt).getTime() > now) return s.closedMessage || 'This form is not open yet.';
  if (s.closeAt && new Date(s.closeAt).getTime() < now) return s.closedMessage || 'This form is closed.';
  if (s.limit && Number(s.limit) > 0 && (count ?? form.entries ?? 0) >= Number(s.limit)) return s.closedMessage || 'This form has reached its limit and is closed.';
  return '';
}

/* ---------- Ready-made templates ---------- */
const F = (type, label, extra = {}) => ({ ...newField(type), label, key: extra.key || keyOf(label), ...extra });

export const FORM_TEMPLATES = [
  { id: 'blank', name: 'Blank form', icon: 'FilePlus2', desc: 'Start empty and add your own fields.', form: { fields: [] } },
  { id: 'contact', name: 'Contact form', icon: 'Mail', desc: 'Name, email, phone, subject and message.', form: { title: 'Get in touch', fields: [
    F('text', 'Name', { required: true, width: 'half', placeholder: 'Your name' }), F('email', 'Email', { required: true, width: 'half' }),
    F('phone', 'Phone or WhatsApp', { width: 'half' }), F('text', 'Subject', { width: 'half' }), F('textarea', 'Message', { required: true, rows: 5, minLength: 10 }),
  ], settings: { submitLabel: 'Send message' } } },
  { id: 'quote', name: 'Quote request', icon: 'FileText', desc: 'Project type, budget, deadline and details, with logic.', form: { title: 'Request a quote', fields: [
    F('text', 'Name', { required: true, width: 'half' }), F('email', 'Email', { required: true, width: 'half' }),
    F('radio', 'What do you need?', { key: 'need', required: true, options: OPT('New website', 'Redesign', 'SEO', 'Online store', 'Something else') }),
    F('text', 'Current website', { key: 'current_site', placeholder: 'https://', logic: { enabled: true, action: 'show', match: 'any', rules: [{ field: 'need', op: 'is', value: 'Redesign' }, { field: 'need', op: 'is', value: 'SEO' }] } }),
    F('select', 'Budget', { width: 'half', options: OPT('Under $300', '$300 to $1,000', '$1,000 to $3,000', '$3,000+') }), F('date', 'Ideal launch date', { width: 'half' }),
    F('textarea', 'Project details', { required: true }), F('file', 'Brief or examples (optional)'),
  ], settings: { submitLabel: 'Get my quote' } } },
  { id: 'survey', name: 'Client survey', icon: 'ClipboardList', desc: 'Google Forms style: multiple choice, checkboxes, scale, grid and rating.', form: { title: 'Help me improve', description: 'Takes two minutes. Thank you!', fields: [
    F('radio', 'How did you find me?', { required: true, options: OPT('Google search', 'Facebook', 'LinkedIn', 'A friend', 'Fiverr or Upwork'), allowOther: true }),
    F('checkbox', 'Which services have you used?', { options: OPT('Website design', 'WordPress', 'Shopify', 'SEO', 'Maintenance') }),
    F('scale', 'How likely are you to recommend me to a friend?', { required: true, min: 0, max: 10, minLabel: 'Not likely', maxLabel: 'Very likely' }),
    F('grid', 'Rate each part of the project', { rows: ['Design quality', 'Speed', 'Communication', 'Value for money'], columns: ['Poor', 'Fair', 'Good', 'Excellent'] }),
    F('rating', 'Overall rating', { max: 5, required: true }), F('textarea', 'Anything I could do better?'),
  ], settings: { submitLabel: 'Send answers', successMessage: 'Thank you! Your answers help a lot.' } } },
  { id: 'feedback', name: 'Feedback or testimonial', icon: 'MessageSquareQuote', desc: 'Star rating, review text and permission to publish.', form: { title: 'Share your experience', fields: [
    F('text', 'Name', { required: true, width: 'half' }), F('text', 'Company', { width: 'half' }), F('rating', 'Your rating', { required: true }),
    F('textarea', 'Your review', { required: true }), F('consent', 'Permission', { text: 'You may publish my review on your website.', required: false }),
  ] } },
  { id: 'event', name: 'Event or webinar sign-up', icon: 'Ticket', desc: 'Attendee details with a paid ticket and live total.', form: { title: 'Reserve your seat', fields: [
    F('text', 'Full name', { required: true, width: 'half' }), F('email', 'Email', { required: true, width: 'half' }), F('phone', 'Phone', { width: 'half' }),
    F('product', 'Ticket', { choice: 'radio', required: true, quantity: true, options: OPT({ label: 'Standard seat', price: 20 }, { label: 'VIP seat', price: 50 }) }),
    F('total', 'Total'),
  ], payment: { enabled: true, currency: 'USD', productName: 'Event ticket' }, settings: { submitLabel: 'Continue to payment' } } },
  { id: 'order', name: 'Order and payment form', icon: 'CreditCard', desc: 'Sell a service with add-ons; takes payment by bKash, card, PayPal and more.', form: { title: 'Order now', fields: [
    F('text', 'Name', { required: true, width: 'half' }), F('email', 'Email', { required: true, width: 'half' }),
    F('product', 'Package', { choice: 'select', required: true, quantity: false, options: OPT({ label: 'Starter website', price: 299 }, { label: 'Business website', price: 599 }) }),
    F('checkbox', 'Add-ons', { options: OPT({ label: 'Logo design', price: 49 }, { label: 'SEO setup', price: 99 }, { label: '1 year maintenance', price: 199 }) }),
    F('textarea', 'Notes'), F('total', 'Total'),
  ], payment: { enabled: true, currency: 'USD', productName: 'Website order' }, settings: { submitLabel: 'Pay now' } } },
  { id: 'job', name: 'Job or partner application', icon: 'BriefcaseBusiness', desc: 'Multi-step with CV upload.', form: { title: 'Apply', fields: [
    F('text', 'Full name', { required: true, width: 'half' }), F('email', 'Email', { required: true, width: 'half' }), F('url', 'Portfolio link'),
    { ...newField('page'), label: 'Experience' },
    F('select', 'Years of experience', { options: OPT('Less than 1', '1 to 3', '3 to 5', '5+') }), F('checkbox', 'Skills', { options: OPT('WordPress', 'Shopify', 'React', 'SEO', 'Figma') }),
    F('file', 'CV (PDF)', { accept: '.pdf', required: true }), F('textarea', 'Why do you want to work together?'),
  ], settings: { submitLabel: 'Submit application' } } },
  { id: 'newsletter', name: 'Newsletter sign-up', icon: 'Newspaper', desc: 'Email and consent. Perfect inside a popup.', form: { title: '', fields: [
    F('email', 'Email', { required: true, placeholder: 'you@example.com' }), F('consent', 'Consent', { text: 'Send me occasional tips. Unsubscribe any time.', required: true }),
  ], settings: { submitLabel: 'Subscribe', successMessage: 'You are in! Check your inbox.' }, style: { theme: 'plain', buttonFull: true } } },
  { id: 'appointment', name: 'Appointment request', icon: 'CalendarClock', desc: 'Pick a date, time and topic.', form: { title: 'Book an appointment', fields: [
    F('text', 'Name', { required: true, width: 'half' }), F('email', 'Email', { required: true, width: 'half' }),
    F('date', 'Preferred date', { required: true, width: 'half' }), F('time', 'Preferred time', { required: true, width: 'half' }),
    F('radio', 'Meeting type', { options: OPT('Google Meet', 'Zoom', 'WhatsApp call') }), F('textarea', 'Topic'),
  ], settings: { submitLabel: 'Request appointment' } } },
];

export const FORM_DEFAULTS = {
  name: 'Untitled form', title: '', description: '', fields: [], active: true,
  settings: { submitLabel: 'Submit', successType: 'message', successMessage: 'Thank you! Your answers were sent.', redirectUrl: '', saveEntries: true, publicPage: true, limit: null, openAt: '', closeAt: '', closedMessage: '' },
  notify: { enabled: true, to: [], subject: 'New answer: {form}', replyToField: '' },
  autoReply: { enabled: false, subject: 'Thanks, {name}', message: 'Thank you for getting in touch. I got your answers and will reply soon.', emailField: '' },
  payment: { enabled: false, currency: 'USD', fixedAmount: null, productName: '', methods: [], nameField: '', emailField: '', phoneField: '', note: '' },
  style: { theme: 'card', accent: '', buttonFull: false, buttonAlign: 'left', progress: 'bar', labels: 'top' },
};
