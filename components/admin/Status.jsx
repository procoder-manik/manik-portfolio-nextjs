import { ORDER_STATUS } from '@/lib/options';
export default function Status({ s }) {
  const st = ORDER_STATUS[s] || { label: s, tone: 'muted' };
  const tone = { amber: 'bg-amber/15 text-amber', good: 'bg-good/15 text-good', signal: 'bg-signal/15 text-signal', bad: 'bg-bad/15 text-bad' }[st.tone] || 'bg-raised text-muted';
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>{st.label}</span>;
}
