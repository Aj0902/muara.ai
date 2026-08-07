'use client';

import { useState, useTransition, useRef } from 'react';
import { updateStoreProfile, importProfileFromCSV } from '../../actions/store';
import { parseCSVFile, downloadCSVTemplate } from '@/lib/csvParser';
import { compressImage } from '@/lib/imageCompressor';

export default function ProfileForm({ store }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState({ type: '', text: '' });

  // Cloudinary Upload states
  const [logoUrl, setLogoUrl] = useState(store?.logo_url || '');
  const [heroUrl, setHeroUrl] = useState(store?.hero_url || '');
  const [aboutUrl, setAboutUrl] = useState(store?.about_url || '');
  const [uploadingField, setUploadingField] = useState(null); // 'logo' | 'hero' | 'about' | null

  // CSV Import state
  const [isImportingCSV, setIsImportingCSV] = useState(false);
  const csvInputRef = useRef(null);

  const logoInputRef = useRef(null);
  const heroInputRef = useRef(null);
  const aboutInputRef = useRef(null);

  const handleImageUpload = async (e, field) => {
    const rawFile = e.target.files[0];
    if (!rawFile) return;

    setUploadingField(field);
    try {
      const file = await compressImage(rawFile);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', `muara_ai/profil_${store.id}`);

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

      if (field === 'logo') setLogoUrl(data.url);
      else if (field === 'hero') setHeroUrl(data.url);
      else if (field === 'about') setAboutUrl(data.url);
    } catch (err) {
      console.error('Image Upload Error:', err);
      alert('Gagal mengunggah foto: ' + err.message);
    } finally {
      setUploadingField(null);
    }
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImportingCSV(true);
    try {
      const rows = await parseCSVFile(file);
      if (!rows || rows.length === 0) {
        alert('File CSV kosong!');
        setIsImportingCSV(false);
        return;
      }

      startTransition(async () => {
        const res = await importProfileFromCSV(rows[0]);
        if (res.error) {
          alert(res.error);
        } else {
          alert('Berhasil mengimpor konfigurasi profil toko dari CSV!');
          window.location.reload();
        }
      });
    } catch (err) {
      console.error('CSV Import Error:', err);
      alert('Gagal menguraikan file CSV: ' + err.message);
    } finally {
      setIsImportingCSV(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const formData = new FormData(e.currentTarget);
    if (logoUrl) formData.set('logo_url', logoUrl);
    if (heroUrl) formData.set('hero_url', heroUrl);
    if (aboutUrl) formData.set('about_url', aboutUrl);

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
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-5 mb-8 gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Identitas Digital Toko</h3>
          <p className="text-xs text-slate-400 mt-1">Informasi di bawah ini akan terupdate langsung di halaman depan website Anda.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Download Template CSV */}
          <button
            type="button"
            onClick={() => downloadCSVTemplate('profile', store.category)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors border border-slate-200"
            title="Download Format CSV Profil"
          >
            <span>📥 Format CSV</span>
          </button>

          {/* Import CSV */}
          <input
            type="file"
            accept=".csv"
            ref={csvInputRef}
            onChange={handleCSVUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => csvInputRef.current?.click()}
            disabled={isImportingCSV}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
          >
            <span>{isImportingCSV ? 'Mengimpor...' : '📤 Import CSV Profil'}</span>
          </button>

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
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Logo Usaha (Cloudinary CDN)</label>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    ref={logoInputRef}
                    onChange={(e) => handleImageUpload(e, 'logo')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingField === 'logo'}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    📷 {uploadingField === 'logo' ? 'Mengunggah...' : 'Unggah Logo'}
                  </button>
                  {logoUrl && <span className="text-xs text-emerald-600 font-semibold">✓ Ter-upload</span>}
                </div>
                <input
                  type="text"
                  name="logo_url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="URL Logo..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50"
                />
              </div>
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
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Foto Hero Utama (Cloudinary CDN)</label>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    ref={heroInputRef}
                    onChange={(e) => handleImageUpload(e, 'hero')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => heroInputRef.current?.click()}
                    disabled={uploadingField === 'hero'}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    📷 {uploadingField === 'hero' ? 'Mengunggah...' : 'Unggah Foto Hero'}
                  </button>
                  {heroUrl && <span className="text-xs text-emerald-600 font-semibold">✓ Ter-upload</span>}
                </div>
                <input
                  type="text"
                  name="hero_url"
                  value={heroUrl}
                  onChange={(e) => setHeroUrl(e.target.value)}
                  placeholder="URL Foto Hero..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Foto Cerita/About (Cloudinary CDN)</label>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    ref={aboutInputRef}
                    onChange={(e) => handleImageUpload(e, 'about')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => aboutInputRef.current?.click()}
                    disabled={uploadingField === 'about'}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    📷 {uploadingField === 'about' ? 'Mengunggah...' : 'Unggah Foto About'}
                  </button>
                  {aboutUrl && <span className="text-xs text-emerald-600 font-semibold">✓ Ter-upload</span>}
                </div>
                <input
                  type="text"
                  name="about_url"
                  value={aboutUrl}
                  onChange={(e) => setAboutUrl(e.target.value)}
                  placeholder="URL Foto About..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50"
                />
              </div>
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
