'use client';

import { useStorefrontTheme } from './StorefrontThemeWrapper';

export default function StorefrontFooter({ store }) {
  const { theme } = useStorefrontTheme();

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/50 dark:border-slate-800/50 pt-16 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Section 1: Branding */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={store.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(store.name)}&background=C2410C&color=fff`}
                alt="Logo"
                className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-800 object-cover"
              />
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-slate-800 dark:text-white block">
                  {store.name}
                </span>
                {store.tagline && (
                  <span className={`text-xs italic font-serif ${theme.primaryText}`}>
                    {store.tagline}
                  </span>
                )}
              </div>
            </div>
            {store.description && (
              <p className="text-sm text-slate-400 dark:text-slate-500 max-w-sm leading-relaxed">
                {store.description}
              </p>
            )}
          </div>

          {/* Section 2: Address & Google Maps */}
          {store.address && (
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Alamat Kami</h4>
              <div className="flex items-start gap-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {store.maps_link ? (
                  <a
                    href={store.maps_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:underline transition-colors leading-relaxed"
                  >
                    {store.address}
                  </a>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {store.address}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Section 3: Hours & Contact */}
          <div className="space-y-4">
            {store.hours && (
              <div className="space-y-1.5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Jam Operasional</h4>
                <div className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-orange-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {store.hours}
                  </p>
                </div>
              </div>
            )}

            {/* WhatsApp & Social Media Links */}
            <div className="space-y-3 pt-2">
              {store.whatsapp && (
                <a
                  href={`https://wa.me/${store.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition-opacity hover:opacity-90 ${theme.primary}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Hubungi WhatsApp
                </a>
              )}

              {/* Social Media Row */}
              <div className="flex gap-3">
                {store.instagram && (
                  <a href={store.instagram} target="_blank" className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all" title="Instagram">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-pink-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.315 2H7.685C4.545 2 2 4.545 2 7.685v4.63C2 15.455 4.545 18 7.685 18h4.63C15.455 18 18 15.455 18 12.315V7.685C18 4.545 15.455 2 12.315 2zM10 13a3 3 0 110-6 3 3 0 010 6zm0-4.8a1.8 1.8 0 100 3.6 1.8 1.8 0 000-3.6z" clipRule="evenodd" />
                    </svg>
                  </a>
                )}
                {store.tiktok && (
                  <a href={store.tiktok} target="_blank" className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all" title="TikTok">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-800 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 10l12-3" />
                    </svg>
                  </a>
                )}
                {store.facebook && (
                  <a href={store.facebook} target="_blank" className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all" title="Facebook">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bottom copyright */}
        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-6 text-center text-[10px] text-slate-400 dark:text-slate-500 font-mono">
          &copy; {new Date().getFullYear()} {store.name}. Didukung oleh Platform CMS UMKM.
        </div>
      </div>
    </footer>
  );
}
