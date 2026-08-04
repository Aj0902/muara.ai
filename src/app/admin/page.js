import { getCurrentStore } from '../actions/auth';
import Header from '@/components/admin/Header';
import { supabase } from '@/lib/supabase';

export default async function AdminDashboardPage() {
  const store = await getCurrentStore();

  // Fetch count of products
  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', store.id);

  // Fetch count of journals
  const { count: journalCount } = await supabase
    .from('journals')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', store.id);

  return (
    <>
      <Header title="Laporan & Insight" store={store} />
      
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          
          {/* AI Insight Banner */}
          <div className="bg-gradient-to-r from-orange-600 to-amber-500 rounded-3xl p-6 text-white mb-8 shadow-xl shadow-orange-600/10 flex flex-col md:flex-row gap-6 items-center">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">💡 Insight AI untuk {store.name}</h3>
              <p className="text-white/90 text-sm leading-relaxed">
                {store.category === 'kuliner' ? (
                  <>
                    Data simulasi menunjukkan menu terpopuler Anda adalah <strong>Balakutak Hideung</strong>. AI menyarankan untuk membuat promo bundling dengan Es Teh Manis di akhir pekan untuk mendongkrak penjualan hingga 20%.
                  </>
                ) : store.category === 'fashion' ? (
                  <>
                    Katalog sandang Anda siap diakses. AI menyarankan untuk menambahkan deskripsi bahan baku kain pada produk Anda untuk meningkatkan kepercayaan pelanggan saat checkout online.
                  </>
                ) : (
                  <>
                    Katalog kriya seni Anda siap dipasarkan. Ceritakan proses pembuatan kerajinan Anda di kolom Jurnal untuk memberikan nilai tambah (storytelling) bagi calon pembeli.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
              <div className="p-3.5 bg-orange-50 text-orange-600 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pendapatan (Simulasi)</p>
                <h4 className="text-xl font-bold text-slate-800 mt-1">Rp 12.500.000</h4>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
              <div className="p-3.5 bg-orange-50 text-orange-600 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Produk Aktif</p>
                <h4 className="text-xl font-bold text-slate-800 mt-1">{productCount || 0} Item</h4>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
              <div className="p-3.5 bg-orange-50 text-orange-600 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Jurnal & Cerita</p>
                <h4 className="text-xl font-bold text-slate-800 mt-1">{journalCount || 0} Artikel</h4>
              </div>
            </div>
          </div>

          {/* Quick Info & Preview */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Informasi Akses Toko Anda</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Website tokomu saat ini sudah aktif dan dirender secara dinamis berdasarkan data profil, katalog produk, dan jurnal cerita yang lu masukkan lewat dashboard ini.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/50">
              <span className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider sm:border-r border-slate-200 sm:pr-4">Link Website</span>
              <span className="text-sm font-mono text-slate-600 flex-1 truncate select-all">
                {`/toko/${store.slug}`}
              </span>
              <a
                href={`/toko/${store.slug}`}
                target="_blank"
                className="w-full sm:w-auto text-center px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Kunjungi Website
              </a>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
