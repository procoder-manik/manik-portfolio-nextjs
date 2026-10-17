import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="font-display text-[8rem] font-bold leading-none text-signal">404</p>
        <h1 className="mt-4 text-3xl font-semibold">This page does not exist</h1>
        <p className="mt-3 text-muted">The link may be old, or the page was moved.</p>
        <div className="mt-8 flex justify-center gap-3"><Link href="/" className="btn-primary">Go to the home page</Link><Link href="/portfolio" className="btn-ghost">See the work</Link></div>
      </div>
    </main>
  );
}
