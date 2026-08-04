import { getCurrentStore } from '../../actions/auth';
import Header from '@/components/admin/Header';
import JournalManager from './JournalManager';
import { supabase } from '@/lib/supabase';

export default async function AdminJurnalPage() {
  const store = await getCurrentStore();

  // Fetch journal stories
  const { data: journalStories } = await supabase
    .from('journals')
    .select('*')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false });

  return (
    <>
      <Header title="Jurnal & Cerita Toko" store={store} />
      <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <JournalManager store={store} initialStories={journalStories || []} />
        </div>
      </main>
    </>
  );
}
