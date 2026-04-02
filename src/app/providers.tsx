'use client';

import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';

// Module-level mount guard — persists across navigations
let hasMounted = false;

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(hasMounted);

  useEffect(() => {
    if (!hasMounted) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          hasMounted = true;
          setMounted(true);
        });
      });
    }
  }, []);

  if (!mounted) {
    return <AppLoader />;
  }

  return <ThemeProvider>{children}</ThemeProvider>;
}

function AppLoader() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#0A0A0A',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
    }}>
      <img src="/ivglogo.png" alt="IVG Loading" style={{ height: 48, width: 'auto' }} />
      <div style={{
        width: 36,
        height: 36,
        border: '3px solid rgba(255,255,255,0.12)',
        borderTopColor: '#E31837',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
