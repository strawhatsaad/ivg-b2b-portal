'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextProps {
  theme: Theme;
  toggleTheme: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark'); // Default to dark since we just built it

  // Mount logic: check local storage
  useEffect(() => {
    const stored = localStorage.getItem('ivg_theme') as Theme;
    if (stored) {
      setTheme(stored);
      document.documentElement.setAttribute('data-theme', stored);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    // We capture the click coordinates for the circle expansion
    const x = e.clientX;
    const y = e.clientY;
    
    // Pass coordinates to CSS variables on HTML root
    document.documentElement.style.setProperty('--click-x', `${x}px`);
    document.documentElement.style.setProperty('--click-y', `${y}px`);

    const newTheme = theme === 'light' ? 'dark' : 'light';

    // Check if View Transitions API is supported
    if (!document.startViewTransition) {
      // Fallback for older browsers: instant theme switch
      setTheme(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('ivg_theme', newTheme);
      return;
    }

    // Advanced Transition API Execution
    const transition = document.startViewTransition(() => {
      // This callback runs BEFORE the new frame is painted
      setTheme(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('ivg_theme', newTheme);
    });

    transition.ready.then(() => {
      // Explicitly tell the CSS whether we are expanding or collapsing darkness
      document.documentElement.setAttribute('data-transition-direction', newTheme === 'dark' ? 'expand' : 'collapse');
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
