'use client';

import Link from 'next/navigation';
import { useStorefrontTheme } from './StorefrontThemeWrapper';
import { useStorefrontCart } from './StorefrontCartProvider';

export default function ClientHomeWrapper({ store, products, gallery }) {
  const { theme } = useStorefrontTheme();
  const { addToCart, buyDirect } = useStorefrontCart();

  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. HERO SECTION */}
      <section id="home" className="relative min-h-[85vh] flex items-center pt-24 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-12 left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-500/10 dark:bg-orange-500/5 blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Text Content */}
            <div className="lg:col-span-6 text-left space-y-6">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-slate-800 dark:text-white">
                {store.name}
              </h1>
              {store.tagline && (
                <p className={`text-base sm:text-lg font-serif italic ${theme.primaryText}`}>
                  {store.tagline}
                </p>
              )}
              {store.description && (
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-light leading-relaxed max-w-lg">
                  {store.description}
                </p>
              )}
              <div className="pt-4">
                <a
                  href={`/toko/${store.slug}/menu`}
                  className={`inline-flex items-center gap-2 text-white px-8 py-3.5 rounded-full font-semibold transition-all shadow-lg hover:opacity-90 ${theme.primary}`}
                >
                  <span>
                    {store.category === 'fashion'
                      ? 'Katalog Busana 👗'
                      : store.category === 'kriya'
                      ? 'Katalog Kerajinan 🛠️'
                      : 'Eksplorasi Menu 🍽️'}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Right Column: Hero Image */}
            <div className="lg:col-span-6 h-[40vh] sm:h-[50vh] lg:h-[55vh] rounded-3xl overflow-hidden shadow-2xl border border-slate-200/50 dark:border-slate-800/50 relative bg-slate-200 dark:bg-slate-800">
              {store.hero_url ? (
                <img
                  src={store.hero_url}
                  alt={store.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-semibold italic">
                  Foto Utama Toko Belum Di-upload
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* 2. ABOUT / STORY SECTION */}
      {store.story && (
        <section id="about" className="py-20 bg-slate-100/50 dark:bg-slate-900/30 border-y border-slate-200/20 dark:border-slate-800/20 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Left: About Image */}
              <div className="lg:col-span-5 h-[40vh] lg:h-[50vh] rounded-3xl overflow-hidden shadow-xl border border-slate-200/50 dark:border-slate-800/50 relative bg-slate-200 dark:bg-slate-800">
                {store.about_url ? (
                  <img
                    src={store.about_url}
                    alt="Sejarah Toko"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-semibold italic">
                    Foto Cerita Toko Belum Di-upload
                  </div>
                )}
              </div>

              {/* Right: Story Content */}
              <div className="lg:col-span-7 space-y-6">
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white">
                  {store.category === 'fashion'
                    ? 'Kisah & Warisan Pengrajin'
                    : store.category === 'kriya'
                    ? 'Kisah & Seni Rotan'
                    : 'Kisah & Warisan Rasa'}
                </h2>
                <div className="w-12 h-1 bg-orange-600 rounded"></div>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-light whitespace-pre-line">
                  {store.story}
                </p>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* 3. MENU / KATALOG PREVIEW HIGHLIGHT */}
      <section id="menu-highlight" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end border-b border-slate-200/50 dark:border-slate-800/50 pb-6 mb-12">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white">
              {store.category === 'fashion'
                ? 'Koleksi Busana Pilihan'
                : store.category === 'kriya'
                ? 'Katalog Kerajinan Rotan Estetik'
                : 'Menu Unggulan Resto'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {store.category === 'fashion'
                ? 'Koleksi batik khas Trusmi Cirebon buatan pengrajin lokal.'
                : store.category === 'kriya'
                ? 'Hasil karya kerajinan rotan estetik kualitas ekspor.'
                : 'Cita rasa hidangan khas racikan resep asli kami.'}
            </p>
          </div>
          <a
            href={`/toko/${store.slug}/menu`}
            className={`text-xs font-bold transition-colors flex items-center gap-1 ${theme.primaryText} ${theme.primaryTextHover}`}
          >
            Lihat Semua <span className="text-[14px]">&rarr;</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.length === 0 ? (
            <div className="col-span-full border border-dashed border-slate-200 dark:border-slate-800 py-12 text-center text-slate-400 text-sm italic rounded-2xl">
              Belum ada produk yang dipublikasikan.
            </div>
          ) : (
            products.map((prod) => (
              <div
                key={prod.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-4 flex flex-col h-full hover:shadow-lg transition-shadow"
              >
                <div className="w-full h-56 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative mb-5">
                  <img
                    src={prod.image_url}
                    alt={prod.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[9px] px-2.5 py-1 rounded-md font-bold">
                    {prod.categories?.name || 'Item'}
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-white mb-1.5">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                  </div>
                  
                  <div>
                    <p className={`text-[9px] font-bold uppercase tracking-wider ${
                      prod.status === 'tersedia' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      Stok: {prod.status}
                    </p>
                    <p className="text-base font-bold text-slate-800 dark:text-white mt-0.5 mb-3">
                      Rp {prod.price.toLocaleString('id-ID')}
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => addToCart(prod)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl transition-all text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>+ Keranjang</span>
                      </button>

                      <button
                        onClick={() => buyDirect(prod)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl transition-all text-xs font-bold flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                      >
                        <span>⚡ Beli Direct</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 4. BENTO GALLERY SECTION */}
      {gallery.length > 0 && (
        <section id="gallery" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white">
              Galeri Visual Toko
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {store.category === 'fashion'
                ? 'Mengintip karya busana dan proses kreasi batik kami.'
                : store.category === 'kriya'
                ? 'Mengintip proses ukir dan anyaman workshop rotan kami.'
                : 'Mengintip kesibukan dapur dan keceriaan tempat kami.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Bento Layout mapping */}
            {/* Large Image (Item 0) */}
            {gallery[0] && (
              <div className="md:col-span-3 h-64 md:h-[350px] rounded-3xl overflow-hidden relative border border-slate-200/50 dark:border-slate-800/50 bg-slate-100 dark:bg-slate-900 group">
                <img src={gallery[0].image_url} alt={gallery[0].caption || 'Galeri'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                {gallery[0].caption && (
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-xs px-4 py-2 font-mono truncate">
                    {gallery[0].caption}
                  </div>
                )}
              </div>
            )}

            {/* Small Images Row (Items 1, 2, 3) */}
            {gallery.slice(1, 4).map((item, idx) => (
              <div key={item.id} className="h-48 md:h-60 rounded-3xl overflow-hidden relative border border-slate-200/50 dark:border-slate-800/50 bg-slate-100 dark:bg-slate-900 group">
                <img src={item.image_url} alt={item.caption || 'Galeri'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                {item.caption && (
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] px-3 py-1.5 font-mono truncate">
                    {item.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
