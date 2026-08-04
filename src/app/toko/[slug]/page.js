import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ClientHomeWrapper from './ClientHomeWrapper';

export default async function StorefrontHomePage({ params }) {
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

  // Fetch top 3 products for preview
  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })
    .limit(3);

  // Fetch bento gallery items (max 4 for bento grid)
  const { data: gallery } = await supabase
    .from('gallery')
    .select('*')
    .eq('store_id', store.id)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(4);

  return (
    <ClientHomeWrapper
      store={store}
      products={products || []}
      gallery={gallery || []}
    />
  );
}
