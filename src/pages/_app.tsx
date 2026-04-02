import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Load our global stylesheets
import '@/styles/globals.css';
import '@/styles/home.css';
import '@/styles/dashboard.css';
import '@/styles/portal.css';

// NAV items for public pages
const PUBLIC_NAV = [
  { label: 'Home', href: '/' },
  { label: 'About IVG', href: '/about' },
  { label: 'Contact', href: '/contact' },
];
const AUTH_NAV = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Place Order', href: '/place-order' },
  { label: 'My Orders', href: '/my-orders' },
  { label: 'Credit & Billing', href: '/credit-billing' },
  { label: 'Support', href: '/support' },
];

// Routes that use the portal sidebar layout
const PORTAL_ROUTES = [
  '/dashboard',
  '/place-order',
  '/my-orders',
  '/credit-billing',
  '/support',
  '/my-account',
  '/order-confirmation',
];

// Module-level mount guard — persists across route changes
let hasMounted = false;

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(hasMounted);
  const router = useRouter();
  const pathname = router.pathname;

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

  // Determine layout based on route
  const isPortalRoute = PORTAL_ROUTES.some(r => pathname.startsWith(r));

  return (
    <>
      <Head>
        <title>IVG B2B Portal</title>
      </Head>
      <ThemeProvider>
        {isPortalRoute ? (
          <DashboardLayout>
            <Component {...pageProps} />
          </DashboardLayout>
        ) : (
          <>
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            <Header publicNav={PUBLIC_NAV} authNav={AUTH_NAV} />
            <main id="main-content" tabIndex={-1}>
              <Component {...pageProps} />
            </main>
            <Footer />
          </>
        )}
      </ThemeProvider>
    </>
  );
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
      <img
        src="/ivglogo.png"
        alt="IVG Loading"
        style={{ height: 48, width: 'auto' }}
      />
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
