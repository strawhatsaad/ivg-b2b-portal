'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/lib/auth-actions';
import { ThemeToggle } from '@/components/ThemeToggle';
import { RouteGuard } from '@/components/auth/RouteGuard';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { label: 'Place Order', href: '/place-order', icon: 'shopping_cart' },
  { label: 'My Orders', href: '/my-orders', icon: 'receipt_long' },
  { label: 'Credit & Billing', href: '/credit-billing', icon: 'account_balance_wallet' },
  { label: 'Support', href: '/support', icon: 'support_agent' },
];

const BOTTOM_ITEMS = [
  { label: 'My Account', href: '/my-account', icon: 'person' },
];

function NavIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    dashboard: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    shopping_cart: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
    receipt_long: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    account_balance_wallet: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 10h20" /><circle cx="17" cy="15" r="1" />
      </svg>
    ),
    support_agent: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    person: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
    logout: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
  };
  return <span className="sidebar-icon">{icons[name] || null}</span>;
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = router.pathname;

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <RouteGuard>
      <div className="portal-layout">
        {/* Sidebar */}
        <aside className="portal-sidebar">
          <div className="sidebar-top">
            {/* Logo */}
            <Link href="/dashboard" className="sidebar-logo">
              <div className="sidebar-logo-icon">
                <img src="/ivglogo.png" alt="IVG" style={{ height: 24, width: 'auto' }} />
              </div>
              <div className="sidebar-logo-text">
                <span className="sidebar-brand">IVG Portal</span>
                <span className="sidebar-tier">B2B Enterprise</span>
              </div>
            </Link>

            {/* Main Nav */}
            <nav className="sidebar-nav" aria-label="Portal navigation">
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link${isActive(item.href) ? ' sidebar-link--active' : ''}`}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  <NavIcon name={item.icon} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Bottom section */}
          <div className="sidebar-bottom">
            {BOTTOM_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link${isActive(item.href) ? ' sidebar-link--active' : ''}`}
              >
                <NavIcon name={item.icon} />
                <span>{item.label}</span>
              </Link>
            ))}
            <button onClick={logout} className="sidebar-link sidebar-link--logout">
              <NavIcon name="logout" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="portal-main">
          {/* Top bar */}
          <header className="portal-topbar">
            <div className="topbar-left">
              {/* Breadcrumb or search could go here */}
            </div>
            <div className="topbar-right">
              <ThemeToggle />
              <div className="topbar-user">
                <div className="topbar-avatar">
                  {user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || ''}
                </div>
                <div className="topbar-user-info">
                  <span className="topbar-user-name">{user?.firstName} {user?.lastName}</span>
                  <span className="topbar-user-email">{user?.userName}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <div className="portal-content">
            {children}
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
