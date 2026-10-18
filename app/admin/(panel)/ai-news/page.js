import Link from 'next/link';
import AiNews from '@/components/admin/AiNews';
export default function Page() {
  return (<div><h1 className="mb-6 text-2xl font-semibold">AI news</h1><div className="max-w-3xl"><AiNews limit={40} onWrite={null} /></div><p className="mt-4 text-sm text-muted">Open the <Link className="text-signal" href="/admin/ai-writer">AI writer</Link> to turn any headline into a post: use Write a post there.</p></div>);
}
