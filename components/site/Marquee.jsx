export default function Marquee({ children, className = '' }) {
  return (
    <div className={`fade-edges group flex overflow-hidden ${className}`}>
      {[0, 1].map((k) => (
        <div key={k} aria-hidden={k === 1} className="flex shrink-0 animate-marquee items-center gap-3 pr-3 group-hover:[animation-play-state:paused]">{children}</div>
      ))}
    </div>
  );
}
