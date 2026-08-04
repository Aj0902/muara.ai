'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginStore } from '../actions/auth';

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const res = await loginStore(formData);
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Masuk Dashboard</h2>
          <p className="text-sm text-slate-400 mt-2">Kelola toko digital Anda dengan asisten cerdas.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Username</label>
            <input
              type="text"
              name="username"
              required
              placeholder="Username toko atau superadmin"
              className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Password</label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
            />
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
                Memproses...
              </>
            ) : (
              'Masuk Sekarang'
            )}
          </button>
        </form>

        <div className="bg-slate-900/40 p-4 rounded-xl mt-6 border border-slate-700/50">
          <p className="text-[11px] text-slate-400 font-mono">
            💡 <span className="font-semibold">Super Admin Hint:</span><br />
            Username: <span className="text-orange-400">superadmin</span><br />
            Password: <span className="text-orange-400">super123</span>
          </p>
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          Belum punya toko?{' '}
          <Link href="/register" className="text-orange-500 hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
