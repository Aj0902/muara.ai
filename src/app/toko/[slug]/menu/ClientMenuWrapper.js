'use client';

import { useState } from 'react';
import { useStorefrontTheme } from '../StorefrontThemeWrapper';
import { useStorefrontCart } from '../StorefrontCartProvider';

export default function ClientMenuWrapper({ store, categories, products }) {
  const { theme } = useStorefrontTheme();
  const { addToCart } = useStorefrontCart();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prod.description && prod.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || prod.category_id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Page Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/50 dark:border-slate-800/50 pb-6">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white">
            {store.category === 'fashion'
              ? 'Katalog Busana & OOTD'
              : store.category === 'kriya'
              ? 'Katalog Kerajinan Rotan'
              : 'Daftar Menu Utama'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {store.category === 'fashion'
              ? 'Temukan aneka batik Megamendung, gamis, dan kemeja premium khas Trusmi.'
              : store.category === 'kriya'
              ? 'Temukan aneka perabotan rotan alami & sintetis kualitas ekspor.'
              : 'Temukan sajian lezat terbaik dari dapur resep asli kami.'}
          </p>
        </div>
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder={
              store.category === 'fashion'
                ? 'Cari kemeja, gamis, batik, atau size...'
                : store.category === 'kriya'
                ? 'Cari kursi rotan, keranjang, atau meja...'
                : 'Cari menu makanan atau minuman...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full py-2.5 pl-12 pr-4 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Main Categories & Products Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Sidebar Kategori */}
        <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-28 z-10">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-5 rounded-2xl shadow-sm">
            <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-white mb-4 hidden lg:block px-1">
              Kategori
            </h3>
            
            <ul className="flex overflow-x-auto lg:flex-col gap-2 hide-scrollbar pb-2 lg:pb-0 scroll-smooth">
              {/* All Category Button */}
              <li>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors flex items-center justify-between whitespace-nowrap ${
                    selectedCategory === 'all'
                      ? `${theme.primary} text-white`
                      : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>Semua Produk</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    selectedCategory === 'all'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {products.length}
                  </span>
                </button>
              </li>

              {/* Dynamic Category Buttons */}
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const count = products.filter((p) => p.category_id === cat.id).length;

                return (
                  <li key={cat.id}>
                    <button
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors flex items-center justify-between whitespace-nowrap ${
                        isSelected
                          ? `${theme.primary} text-white`
                          : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}>
                        {count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Products Grid */}
        <section className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full border border-dashed border-slate-200 dark:border-slate-800 py-16 text-center text-slate-400 text-xs italic rounded-2xl bg-white dark:bg-slate-900/50">
              Tidak ada produk yang cocok dengan kategori atau pencarian.
            </div>
          ) : (
            filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-4 flex flex-col h-full hover:shadow-lg transition-shadow"
              >
                <div className="w-full h-52 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative mb-4">
                  <img
                    src={prod.image_url}
                    alt={prod.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[9px] px-2.5 py-1 rounded-md font-bold">
                    {prod.categories?.name || 'Item'}
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-white mb-1.5">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50 mt-4 flex items-center justify-between">
                    <div>
                      <p className={`text-[9px] font-bold uppercase tracking-wider ${
                        prod.status === 'tersedia' 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : prod.status === 'terbatas' 
                          ? 'text-amber-600 dark:text-amber-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        Stok: {prod.status}
                      </p>
                      <p className="text-base font-bold text-slate-800 dark:text-white mt-0.5">
                        Rp {prod.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => addToCart(prod)}
                      className="bg-slate-100 hover:bg-orange-600 dark:bg-slate-850 dark:hover:bg-orange-600 text-slate-600 dark:text-slate-300 hover:text-white dark:hover:text-white p-2.5 rounded-full transition-all duration-300 shadow-sm cursor-pointer"
                      title="Tambah ke Keranjang AI"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

      </div>
    </div>
  );
}
