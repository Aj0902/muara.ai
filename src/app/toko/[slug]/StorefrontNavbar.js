'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStorefrontTheme } from './StorefrontThemeWrapper';
import { useStorefrontCart } from './StorefrontCartProvider';

export default function StorefrontNavbar({ store }) {
  const pathname = usePathname();
  const { darkMode, toggleDarkMode, theme } = useStorefrontTheme();

  const navLinks = [
    { name: 'Home', path: `/toko/${store.slug}` },
    { name: 'About', path: `/toko/${store.slug}#about` },
    { name: store.category === 'kuliner' ? 'Menu' : 'Katalog', path: `/toko/${store.slug}/menu` },
    { name: 'Jurnal', path: `/toko/${store.slug}/jurnal` }
  ];

  return (
    <header className="fixed top-0 w-full z-50 transition-all duration-300 border-b border-slate-200/40 dark:border-slate-800/40 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link href={`/toko/${store.slug}`} className="flex items-center gap-2.5 group">
            <img
              src={store.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(store.name)}&background=C2410C&color=fff`}
              alt="Logo"
              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-800 group-hover:scale-105 transition-transform"
            />
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
              {store.name}
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link, idx) => {
              const isLinkActive = pathname === link.path;
              return (
                <Link
                  key={idx}
                  href={link.path}
                  className={`text-sm font-semibold transition-colors ${
                    isLinkActive
                      ? theme.primaryText
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400 transition-colors"
              title="Toggle Theme"
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Keranjang AI Button */}
            <StorefrontNavbarCartButton store={store} />
          </div>
        </div>
      </div>
    </header>
  );
}

function StorefrontNavbarCartButton({ store }) {
  const { theme } = useStorefrontTheme();
  const { cartCount, setCartOpen } = useStorefrontCart();

  return (
    <button
      onClick={() => setCartOpen(true)}
      className="flex items-center gap-2 bg-slate-800 dark:bg-slate-100 text-slate-100 dark:text-slate-900 px-5 py-2.5 rounded-full hover:opacity-85 transition-all relative text-xs font-semibold cursor-pointer"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${theme.primaryText}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      <span className="hidden sm:inline">Keranjang AI</span>
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-600 text-white text-[9px] font-bold items-center justify-center border border-white dark:border-slate-950">
            {cartCount}
          </span>
        </span>
      )}
    </button>
  );
}
