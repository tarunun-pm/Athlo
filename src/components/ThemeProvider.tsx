'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type ThemeId =
  | 'midnight'
  | 'emerald-night'
  | 'violet-dusk'
  | 'clinical-white'
  | 'sunrise'
  | 'golden'
  | 'mint'
  | 'rose';

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  type: 'dark' | 'light';
  swatch: string; // CSS color for the preview dot
}

export const THEMES: ThemeMeta[] = [
  { id: 'midnight',        name: 'Midnight',        type: 'dark',  swatch: '#0066FF' },
  { id: 'emerald-night',   name: 'Emerald Night',   type: 'dark',  swatch: '#10B981' },
  { id: 'violet-dusk',     name: 'Violet Dusk',     type: 'dark',  swatch: '#8B5CF6' },
  { id: 'clinical-white',  name: 'Clinical White',  type: 'light', swatch: '#2563EB' },
  { id: 'sunrise',         name: 'Sunrise',         type: 'light', swatch: '#EA580C' },
  { id: 'golden',          name: 'Golden',          type: 'light', swatch: '#D97706' },
  { id: 'mint',            name: 'Mint',            type: 'light', swatch: '#0D9488' },
  { id: 'rose',            name: 'Rose',            type: 'light', swatch: '#E11D48' },
];

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'midnight',
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>('midnight');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('athlo-theme') as ThemeId | null;
    if (stored && THEMES.find(t => t.id === stored)) {
      setThemeState(stored);
      applyTheme(stored);
    }
    setMounted(true);
  }, []);

  const applyTheme = (id: ThemeId) => {
    const html = document.documentElement;
    if (id === 'midnight') {
      html.removeAttribute('data-theme');
    } else {
      html.setAttribute('data-theme', id);
    }
  };

  const setTheme = (id: ThemeId) => {
    setThemeState(id);
    applyTheme(id);
    localStorage.setItem('athlo-theme', id);
  };

  // Prevent flash of wrong theme
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
