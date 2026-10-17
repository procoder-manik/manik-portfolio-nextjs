import 'server-only';
import { Contact } from './models';

/* Creates or updates a CRM contact from any touchpoint (message, chat, order, payment). */
export async function touchContact({ email, name, phone, company, country, source, activity, order, message, spent }) {
  if (!email) return;
  const e = String(email).trim().toLowerCase();
  const set = { lastContactAt: new Date() };
  if (name) set.name = name; if (phone) set.phone = phone; if (company) set.company = company; if (country) set.country = country;
  const inc = {}; if (order) inc.orders = 1; if (message) inc.messages = 1; if (spent) inc.spent = spent;
  try {
    await Contact.findOneAndUpdate({ email: e },
      { $set: set, $setOnInsert: { email: e, source, stage: order ? 'proposal' : 'new' }, ...(Object.keys(inc).length ? { $inc: inc } : {}), ...(activity ? { $push: { activity: { $each: [{ type: source, text: activity, at: new Date() }], $slice: -100 } } } : {}) },
      { upsert: true });
  } catch (err) { console.error('[crm]', err.message); }
}
