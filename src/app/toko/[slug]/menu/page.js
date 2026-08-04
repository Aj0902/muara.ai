import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ClientMenuWrapper from './ClientMenuWrapper';

export default async function StorefrontMenuPage({ params }) {
  const { slug } = await params;

  // Fetch store data
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (!store) {
    notFound();
  }

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
    <ClientMenuWrapper
      store={store}
      categories={categories || []}
      products={products || []}
    />
  );
}
