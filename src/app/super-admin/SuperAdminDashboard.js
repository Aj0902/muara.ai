'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { impersonateStore, logoutStore } from '../actions/auth';
import { deleteStore } from '../actions/store';

export default function SuperAdminDashboard({ initialStores }) {
  const router = useRouter();
  const [stores, setStores] = useState(initialStores);
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const totalStores = stores.length;
  const kulinerCount = stores.filter((s) => s.category === 'kuliner').length;
  const fashionCount = stores.filter((s) => s.category === 'fashion').length;
  const kriyaCount = stores.filter((s) => s.category === 'kriya').length;

  const handleLogout = async () => {
    startTransition(async () => {
      await logoutStore();
      router.push('/login');
      router.refresh();
    });
  };

  const handleImpersonate = async (storeId) => {
    startTransition(async () => {
      const res = await impersonateStore(storeId);
      if (res.error) {
        alert(res.error);
      } else {
        router.push(res.redirect);
        router.refresh();
      }
    });
  };

  const handleDelete = async (storeId) => {
    if (!confirm('PERINGATAN: Menghapus toko ini akan menghapus semua produk, galeri, dan cerita yang berkaitan. Apakah Anda yakin?')) return;

    startTransition(async () => {
      const res = await deleteStore(storeId);
      if (res.error) {
        alert(res.error);
      } else {
        setStores(stores.filter((s) => s.id !== storeId));
        router.refresh();
      }
    });
  };

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.slug.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'all' || store.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-orange-500 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-widest font-mono">Control Center</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Super Admin Dashboard</h1>
            <p className="text-xs text-slate-400 mt-1">Pantau, kelola, dan impersonasi akun pelaku usaha terdaftar.</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="px-4 py-2 border border-slate-800 hover:bg-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            Keluar (Log Out)
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-800">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Toko</p>
            <h4 className="text-2xl font-bold text-orange-500 mt-1">{totalStores}</h4>
          </div>
          <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-800">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kuliner</p>
            <h4 className="text-2xl font-bold text-white mt-1">{kulinerCount}</h4>
          </div>
          <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-800">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fashion</p>
            <h4 className="text-2xl font-bold text-white mt-1">{fashionCount}</h4>
          </div>
          <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-800">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kriya</p>
            <h4 className="text-2xl font-bold text-white mt-1">{kriyaCount}</h4>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-slate-800/30 p-4 rounded-2xl border border-slate-800/60">
          <div className="relative flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari toko, username, slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 rounded-xl py-2.5 pl-11 pr-4 text-xs text-white focus:outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-900 border border-slate-800 focus:border-orange-500 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              <option value="kuliner">Kuliner</option>
              <option value="fashion">Fashion</option>
              <option value="kriya">Kriya</option>
            </select>
          </div>
        </div>

        {/* Table List */}
        <div className="bg-slate-800/40 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Toko UMKM</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Slug URL</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4 text-right">Aksi Manajemen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredStores.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-mono">
                      Tidak ada toko terdaftar yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredStores.map((store) => (
                    <tr key={store.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img
                          src={store.logo_url}
                          alt="Logo"
                          className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700"
                        />
                        <div>
                          <p className="font-bold text-white text-sm">{store.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Terdaftar: {new Date(store.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold border text-[9px] uppercase ${
                          store.category === 'kuliner'
                            ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                            : store.category === 'fashion'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {store.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-400 text-[11px] select-all">
                        /toko/{store.slug}
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-semibold">{store.username}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleImpersonate(store.id)}
                          className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold transition-all shadow shadow-orange-600/10 flex-inline items-center gap-1"
                        >
                          Kelola Toko (Impersonate)
                        </button>
                        <button
                          onClick={() => handleDelete(store.id)}
                          className="px-3.5 py-1.5 border border-red-500/20 hover:bg-red-500/10 text-red-400 rounded-lg font-semibold transition-all"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
