'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);

    // Listen for storage changes (when settings are updated in another tab)
    const handleStorageChange = () => {
      const newTheme = (localStorage.getItem('theme') as Theme) || 'light';
      setTheme(newTheme);
      applyTheme(newTheme);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const html = document.documentElement;
    const body = document.body;

    // Clear all inline styles first
    html.style.cssText = '';
    body.style.cssText = '';
    html.className = '';

    if (newTheme === 'dark') {
      html.classList.add('dark', 'scroll-smooth');
      html.style.backgroundColor = '#0f172a';
      html.style.color = '#ffffff';
      body.style.backgroundColor = '#0f172a';
      body.style.color = '#ffffff';
      body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    } else if (newTheme === 'light') {
      html.classList.add('scroll-smooth');
      html.style.backgroundColor = '#ffffff';
      html.style.color = '#000000';
      body.style.backgroundColor = '#ffffff';
      body.style.color = '#000000';
      body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        html.classList.add('dark', 'scroll-smooth');
        html.style.backgroundColor = '#0f172a';
        html.style.color = '#ffffff';
        body.style.backgroundColor = '#0f172a';
        body.style.color = '#ffffff';
      } else {
        html.classList.add('scroll-smooth');
        html.style.backgroundColor = '#ffffff';
        html.style.color = '#000000';
        body.style.backgroundColor = '#ffffff';
        body.style.color = '#000000';
      }
    }
  };

  if (!mounted) return <>{children}</>;

  return <>{children}</>;
}
