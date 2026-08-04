import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ClientJournalWrapper from './ClientJournalWrapper';

export default async function StorefrontJurnalPage({ params }) {
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

  // Fetch all journals for store
  const { data: journals } = await supabase
    .from('journals')
    .select('*')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false });

  return (
    <ClientJournalWrapper
      store={store}
      journals={journals || []}
    />
  );
}
