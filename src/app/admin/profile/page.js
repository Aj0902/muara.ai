import { getCurrentStore } from '../../actions/auth';
import Header from '@/components/admin/Header';
import ProfileForm from './ProfileForm';

export default async function AdminProfilePage() {
  const store = await getCurrentStore();

  return (
    <>
      <Header title="Profile UMKM" store={store} />
      <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <ProfileForm store={store} />
        </div>
      </main>
    </>
  );
}
