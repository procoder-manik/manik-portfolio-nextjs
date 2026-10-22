import 'server-only';
import { Pitch, ServiceArea } from './models';
import { slugify } from './utils';

const CODE = /^[a-z0-9-]{4,40}$/;
const rand = () => Math.random().toString(36).slice(2, 6);

/* A short, readable code for a pitch link, for example "sarah-lee-k3x9". Unique. */
export async function newPitchCode(name = '') {
  const base = slugify(name).replace(/-+/g, '-').slice(0, 14).replace(/^-|-$/g, '') || 'pitch';
  for (let i = 0; i < 6; i++) { const c = `${base}-${rand()}`; if (!(await Pitch.exists({ code: c }))) return c; }
  return `${base}-${Date.now().toString(36)}`;
}
export const validCode = (c) => CODE.test(String(c || ''));

/* Adds the page title and the suggested next step to each row of the Pitches list. */
export async function pitchRows(items) {
  const slugs = [...new Set(items.map((x) => x.page).filter(Boolean))];
  const titles = Object.fromEntries((await ServiceArea.find({ slug: { $in: slugs } }).select('slug title').lean()).map((x) => [x.slug, x.title]));
  const day = 864e5; const now = Date.now();
  return items.map((x) => {
    let next = '';
    const age = (d) => (d ? (now - new Date(d).getTime()) / day : 0);
    if (x.status === 'sent') next = age(x.createdAt) > 3 ? 'Not opened in 3 days: send a short nudge' : 'Waiting for them to open it';
    else if (x.status === 'opened') next = !x.followedUpAt || new Date(x.followedUpAt) < new Date(x.lastViewAt) ? (age(x.lastViewAt) < 2 ? 'Opened recently: write to them now' : 'Opened, no reply: follow up') : 'Followed up: wait for a reply';
    else if (x.status === 'enquired') next = 'They wrote to you: reply';
    return { ...x, pageTitle: x.customPath || titles[x.page] || x.page || '', next };
  });
}
