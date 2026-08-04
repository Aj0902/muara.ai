'use client';

import { useState, useTransition } from 'react';
import { addJournalItem, deleteJournalItem } from '../../actions/store';

export default function JournalManager({ store, initialStories }) {
  const [stories, setStories] = useState(initialStories);
  const [isPending, startTransition] = useTransition();

  const [isOpenForm, setIsOpenForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  const handleAddStory = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !content.trim()) {
      setError('Judul dan isi cerita wajib diisi!');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('image_url', imageUrl);

    startTransition(async () => {
      const res = await addJournalItem(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setTitle('');
        setContent('');
        setImageUrl('');
        setIsOpenForm(false);
        window.location.reload();
      }
    });
  };

  const handleDeleteStory = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus cerita ini?')) return;

    startTransition(async () => {
      const res = await deleteJournalItem(id);
      if (res.error) {
        alert(res.error);
      } else {
        window.location.reload();
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Cerita & Jurnal</h3>
          <p className="text-xs text-slate-400 mt-1">Bagikan rahasia resep, sejarah toko, atau kisah di balik layar untuk menarik hati konsumen.</p>
        </div>
        <button
          onClick={() => setIsOpenForm(!isOpenForm)}
          className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-xl font-semibold text-xs transition-all shadow-md shadow-orange-600/10 shrink-0"
        >
          {isOpenForm ? 'Tutup Form' : 'Tulis Cerita Baru'}
        </button>
      </div>

      {/* 2. Form Tambah Cerita */}
      {isOpenForm && (
        <form onSubmit={handleAddStory} className="bg-white border border-slate-200/60 p-6 sm:p-8 rounded-3xl shadow-sm space-y-5 animate-in fade-in slide-in-from-top-4 duration-200">
          <h4 className="font-bold text-slate-800 text-sm">Tulis Cerita Jurnal Baru</h4>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Judul Cerita</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Rahasia Dapur Tradisional Kami"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Link Cover Foto (URL Gambar)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Isi Cerita</label>
            <textarea
              required
              rows="6"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tulis cerita lengkap Anda di sini... Gunakan kalimat yang personal dan mengalir agar dekat dengan pembaca."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsOpenForm(false)}
              className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-600/10 flex items-center gap-1"
            >
              {isPending ? 'Menerbitkan...' : 'Terbitkan Cerita'}
            </button>
          </div>
        </form>
      )}

      {/* 3. List Cerita */}
      <div className="space-y-4">
        {stories.length === 0 ? (
          <div className="bg-white border border-slate-200/60 rounded-3xl py-12 px-4 text-center text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-sm font-semibold">Belum ada cerita yang diterbitkan</p>
            <p className="text-xs mt-1 text-slate-400">Klik &quot;Tulis Cerita Baru&quot; di atas untuk membagikan artikel pertama Anda.</p>
          </div>
        ) : (
          stories.map((story) => (
            <div key={story.id} className="bg-white border border-slate-200/60 rounded-3xl p-5 flex flex-col md:flex-row gap-5 shadow-sm hover:shadow-md transition-shadow relative group">
              <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                <img src={story.image_url} alt={story.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <h4 className="font-bold text-slate-800 text-base leading-snug">{story.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Diterbitkan pada: {new Date(story.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">{story.content}</p>
                </div>
                <div className="flex justify-end mt-4 md:mt-0">
                  <button
                    onClick={() => handleDeleteStory(story.id)}
                    className="text-xs font-semibold text-red-600 hover:text-red-500 flex items-center gap-1 hover:underline transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Hapus Cerita
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
