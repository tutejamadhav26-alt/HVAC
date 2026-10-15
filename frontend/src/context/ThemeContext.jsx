import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Check localStorage or default to 'light' as requested by user
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('hvac_theme');
    return saved ? saved : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      document.body.style.backgroundColor = '#f4f4f6';
      document.body.style.color = '#09090b';
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      document.body.style.backgroundColor = '#0a0a0a';
      document.body.style.color = '#f4f4f5';
    }
    localStorage.setItem('hvac_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isLight: theme === 'light' }}>
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
