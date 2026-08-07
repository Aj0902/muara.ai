'use client';

import { useState, useTransition } from 'react';
import { updateStoreProfile } from '../../actions/store';

export default function ProfileForm({ store }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const res = await updateStoreProfile(formData);
      if (res.error) {
        setMessage({ type: 'error', text: res.error });
      } else {
        setMessage({ type: 'success', text: 'Profil web UMKM Anda berhasil diperbarui!' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-5 mb-8">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Identitas Digital Toko</h3>
          <p className="text-xs text-slate-400 mt-1">Informasi di bawah ini akan terupdate langsung di halaman depan website Anda.</p>
        </div>
        <div className="mt-2 sm:mt-0">
          <span className="inline-flex px-3 py-1 bg-orange-50 text-orange-700 text-xs font-bold uppercase rounded-full border border-orange-100">
            Kategori: {store?.category}
          </span>
        </div>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-xl text-sm mb-6 text-center border ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
              : 'bg-red-50 border-red-100 text-red-600'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Branding & Hero Section */}
        <div>
          <h4 className="font-bold text-sm text-slate-700 mb-4 border-l-4 border-orange-500 pl-3 uppercase tracking-wider">
            1. Branding & Hero Section
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nama Toko/Usaha</label>
              <input
                type="text"
                name="name"
                defaultValue={store?.name}
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tagline Usaha</label>
              <input
                type="text"
                name="tagline"
                defaultValue={store?.tagline}
                placeholder="Contoh: Legenda Rasa dari Balik Daun Jati"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Link Logo Usaha (URL Gambar)</label>
              <input
                type="url"
                name="logo_url"
                defaultValue={store?.logo_url}
                placeholder="https://example.com/logo.png"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Deskripsi Singkat Hero</label>
              <textarea
                name="description"
                rows="2"
                defaultValue={store?.description}
                placeholder="Tulis deskripsi pendek untuk dipajang di header atas web..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm resize-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Cerita Usaha (Bagian Tentang Kami)</label>
              <textarea
                name="story"
                rows="4"
                defaultValue={store?.story}
                placeholder="Tulis sejarah berdirinya toko, nilai yang diusung, dsb..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Link Foto Hero Utama (URL Gambar)</label>
              <input
                type="url"
                name="hero_url"
                defaultValue={store?.hero_url}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Link Foto Cerita/About (URL Gambar)</label>
              <input
                type="url"
                name="about_url"
                defaultValue={store?.about_url}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Lokasi & Operasional */}
        <div>
          <h4 className="font-bold text-sm text-slate-700 mb-4 border-l-4 border-orange-500 pl-3 uppercase tracking-wider">
            2. Lokasi & Operasional
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Alamat Lengkap</label>
              <textarea
                name="address"
                rows="2"
                defaultValue={store?.address}
                placeholder="Alamat fisik warung/toko Anda..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Link Google Maps (URL Share)</label>
              <input
                type="url"
                name="maps_link"
                defaultValue={store?.maps_link}
                placeholder="https://maps.google.com/..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">No. WhatsApp (Tanpa tanda + / spasi)</label>
              <input
                type="tel"
                name="whatsapp"
                defaultValue={store?.whatsapp}
                placeholder="Contoh: 081234567890"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Jam Operasional</label>
              <input
                type="text"
                name="hours"
                defaultValue={store?.hours}
                placeholder="Contoh: Senin - Minggu: 08.00 - 22.00 WIB"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Sosial Media & Platform Delivery */}
        <div>
          <h4 className="font-bold text-sm text-slate-700 mb-4 border-l-4 border-orange-500 pl-3 uppercase tracking-wider">
            3. Sosial Media & Pemesanan Online
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sosial Media</h5>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Link Instagram</label>
                <input
                  type="url"
                  name="instagram"
                  defaultValue={store?.instagram}
                  placeholder="https://instagram.com/tokoanda"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Link TikTok</label>
                <input
                  type="url"
                  name="tiktok"
                  defaultValue={store?.tiktok}
                  placeholder="https://tiktok.com/@tokoanda"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Link Facebook</label>
                <input
                  type="url"
                  name="facebook"
                  defaultValue={store?.facebook}
                  placeholder="https://facebook.com/tokoanda"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {(store?.category || 'kuliner').toLowerCase() === 'kuliner' ? 'Platform Pengantaran (Food Delivery)' : 'Platform E-Commerce / Marketplace'}
              </h5>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  {(store?.category || 'kuliner').toLowerCase() === 'kuliner' ? 'Link Toko ShopeeFood' : 'Link Toko Shopee Official / Mall'}
                </label>
                <input
                  type="url"
                  name="shopeefood"
                  defaultValue={store?.shopeefood}
                  placeholder={(store?.category || 'kuliner').toLowerCase() === 'kuliner' ? 'https://shopee.co.id/universal-link' : 'https://shopee.co.id/namatoko'}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  {(store?.category || 'kuliner').toLowerCase() === 'kuliner' ? 'Link Toko GoFood' : 'Link Toko Tokopedia Official'}
                </label>
                <input
                  type="url"
                  name="gofood"
                  defaultValue={store?.gofood}
                  placeholder={(store?.category || 'kuliner').toLowerCase() === 'kuliner' ? 'https://gofood.link/a/...' : 'https://tokopedia.com/namatoko'}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  {(store?.category || 'kuliner').toLowerCase() === 'kuliner' ? 'Link Toko GrabFood' : 'Link Toko Lazada Official'}
                </label>
                <input
                  type="url"
                  name="grabfood"
                  defaultValue={store?.grabfood}
                  placeholder={(store?.category || 'kuliner').toLowerCase() === 'kuliner' ? 'https://grab.onelink.me/...' : 'https://lazada.co.id/shop/namatoko'}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-5 border-t border-slate-100">
          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto px-6 py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-orange-600/10 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Menyimpan...
              </>
            ) : (
              'Simpan Perubahan Web'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
