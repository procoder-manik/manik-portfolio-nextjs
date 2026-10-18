/* Monthly / yearly plan maths, shared by the pricing cards, checkout, the order API and emails.
   A package with `monthlyYearly` on stores its MONTHLY price in `price`.
   Yearly price = price x 12, minus `yearlyDiscount` percent, unless `yearlyPrice` is typed in by hand. */
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

export const hasChoice = (p) => !!p && p.monthlyYearly === true && p.checkoutMode !== 'quote';

export function yearlyTotal(p) {
  if (!p) return 0;
  if (Number(p.yearlyPrice) > 0) return r2(p.yearlyPrice);
  const d = Math.min(90, Math.max(0, Number(p.yearlyDiscount) || 0));
  return r2((Number(p.price) || 0) * 12 * (1 - d / 100));
}

/* What one billing period costs. period: 'monthly' | 'yearly' (ignored for single-billing packages). */
export function priceFor(p, period) {
  if (hasChoice(p) && period === 'yearly') return yearlyTotal(p);
  return r2(p?.price);
}

/* The period that really applies to an order of this package. */
export function periodOf(p, requested) {
  if (hasChoice(p)) return requested === 'yearly' ? 'yearly' : 'monthly';
  return p?.billing || 'one-time';
}

/* How much the buyer saves by paying yearly instead of 12 monthly payments. */
export function yearlySavings(p) {
  if (!hasChoice(p)) return { amount: 0, percent: 0 };
  const full = r2((Number(p.price) || 0) * 12); const y = yearlyTotal(p);
  const amount = r2(Math.max(0, full - y));
  return { amount, percent: full > 0 ? Math.round((amount / full) * 100) : 0, perMonth: r2(y / 12) };
}

export const isRecurring = (period) => period === 'monthly' || period === 'yearly';

/* Adds one month or one year to a date (month-end safe). */
export function addPeriod(date, period) {
  const d = new Date(date);
  if (period === 'yearly') { d.setFullYear(d.getFullYear() + 1); return d; }
  const day = d.getDate(); d.setMonth(d.getMonth() + 1);
  if (d.getDate() < day) d.setDate(0);
  return d;
}
