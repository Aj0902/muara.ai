import { getCurrentStore } from '../../actions/auth';
import Header from '@/components/admin/Header';
import ChatLogManager from './ChatLogManager';
import { supabase } from '@/lib/supabase';

export default async function AdminChatLogsPage() {
  const store = await getCurrentStore();

  // Fetch all chat logs for this store
  const { data: logs } = await supabase
    .from('chat_logs')
    .select('*')
    .eq('store_id', store.id)
    .order('created_at', { ascending: true });

  return (
    <>
      <Header title="Riwayat Percakapan AI" store={store} />
      <main className="flex-1 overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col">
        <ChatLogManager store={store} initialLogs={logs || []} />
      </main>
    </>
  );
}
