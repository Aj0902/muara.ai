import { getCurrentStore } from '../../actions/auth';
import Header from '@/components/admin/Header';
import StandardOrderManager from './StandardOrderManager';
import { supabase } from '@/lib/supabase';

export default async function AdminOrdersPage() {
  const store = await getCurrentStore();

  // Fetch standard orders with their items
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('store_id', store.id)
    .order('created_at', { ascending: false });

  return (
    <>
      <Header title="Sistem Kasir & Pesanan Masuk (POS)" store={store} />
      <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <StandardOrderManager store={store} initialOrders={orders || []} />
        </div>
      </main>
    </>
  );
}
