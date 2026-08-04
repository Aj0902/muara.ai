'use client';

import { useState, useTransition } from 'react';
import {
  addCategory,
  deleteCategory,
  addProduct,
  updateProduct,
  deleteProduct
} from '../../actions/store';

export default function ProductManager({ store, initialCategories, initialProducts }) {
  const [categories, setCategories] = useState(initialCategories);
  const [products, setProducts] = useState(initialProducts);
  const [isPending, startTransition] = useTransition();

  const [activeModal, setActiveModal] = useState(null); // 'add' | 'edit' | null
  const [editingProduct, setEditingProduct] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');

  // Handle Category Add
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    const formData = new FormData();
    formData.append('name', categoryName);

    startTransition(async () => {
      const res = await addCategory(formData);
      if (res.error) {
        alert(res.error);
      } else {
        setCategoryName('');
        // Refresh local state (in production, next.js revalidatePath handles it, but local state helps UI react immediately)
        window.location.reload();
      }
    });
  };

  // Handle Category Delete
  const handleDeleteCategory = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini? Produk dalam kategori ini akan dipindahkan ke tanpa kategori.')) return;
    
    startTransition(async () => {
      const res = await deleteCategory(id);
      if (res.error) {
        alert(res.error);
      } else {
        window.location.reload();
      }
    });
  };

  // Handle Product Submit (Add / Edit)
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      let res;
      if (activeModal === 'add') {
        res = await addProduct(formData);
      } else {
        res = await updateProduct(editingProduct.id, formData);
      }

      if (res.error) {
        setError(res.error);
      } else {
        setActiveModal(null);
        setEditingProduct(null);
        window.location.reload();
      }
    });
  };

  // Handle Product Delete
  const handleDeleteProduct = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;

    startTransition(async () => {
      const res = await deleteProduct(id);
      if (res.error) {
        alert(res.error);
      } else {
        window.location.reload();
      }
    });
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setActiveModal('edit');
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Header & Tambah Tombol */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">
            {store.category === 'kuliner' ? 'Kelola Daftar Menu' : 'Kelola Katalog Produk'}
          </h3>
          <p className="text-sm text-slate-400">
            {store.category === 'kuliner' ? 'Daftar makanan & minuman yang muncul di web.' : 'Daftar produk fashion atau karya kerajinan Anda.'}
          </p>
        </div>
        <button
          onClick={() => setActiveModal('add')}
          className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-600/10 text-sm shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          {store.category === 'kuliner' ? 'Tambah Menu Baru' : 'Tambah Produk Baru'}
        </button>
      </div>

      {/* 2. Manajemen Kategori */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h4 className="font-bold text-slate-800 text-sm">Kategori Aktif</h4>
        </div>
        
        <div className="flex flex-wrap gap-2.5 items-center">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-slate-50 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-200/80 group transition-colors hover:bg-red-50 hover:border-red-200"
            >
              <span>{cat.name}</span>
              <button
                onClick={() => handleDeleteCategory(cat.id)}
                className="text-slate-400 hover:text-red-600 transition-colors"
                title="Hapus Kategori"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}

          {/* Form Tambah Kategori */}
          <form onSubmit={handleAddCategory} className="flex items-center gap-2 ml-2">
            <input
              type="text"
              placeholder="Kategori baru..."
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 w-36 bg-slate-50 focus:bg-white transition-all"
            />
            <button
              type="submit"
              className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center hover:bg-orange-500 transition-colors shadow-md shadow-orange-600/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* 3. Grid Produk */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200/60 rounded-3xl py-12 px-4 text-center text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-sm font-semibold">Belum ada produk terdaftar</p>
            <p className="text-xs mt-1 text-slate-400">Klik tombol di atas untuk menambah menu/katalog jualan Anda.</p>
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm group hover:shadow-md transition-all flex flex-col h-full">
              <div className="h-44 bg-slate-100 relative overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-lg font-bold">
                  {product.categories?.name || 'Tanpa Kategori'}
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5">
                  <button
                    onClick={() => openEditModal(product)}
                    className="w-9 h-9 rounded-full bg-white text-slate-800 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-colors shadow"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="w-9 h-9 rounded-full bg-white text-slate-800 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors shadow"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h4 className="font-bold text-slate-800 text-base leading-snug">{product.name}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase shrink-0 ${
                      product.status === 'tersedia'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : product.status === 'terbatas'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{product.description}</p>
                </div>
                <div className="pt-4 border-t border-slate-100 mt-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Harga</p>
                  <p className="text-lg font-bold text-orange-600 mt-0.5">Rp {product.price.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. MODAL ADD/EDIT PRODUCT */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => {
              setActiveModal(null);
              setEditingProduct(null);
            }}
          ></div>
          
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden border border-slate-200 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-base">
                {activeModal === 'add' ? 'Tambah Produk Jualan Baru' : 'Edit Detail Produk'}
              </h3>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setEditingProduct(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-b border-red-100 text-red-600 text-xs font-semibold text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleProductSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Produk</label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingProduct?.name}
                  placeholder="Contoh: Balakutak Hideung"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Harga (Rp)</label>
                  <input
                    type="number"
                    name="price"
                    required
                    defaultValue={editingProduct?.price}
                    placeholder="Contoh: 25000"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Kategori</label>
                  <select
                    name="category_id"
                    defaultValue={editingProduct?.category_id || ''}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm cursor-pointer"
                  >
                    <option value="">-- Tanpa Kategori --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status Ketersediaan</label>
                <select
                  name="status"
                  defaultValue={editingProduct?.status || 'tersedia'}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm cursor-pointer"
                >
                  <option value="tersedia">Tersedia (Ready)</option>
                  <option value="terbatas">Terbatas (Limited)</option>
                  <option value="habis">Habis (Sold Out)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Link Foto Produk (URL)</label>
                <input
                  type="url"
                  name="image_url"
                  defaultValue={editingProduct?.image_url}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Deskripsi Produk</label>
                <textarea
                  name="description"
                  rows="3"
                  defaultValue={editingProduct?.description}
                  placeholder="Deskripsi cita rasa, porsi, atau keunikan produk..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    setEditingProduct(null);
                  }}
                  className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors text-sm font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-orange-600/10"
                >
                  {isPending ? 'Menyimpan...' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
