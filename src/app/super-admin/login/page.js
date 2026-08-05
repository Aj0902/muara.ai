'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginSuperAdmin } from '@/app/actions/auth';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await loginSuperAdmin(formData);
      if (res.error) {
        setError(res.error);
      } else if (res.success) {
        router.push(res.redirect);
        router.refresh();
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Ornaments */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-purple-600/15 blur-[130px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-indigo-500/30 shadow-2xl shadow-indigo-950/50 z-10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/30 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 font-bold block mb-1">Restricted Access</span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">Portal Super Admin</h1>
            <p className="text-xs text-slate-400 mt-1 font-light">Manajemen Platform & Pengawasan Multi-Tenant UMKM.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-xs text-center font-medium animate-in fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">Superadmin Username</label>
            <input
              type="text"
              name="username"
              required
              autoComplete="username"
              placeholder="Username super admin"
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">Superadmin Password</label>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="••••••••••••"
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 mt-6 cursor-pointer"
          >
            {isPending ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Otentikasi...
              </>
            ) : (
              'Masuk Super Admin'
            )}
          </button>
        </form>

        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-[11px] text-slate-400 font-mono space-y-1">
          <p className="font-bold text-white">🔐 Kredensial Super Admin:</p>
          <p>Username: <span className="text-indigo-400">superadmin</span></p>
          <p>Password: <span className="text-indigo-400 font-bold">Muara#2026!SecuredPass</span></p>
        </div>

        <div className="text-center pt-2">
          <Link href="/login" className="text-xs text-slate-500 hover:text-slate-300 font-mono transition-colors">
            &larr; Kembali ke Login Pemilik Toko
          </Link>
        </div>

      </div>
    </div>
  );
}
