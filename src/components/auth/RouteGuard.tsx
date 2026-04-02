'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface RouteGuardProps {
  children: React.ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/sign-in?returnUrl=' + encodeURIComponent(pathname));
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '60vh', flexDirection: 'column', gap: '16px'
      }}>
        <div className="ivg-spinner" aria-label="Loading..." role="status" />
        <p style={{ color: 'var(--ivg-secondary)', fontSize: '14px' }}>Loading your portal...</p>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
