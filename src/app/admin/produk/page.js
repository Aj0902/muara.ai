import { getCurrentStore } from '../../actions/auth';
import Header from '@/components/admin/Header';
import ProductManager from './ProductManager';
import { supabase } from '@/lib/supabase';

export default async function AdminProdukPage() {
  const store = await getCurrentStore();

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('store_id', store.id)
    .order('created_at', { ascending: true });

  // Fetch products
  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false });

  return (
    <>
      <Header
        title={store?.category === 'kuliner' ? 'Manajemen Menu Makanan' : 'Manajemen Katalog Produk'}
        store={store}
      />
      <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <ProductManager
            store={store}
            initialCategories={categories || []}
            initialProducts={products || []}
          />
        </div>
      </main>
    </>
  );
}
