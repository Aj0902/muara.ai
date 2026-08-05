'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerStore } from '../actions/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const res = await registerStore(formData);
      if (res.error) {
        setError(res.error);
      } else if (res.success) {
        router.push(res.redirect);
        router.refresh();
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-orange-600/20 blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-amber-600/10 blur-[120px]"></div>

      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-md p-8 rounded-3xl border border-slate-700 shadow-2xl z-10">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-orange-500/10 text-orange-500 rounded-2xl mb-3 border border-orange-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Daftarkan UMKM Anda</h2>
          <p className="text-sm text-slate-400 mt-2">Buat identitas digital tokomu hanya dalam 1 menit.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Username Admin</label>
            <input
              type="text"
              name="username"
              required
              autoComplete="username"
              placeholder="Username untuk login"
              className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Password</label>
            <input
              type="password"
              name="password"
              required
              autoComplete="new-password"
              placeholder="Password yang mudah diingat"
              className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Nama Toko / Usaha</label>
            <input
              type="text"
              name="storeName"
              required
              placeholder="Contoh: Jamblang Cipto"
              className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Bidang Usaha (Kategori)</label>
            <select
              name="category"
              required
              className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
            >
              <option value="kuliner" className="bg-slate-800 text-white">Kuliner (Makanan & Minuman)</option>
              <option value="fashion" className="bg-slate-800 text-white">Fashion & Sandang</option>
              <option value="kriya" className="bg-slate-800 text-white">Kriya & Kerajinan Tangan</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 mt-8"
          >
            {isPending ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Mendaftarkan...
              </>
            ) : (
              'Buat Toko Sekarang'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-orange-500 hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
