'use client';

import { useState, useTransition } from 'react';
import { updateAISettings } from '../../actions/store';

export default function AIAssistantForm({ store }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateAISettings(formData);
      if (res.error) {
        setMessage({ type: 'error', text: res.error });
      } else {
        setMessage({ type: 'success', text: 'Konfigurasi Asisten AI Toko Anda berhasil disimpan!' });
      }
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 sm:p-8 space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-orange-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Kustomisasi Chatbot AI
        </h3>
        <p className="text-xs text-slate-400 mt-1">Atur persona dan gaya bicara chatbot yang melayani calon pembeli di web Anda.</p>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-xl text-sm border text-center ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
              : 'bg-red-50 border-red-100 text-red-600'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Chatbot AI</label>
          <input
            type="text"
            name="chatbot_name"
            required
            defaultValue={store?.chatbot_name || 'CiptoBot'}
            placeholder="Contoh: CiptoBot"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Persona / Instruksi Gaya Bicara AI</label>
          <textarea
            name="chatbot_persona"
            rows="6"
            defaultValue={store?.chatbot_persona}
            placeholder="Tulis instruksi persona di sini..."
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm font-sans"
          />
        </div>

        {/* Tip Box */}
        <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl">
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-2">💡 Tips Menulis Persona Yang Bagus:</p>
          <ul className="text-xs text-slate-500 list-disc list-inside space-y-1 leading-relaxed">
            <li><strong>Gunakan Dialek Lokal</strong>: *"Gunakan logat Cirebon yang ramah seperti menggunakan kata 'jeh' atau 'mas bro'..."*</li>
            <li><strong>Tentukan Peran</strong>: *"Anda adalah asisten cerdas yang bertugas memandu konsumen memesan menu di warung kami..."*</li>
            <li><strong>Fokus Jualan</strong>: *"Jika pembeli bingung mau pesan apa, rekomendasikan menu Balakutak Hideung atau Sate Kentang yang terlaris..."*</li>
            <li><strong>Ramah & Solutif</strong>: *"Selalu jawab pertanyaan jam buka toko dan arah Google Maps dengan sopan."*</li>
          </ul>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-3">
          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto px-6 py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-orange-600/10 flex items-center justify-center gap-1.5"
          >
            {isPending ? 'Menyimpan...' : 'Simpan Setelan AI'}
          </button>
        </div>
      </form>

    </div>
  );
}
