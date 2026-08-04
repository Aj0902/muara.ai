import { getCurrentStore } from '../../actions/auth';
import Header from '@/components/admin/Header';
import SpecialOrderManager from './SpecialOrderManager';
import { supabase } from '@/lib/supabase';

export default async function AdminSpecialOrdersPage() {
  const store = await getCurrentStore();

  // Fetch special orders from database
  const { data: specialOrders } = await supabase
    .from('special_orders')
    .select('*')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false });

  return (
    <>
      <Header title="Laporan Pesanan Khusus" store={store} />
      <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <SpecialOrderManager store={store} initialOrders={specialOrders || []} />
        </div>
      </main>
    </>
  );
}
