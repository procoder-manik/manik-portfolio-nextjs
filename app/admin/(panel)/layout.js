import Sidebar from '@/components/admin/Sidebar';
export const metadata = { title: 'Admin', robots: { index: false, follow: false } };
export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-base">
      <Sidebar />
      <div className="lg:pl-64"><main className="mx-auto max-w-5xl px-5 pb-20 pt-16 sm:px-8 lg:pt-8">{children}</main></div>
    </div>
  );
}
