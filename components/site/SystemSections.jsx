import { Fragment } from 'react';
import Blocks from './blocks/Blocks';

/* Renders a built-in page from its layout: built-in parts (type "core") come from `parts`,
   every other block is a normal page section made in Admin > Pages. */
/* tops: parts that already leave room for the fixed header when they come first. */
export default function SystemSections({ layout = [], parts = {}, tops = [] }) {
  const out = []; let run = []; let atTop = true;
  const flush = () => { if (run.length) { out.push(<Blocks key={`b${out.length}`} blocks={run} atTop={atTop} />); atTop = false; run = []; } };
  layout.forEach((b, i) => {
    if (!b || b.hidden) return;
    if (b.type === 'core') {
      flush();
      const fn = parts[b.part];
      const node = typeof fn === 'function' ? fn(b) : null;
      if (node && atTop && !tops.includes(b.part)) out.push(<div key="top" className="pt-28 sm:pt-32" aria-hidden="true" />);
      if (node) { out.push(<Fragment key={`c${i}`}>{node}</Fragment>); atTop = false; }
    } else run.push(b);
  });
  flush();
  return <>{out}</>;
}
