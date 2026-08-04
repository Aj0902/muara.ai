import { getCurrentStore } from '../../actions/auth';
import Header from '@/components/admin/Header';
import GalleryManager from './GalleryManager';
import { supabase } from '@/lib/supabase';

export default async function AdminGalleryPage() {
  const store = await getCurrentStore();

  // Fetch gallery items
  const { data: galleryItems } = await supabase
    .from('gallery')
    .select('*')
    .eq('store_id', store.id)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  return (
    <>
      <Header title="Manajemen Visual & Aset" store={store} />
      <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <GalleryManager store={store} initialItems={galleryItems || []} />
        </div>
      </main>
    </>
  );
}
