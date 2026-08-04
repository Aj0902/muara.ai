'use client';

import { useState } from 'react';
import { useStorefrontTheme } from '../StorefrontThemeWrapper';

export default function ClientJournalWrapper({ store, journals }) {
  const { theme } = useStorefrontTheme();
  const [selectedJournal, setSelectedJournal] = useState(null);

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Page Header */}
      <div className="text-center md:text-left border-b border-slate-200/50 dark:border-slate-800/50 pb-6 mb-10">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white">
          Jurnal & Cerita
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Kumpulan cerita di balik layar, rahasia proses, dan inspirasi perjalanan usaha kami.
        </p>
      </div>

      {/* Grid Cerita */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {journals.length === 0 ? (
          <div className="col-span-full border border-dashed border-slate-200 dark:border-slate-800 py-16 text-center text-slate-400 text-sm italic rounded-2xl bg-white dark:bg-slate-900/50">
            Belum ada cerita jurnal yang diterbitkan.
          </div>
        ) : (
          journals.map((story) => (
            <div
              key={story.id}
              onClick={() => setSelectedJournal(story)}
              className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-4 flex flex-col h-full hover:shadow-lg hover:border-orange-500/20 cursor-pointer transition-all duration-300 group"
            >
              <div className="w-full h-52 rounded-xl overflow-hidden mb-5 bg-slate-100 dark:bg-slate-800 relative">
                <img
                  src={story.image_url}
                  alt={story.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                    {story.title}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-3 leading-relaxed mb-4">
                    {story.content}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50 mt-auto flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(story.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className={`text-xs font-semibold flex items-center gap-1 ${theme.primaryText}`}>
                    Selengkapnya <span className="text-[14px]">&rarr;</span>
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FULL STORY MODAL */}
      {selectedJournal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedJournal(null)}
          ></div>
          
          {/* Content Container */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-250">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedJournal(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-orange-600 text-white flex items-center justify-center transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 hide-scrollbar">
              
              {/* Modal Cover Image */}
              <div className="w-full h-64 sm:h-80 bg-slate-100 dark:bg-slate-800 relative">
                <img
                  src={selectedJournal.image_url}
                  alt={selectedJournal.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent"></div>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${theme.primary} text-white`}>
                    Cerita Bisnis
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {new Date(selectedJournal.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-tight text-slate-800 dark:text-white">
                  {selectedJournal.title}
                </h2>

                <div className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-light whitespace-pre-line border-t border-slate-100 dark:border-slate-800/80 pt-6">
                  {selectedJournal.content}
                </div>

                {/* Share Row */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <span className="text-xs font-semibold text-slate-400">Bagikan Cerita Ini:</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link berhasil disalin!');
                      }}
                      className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
                      title="Salin Link"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(selectedJournal.title + ' - ' + window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-emerald-600 transition-colors"
                      title="Share WhatsApp"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </a>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
