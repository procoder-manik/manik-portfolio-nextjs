'use client';
import { useEffect } from 'react';
import { track } from '@/lib/track';
/* Fires the purchase conversion once per order when it is paid. */
export default function OrderTracker({ number, value, currency, paid, adsSendTo }) {
  useEffect(() => {
    if (!paid) return;
    const k = `mh-tracked-${number}`;
    try { if (localStorage.getItem(k)) return; localStorage.setItem(k, '1'); } catch {}
    track('purchase', { transaction_id: number, value, currency });
    if (adsSendTo) try { window.gtag?.('event', 'conversion', { send_to: adsSendTo, value, currency, transaction_id: number }); } catch {}
  }, [number, value, currency, paid, adsSendTo]);
  return null;
}
