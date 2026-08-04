'use client';

import Link from 'next/link';

export default function Header({ title, store }) {
  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight" id="header-title">
          {title}
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        {store?.slug && (
          <Link
            href={`/toko/${store.slug}`}
            target="_blank"
            className="text-xs font-semibold text-orange-600 hover:text-orange-500 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 transition-all border border-orange-200/50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 00-2 2v1a3 3 0 003 3h10a3 3 0 003-3v-1a2 2 0 00-2-2h-4" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h6m0 0v6m0-6L14 10" />
            </svg>
            Lihat Web Toko
          </Link>
        )}
        <div className="w-px h-6 bg-slate-200"></div>
        <button className="relative p-2 text-slate-400 hover:text-orange-600 transition-colors bg-slate-50 hover:bg-orange-50 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
