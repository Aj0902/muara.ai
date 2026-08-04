'use client';

import { useState, useEffect, createContext, useContext } from 'react';

const ThemeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {},
  theme: {}
});

export const useStorefrontTheme = () => useContext(ThemeContext);

export default function StorefrontThemeWrapper({ children, category }) {
  const [darkMode, setDarkMode] = useState(false);

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark';
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  // Determine colors based on category
  const themeColors = {
    kuliner: {
      primary: 'bg-orange-700',
      primaryHover: 'hover:bg-orange-600',
      primaryText: 'text-orange-700',
      primaryTextHover: 'hover:text-orange-600',
      primaryBorder: 'border-orange-200',
      primaryBgLight: 'bg-orange-50/80',
      accentColor: 'orange',
      textAccent: 'text-orange-600'
    },
    fashion: {
      primary: 'bg-rose-700',
      primaryHover: 'hover:bg-rose-600',
      primaryText: 'text-rose-700',
      primaryTextHover: 'hover:text-rose-600',
      primaryBorder: 'border-rose-200',
      primaryBgLight: 'bg-rose-50/80',
      accentColor: 'rose',
      textAccent: 'text-rose-600'
    },
    kriya: {
      primary: 'bg-emerald-700',
      primaryHover: 'hover:bg-emerald-600',
      primaryText: 'text-emerald-700',
      primaryTextHover: 'hover:text-emerald-600',
      primaryBorder: 'border-emerald-200',
      primaryBgLight: 'bg-emerald-50/80',
      accentColor: 'emerald',
      textAccent: 'text-emerald-600'
    }
  };

  const currentTheme = themeColors[category] || themeColors.kuliner;

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, theme: currentTheme }}>
      <div className={darkMode ? 'dark' : ''}>
        <div className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen transition-colors duration-300">
          {children}
        </div>
      </div>
    </ThemeContext.Provider>
  );
}
