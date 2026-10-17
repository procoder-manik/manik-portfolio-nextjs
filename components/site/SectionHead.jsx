import { cn } from '@/lib/utils';
import SplitText from './SplitText';
export default function SectionHead({ title, intro, children, className, as: H = 'h2' }) {
  return (
    <div className={cn('mb-12 grid items-end gap-6 md:mb-16 md:grid-cols-[1.25fr_1fr]', className)}>
      <H className="h-section max-w-[16ch]" data-split=""><SplitText text={title} /></H>
      <div className="flex flex-col items-start gap-5 md:items-end md:text-right">
        {intro && <p className="lede md:ml-auto">{intro}</p>}
        {children}
      </div>
    </div>
  );
}
