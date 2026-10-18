import { Suspense } from 'react';
import EntriesView from '@/components/admin/EntriesView';
export default function Page() { return <Suspense fallback={null}><EntriesView /></Suspense>; }
