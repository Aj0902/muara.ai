import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAllStores } from '../actions/store';
import SuperAdminDashboard from './SuperAdminDashboard';

export const metadata = {
  title: 'Super Admin Dashboard | CMS UMKM',
  description: 'Pantau dan kelola semua pelaku usaha terdaftar'
};

export default async function SuperAdminPage() {
  const cookieStore = await cookies();
  const isSuper = cookieStore.get('super_session')?.value === 'active';

  if (!isSuper) {
    redirect('/login');
  }

  // Fetch all stores
  const res = await getAllStores();
  const stores = res.stores || [];

  return <SuperAdminDashboard initialStores={stores} />;
}
