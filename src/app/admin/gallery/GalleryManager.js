'use client';

import { useState, useTransition, useRef } from 'react';
import Link from 'next/link';
import { addGalleryItem, deleteGalleryItem } from '../../actions/store';
import { compressImage } from '@/lib/imageCompressor';

export default function GalleryManager({ store, initialItems }) {
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();

  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [message, setMessage] = useState('');

  // Image Upload state
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const rawFile = e.target.files[0];
    if (!rawFile) return;

    setIsUploadingImage(true);
    setMessage('');

    try {
      const file = await compressImage(rawFile);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', `muara_ai/galeri_${store.id}`);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const text = await res.text();
        if (res.status === 413 || text.includes('Entity Too Large')) {
          throw new Error('Ukuran foto terlalu besar. Silakan pilih foto dengan ukuran lebih kecil.');
        }
        let jsonErr;
        try { jsonErr = JSON.parse(text); } catch {}
        throw new Error(jsonErr?.error || text || `HTTP Status ${res.status}`);
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setImageUrl(data.url);
    } catch (err) {
      console.error('Image Upload Error:', err);
      setMessage('Gagal mengunggah foto: ' + err.message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;

    const formData = new FormData();
    formData.append('image_url', imageUrl);
    formData.append('caption', caption);
    formData.append('display_order', displayOrder);

    startTransition(async () => {
      const res = await addGalleryItem(formData);
      if (res.error) {
        setMessage(res.error);
      } else {
        setImageUrl('');
        setCaption('');
        setDisplayOrder('0');
        window.location.reload();
      }
    });
  };

  const handleDeletePhoto = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus foto ini dari galeri?')) return;

    startTransition(async () => {
      const res = await deleteGalleryItem(id);
      if (res.error) {
        alert(res.error);
      } else {
        window.location.reload();
      }
    });
  };

  return (
    <div className="space-y-10">
      
      {/* 1. Core Web Assets Section */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 sm:p-8">
        <div className="border-b border-slate-100 pb-4 mb-6">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            1. Aset Utama Web (Header, Hero & About)
          </h4>
          <p className="text-xs text-slate-400 mt-1">Aset branding utama yang mendefinisikan identitas visual website Anda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Logo */}
          <div className="md:col-span-3 flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Logo Usaha</label>
            <div className="relative w-32 h-32 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden group">
              <img
                src={store?.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(store.name)}&background=C2410C&color=fff`}
                alt="Logo"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Link
                  href="/admin/profile"
                  className="w-8 h-8 rounded-full bg-white text-slate-800 hover:text-orange-600 flex items-center justify-center shadow"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Hero Banner */}
          <div className="md:col-span-5 flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hero Banner</label>
            <div className="relative w-full h-32 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden group">
              {store?.hero_url ? (
                <img src={store.hero_url} alt="Hero" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs font-semibold">
                  Belum Ada Hero Banner
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Link
                  href="/admin/profile"
                  className="w-8 h-8 rounded-full bg-white text-slate-800 hover:text-orange-600 flex items-center justify-center shadow"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* About Image */}
          <div className="md:col-span-4 flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Foto Tentang Kami</label>
            <div className="relative w-full h-32 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden group">
              {store?.about_url ? (
                <img src={store.about_url} alt="About" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs font-semibold">
                  Belum Ada About Image
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Link
                  href="/admin/profile"
                  className="w-8 h-8 rounded-full bg-white text-slate-800 hover:text-orange-600 flex items-center justify-center shadow"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Bento Grid Gallery Section */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 sm:p-8">
        <div className="border-b border-slate-100 pb-4 mb-6">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            2. Kelola Galeri Bento
          </h4>
          <p className="text-xs text-slate-400 mt-1">Upload foto suasana warung/toko, aktivitas produksi, atau testimoni untuk dipajang di Bento Grid galeri web.</p>
        </div>

        {/* Form Tambah Foto */}
        <form onSubmit={handleAddPhoto} className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl mb-8 space-y-4">
          <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Tambah Foto Galeri Baru</h5>
          
          {message && (
            <div className="bg-red-50 text-red-600 border border-red-100 p-3 rounded-xl text-xs font-semibold text-center">
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Foto Galeri (Cloudinary CDN)</label>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    📷 {isUploadingImage ? 'Mengunggah...' : 'Unggah Foto'}
                  </button>
                  {imageUrl && <span className="text-xs text-emerald-600 font-semibold">✓ Ter-upload</span>}
                </div>
                <input
                  type="text"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Atau tempel URL gambar..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-xs bg-white"
                />
              </div>
            </div>
            
            <div className="md:col-span-4">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Keterangan Foto</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Contoh: Proses membungkus nasi"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-xs bg-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Urutan Tampil</label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-xs bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-600/10 flex items-center gap-1.5"
            >
              {isPending ? 'Menambahkan...' : 'Tambah Ke Galeri'}
            </button>
          </div>
        </form>

        {/* Grid Gambar Galeri */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {items.length === 0 ? (
            <div className="col-span-full border border-slate-200 border-dashed rounded-2xl py-8 text-center text-slate-400 text-xs">
              Belum ada foto tambahan di Galeri Bento.
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="relative rounded-2xl overflow-hidden h-32 group border border-slate-200 shadow-sm bg-slate-100">
                <img src={item.image_url} alt={item.caption || 'Galeri'} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => handleDeletePhoto(item.id)}
                    className="w-9 h-9 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors shadow"
                    title="Hapus Foto"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                {item.caption && (
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] px-2 py-1 truncate">
                    {item.caption}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
