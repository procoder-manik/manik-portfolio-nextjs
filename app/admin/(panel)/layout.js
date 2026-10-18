import Sidebar from '@/components/admin/Sidebar';
import { getAdmin } from '@/lib/server-auth';
export const metadata = { title: 'Admin', robots: { index: false, follow: false } };
export default async function AdminLayout({ children }) {
  const admin = await getAdmin();
  return (
    <div className="min-h-screen bg-base">
      <Sidebar role={admin?.role || 'administrator'} name={admin?.name || ''} />
      <div className="lg:pl-64"><main className="mx-auto max-w-6xl px-5 pb-20 pt-16 sm:px-8 lg:pt-8">{children}</main></div>
    </div>
  );
}
