'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createInstantStoreWithAI } from '../actions/storeGenerator';

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  // Step 1 Form Data
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Step 2 Form Data
  const [storeName, setStoreName] = useState('');
  const [category, setCategory] = useState('kuliner');
  const [description, setDescription] = useState('');

  // AI Loading State & Step checklist animation
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    let interval;
    if (isPending) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev === 0 ? 1 : prev < 4 ? prev + 1 : prev));
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isPending]);

  const handleNextStep1 = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Username dan Password wajib diisi!');
      return;
    }
    if (password.length < 4) {
      setError('Password minimal 4 karakter!');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!storeName.trim() || !description.trim()) {
      setError('Nama Usaha dan Deskripsi Bisnis wajib diisi!');
      return;
    }
    setError('');

    const formData = new FormData();
    formData.append('username', username.trim());
    formData.append('password', password.trim());
    formData.append('store_name', storeName.trim());
    formData.append('category', category);
    formData.append('description', description.trim());

    startTransition(async () => {
      const res = await createInstantStoreWithAI(formData);
      if (res.error) {
        setError(res.error);
      } else if (res.success) {
        router.push('/admin');
        router.refresh();
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-orange-600/20 blur-[130px]"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-amber-600/10 blur-[130px]"></div>

      {/* AI Construction Loading Modal Overlay */}
      {isPending && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-400 p-0.5 shadow-2xl shadow-orange-500/30 animate-bounce mb-6">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-3xl">
              ✨
            </div>
          </div>

          <h3 className="text-2xl font-bold text-white mb-2">AI Instant Store Creator</h3>
          <p className="text-sm text-slate-400 max-w-sm mb-8">
            Sedang meracik toko utuh & katalog produk Anda dari deskripsi yang Anda masukkan...
          </p>

          {/* Checklist Animation */}
          <div className="w-full max-w-sm bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-left space-y-3.5 shadow-lg">
            <div className="flex items-center gap-3">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${loadingStep >= 1 ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                {loadingStep >= 1 ? '✓' : '1'}
              </span>
              <span className={`text-xs ${loadingStep >= 1 ? 'text-white font-semibold' : 'text-slate-500'}`}>
                Meracik Cerita Brand & Persona AI CS...
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${loadingStep >= 2 ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                {loadingStep >= 2 ? '✓' : '2'}
              </span>
              <span className={`text-xs ${loadingStep >= 2 ? 'text-white font-semibold' : 'text-slate-500'}`}>
                Menyiapkan 3 Produk Utama & Gambar Unsplash...
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${loadingStep >= 3 ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                {loadingStep >= 3 ? '✓' : '3'}
              </span>
              <span className={`text-xs ${loadingStep >= 3 ? 'text-white font-semibold' : 'text-slate-500'}`}>
                Menulis 3 Artikel Jurnal & Galeri Visual...
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${loadingStep >= 4 ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                {loadingStep >= 4 ? '✓' : '4'}
              </span>
              <span className={`text-xs ${loadingStep >= 4 ? 'text-white font-semibold' : 'text-slate-500'}`}>
                Meluncurkan Toko ke Dashboard Admin...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 shadow-2xl z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3.5 bg-gradient-to-br from-orange-500/20 to-amber-500/10 text-orange-400 rounded-2xl mb-3 border border-orange-500/20 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">AI Instant Store Creator</h2>
          <p className="text-xs text-slate-400 mt-1.5">
            {step === 1 ? 'Langkah 1/2: Kredensial Akun Admin' : 'Langkah 2/2: Prompting Identitas Bisnis Anda'}
          </p>
          
          {/* Step indicator pills */}
          <div className="flex gap-2 justify-center mt-4">
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-8 bg-orange-500' : 'w-3 bg-slate-700'}`}></div>
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 2 ? 'w-8 bg-orange-500' : 'w-3 bg-slate-700'}`}></div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs mb-6 text-center font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* STEP 1: CREDENTIALS FORM */}
        {step === 1 && (
          <form onSubmit={handleNextStep1} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Username Admin</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ketik username login..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Password Admin</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ketik password admin..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer mt-6"
            >
              <span>Lanjut ke Form Toko AI</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        )}

        {/* STEP 2: STORE PROMPT FORM */}
        {step === 2 && (
          <form onSubmit={handleFinalSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Nama Toko / Usaha</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Contoh: Batik Kencana Trusmi"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Bidang Usaha (Kategori)</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
              >
                <option value="kuliner">🍽️ Kuliner (Makanan & Minuman)</option>
                <option value="fashion">👗 Fashion & Sandang</option>
                <option value="kriya">🛠️ Kriya & Kerajinan Tangan</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Deskripsi Singkat Bisnis (Prompt AI)</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ceritakan singkat usaha Anda (contoh: Toko batik tulis otentik khas Cirebon dengan bahan primisima halus)..."
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500 transition-colors"
              />
              <p className="text-[9.5px] text-slate-500 mt-1">AI akan membaca deskripsi ini untuk membuatkan katalog 3 produk, 3 artikel jurnal, & galeri secara otomatis.</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                ← Kembali
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>✨ Generate Toko AI Instan</span>
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-orange-400 font-bold hover:underline">
            Masuk ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
