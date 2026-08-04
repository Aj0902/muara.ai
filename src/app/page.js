import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/10 blur-[130px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-600/10 blur-[130px] pointer-events-none"></div>

      {/* Navbar */}
      <header className="max-w-7xl mx-auto w-full px-6 sm:px-8 h-20 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5 text-orange-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="text-xl font-bold tracking-tight text-white font-mono">CMS-UMKM</span>
        </div>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-xl transition-all"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="text-xs sm:text-sm font-semibold bg-orange-600 hover:bg-orange-500 text-white px-4.5 py-2.5 rounded-xl transition-all shadow-md shadow-orange-600/15"
          >
            Daftar Toko
          </Link>
        </div>
      </header>

      {/* Main Hero */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 sm:px-8 flex flex-col items-center justify-center text-center py-16 z-10 space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] sm:text-xs font-bold uppercase tracking-wider font-mono">
          🚀 Next-Gen Multi-tenant CMS
        </div>
        
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-3xl leading-[1.1] font-serif">
          Hadirkan Toko Digital <br />
          <span className="bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">
            UMKM Naik Kelas
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-lg leading-relaxed font-light">
          Buat website portofolio profesional untuk usaha Kuliner, Fashion, atau Kriya Anda dalam hitungan detik. Kelola produk, bento grid galeri, cerita brand, dan asisten pintar Anda lewat satu dashboard admin yang super praktis.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full justify-center max-w-xs sm:max-w-none">
          <Link
            href="/register"
            className="w-full sm:w-auto text-center px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-full font-semibold text-sm transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2"
          >
            Mulai Secara Gratis
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          
          <Link
            href="/login"
            className="w-full sm:w-auto text-center px-8 py-4 border border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-white rounded-full font-semibold text-sm transition-all"
          >
            Masuk Dashboard Admin
          </Link>
        </div>

        {/* Categories preview chips */}
        <div className="flex items-center justify-center gap-6 pt-8 border-t border-slate-900/60 w-full max-w-md">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span> Kuliner
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Fashion
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Kriya
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-16 flex items-center justify-center text-[10px] text-slate-600 dark:text-slate-500 font-mono border-t border-slate-900/40 z-10">
        &copy; {new Date().getFullYear()} CMS UMKM. Dibuat dengan Next.js & Supabase.
      </footer>
    </div>
  );
}
