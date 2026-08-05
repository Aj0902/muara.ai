import { redirect } from 'next/navigation';
import { getCurrentStore } from '../actions/auth';
import Sidebar from '@/components/admin/Sidebar';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Dashboard Admin | CMS UMKM',
  description: 'Kelola identitas digital UMKM Anda'
};

export default async function AdminLayout({ children }) {
  const store = await getCurrentStore();

  if (!store) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800 antialiased font-sans">
      {/* Sidebar */}
      <Sidebar store={store} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
