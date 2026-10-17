/* Fires conversion events to whatever is switched on. No-ops if a tool is not loaded. */
export function track(event, data = {}) {
  if (typeof window === 'undefined') return;
  try { window.gtag?.('event', event, data); } catch {}
  try { window.dataLayer?.push({ event, ...data }); } catch {}
  try {
    const map = { generate_lead: 'Lead', purchase: 'Purchase', begin_checkout: 'InitiateCheckout', contact: 'Contact' };
    if (map[event]) window.fbq?.('track', map[event], data.value ? { value: data.value, currency: data.currency } : undefined);
  } catch {}
}
