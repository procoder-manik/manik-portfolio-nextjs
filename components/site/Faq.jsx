import { Plus } from 'lucide-react';
export default function Faq({ items = [] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((f, i) => (
        <details key={i} className="group py-1 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-lg font-medium text-ink sm:text-xl">
            {f.q}
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line transition duration-300 group-open:rotate-45 group-open:border-signal group-open:bg-signal group-open:text-white"><Plus size={16} /></span>
          </summary>
          <p className="max-w-3xl pb-6 text-body">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
