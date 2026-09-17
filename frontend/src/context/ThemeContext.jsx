import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const explicit = localStorage.getItem('td_theme_explicit');
      if (explicit === 'true') {
        const saved = localStorage.getItem('td_theme');
        if (saved === 'dark' || saved === 'light') return saved;
      }
    } catch {
      // Storage unavailable, degrade gracefully
    }
    return 'dark'; // Dark by default
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('td_theme', theme);
    } catch {
      // Storage unavailable, degrade gracefully
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('td_theme_explicit', 'true');
        localStorage.setItem('td_theme', next);
      } catch {
        // Storage unavailable
      }
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
