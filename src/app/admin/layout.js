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
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 antialiased font-sans">
      {/* Responsive Sidebar (Mobile Header + Desktop Sidebar) */}
      <Sidebar store={store} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 w-full overflow-y-auto lg:h-full">
        {children}
      </main>
    </div>
  );
}
