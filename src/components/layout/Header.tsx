'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/lib/auth-actions';
import Image from 'next/image';
import { ThemeToggle } from '@/components/ThemeToggle';

interface NavItem { label: string; href: string; children?: NavItem[]; }
interface HeaderProps { publicNav: NavItem[]; authNav: NavItem[]; }

export function Header({ publicNav, authNav }: HeaderProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = router.pathname;
  const [annDismissed, setAnnDismissed] = useState(true); // default hidden until mounted
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Check dismissal state from sessionStorage after mount
    const dismissed = sessionStorage.getItem('ivg_ann_v1') === 'dismissed';
    setAnnDismissed(dismissed);
  }, []);

  const nav = user ? authNav : publicNav;

  const dismissAnn = () => {
    setAnnDismissed(true);
    sessionStorage.setItem('ivg_ann_v1', 'dismissed');
  };

  const isAuth = !loading && user;
  const isNoTrustBar = ['/sign-in', '/register', '/new-customer-application'].some(p => pathname?.startsWith(p));

  return (
    <>
      {/* Announcement Bar */}
      {!annDismissed && (
        <div className="ivg-ann-bar" role="status">
          Welcome to the IVG B2B Portal — Serving Over 100 Countries
          <button className="ivg-ann-bar__dismiss" onClick={dismissAnn} aria-label="Dismiss">✕</button>
        </div>
      )}

      {/* Main Header */}
      <header className="ivg-header" role="banner">
        <div className="ivg-container ivg-header__inner">
          <Link href="/" className="ivg-header__logo" aria-label="IVG B2B Portal — Home">
            <Image src="/ivglogo.png" alt="IVG Premium E-Liquids" width={110} height={40} priority />
          </Link>

          {/* Desktop Nav */}
          <nav aria-label="Primary navigation" className="ivg-header__nav">
            <ul className="ivg-nav" role="list">
              {nav.map(item => (
                <li key={item.href} className={`ivg-nav__item${pathname === item.href ? ' ivg-nav__item--active' : ''}`}>
                  <Link href={item.href} className="ivg-nav__link"
                    aria-current={pathname === item.href ? 'page' : undefined}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Actions */}
          <div className="ivg-header__actions">
            <ThemeToggle />
            {loading ? (
              <div style={{ width: 120, height: 36 }} />
            ) : isAuth ? (
              <>
                <span className="ivg-header__greeting">
                  Hello, {user.firstName || user.userName}
                </span>
                <Link href="/my-account" className="ivg-btn ivg-btn--secondary ivg-btn--sm">
                  My Account
                </Link>
                <button onClick={logout} className="ivg-header__signout">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/register" className="ivg-header__apply">Apply to Trade</Link>
                <Link href="/sign-in" className="ivg-btn ivg-btn--primary ivg-btn--sm">
                  Sign In
                </Link>
              </>
            )}

            <button
              className="ivg-mobile-toggle"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-drawer"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* Trust Bar */}
      {!isNoTrustBar && (
        <div className="ivg-trust-bar" aria-label="Trust highlights">
          <div className="ivg-container ivg-trust-bar__grid">
            {TRUST_ITEMS.map(t => (
              <div className="ivg-trust-item" key={t.label}>
                <t.Icon />
                <div><strong>{t.label}</strong><span>{t.sub}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileOpen && <div className="ivg-mobile-overlay" onClick={() => setMobileOpen(false)} aria-hidden="true" />}
      <div
        id="mobile-drawer"
        className={`ivg-mobile-drawer${mobileOpen ? ' ivg-mobile-drawer--open' : ''}`}
        aria-hidden={!mobileOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <button className="ivg-mobile-drawer__close" onClick={() => setMobileOpen(false)} aria-label="Close menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <nav aria-label="Mobile navigation">
          <ul role="list">
            {nav.map(item => (
              <li key={item.href}>
                <Link href={item.href} className="ivg-mobile-nav-link" onClick={() => setMobileOpen(false)}
                  aria-current={pathname === item.href ? 'page' : undefined}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ivg-mobile-actions">
          {isAuth ? (
            <>
              <Link href="/my-account" className="ivg-btn ivg-btn--primary ivg-btn--block" onClick={() => setMobileOpen(false)}>My Account</Link>
              <button onClick={logout} className="ivg-btn ivg-btn--secondary ivg-btn--block">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="ivg-btn ivg-btn--primary ivg-btn--block">Sign In</Link>
              <Link href="/register" className="ivg-btn ivg-btn--secondary ivg-btn--block" onClick={() => setMobileOpen(false)}>Apply to Trade</Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// Trust bar icons inline (no external icon deps)
const TRUST_ITEMS = [
  { label: 'Rated 4.7/5', sub: '169,000+ Reviews', Icon: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="#E31837" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> },
  { label: '100+ Countries', sub: 'Global Distribution', Icon: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E31837" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
  { label: '50+ Awards', sub: 'Multi-Award Winning', Icon: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E31837" strokeWidth="1.5" aria-hidden="true"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg> },
  { label: 'UK Based Support', sub: 'Preston, Lancashire', Icon: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E31837" strokeWidth="1.5" aria-hidden="true"><path d="M21 15c0 1.1-.9 2-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"/></svg> },
];
