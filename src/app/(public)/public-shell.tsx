'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

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

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Header publicNav={PUBLIC_NAV} authNav={AUTH_NAV} />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </>
  );
}
