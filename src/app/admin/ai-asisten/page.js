import { getCurrentStore } from '../../actions/auth';
import Header from '@/components/admin/Header';
import AIAssistantForm from './AIAssistantForm';

export default async function AdminAIAssistentPage() {
  const store = await getCurrentStore();

  return (
    <>
      <Header title="Pengaturan AI Asisten Toko" store={store} />
      <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
        <div className="max-w-xl mx-auto">
          <AIAssistantForm store={store} />
        </div>
      </main>
    </>
  );
}
