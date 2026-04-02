'use client';

import { useState, useEffect } from 'react';
import { getPortalUser, PowerPagesUser } from '@/lib/auth';
import { restoreMockSession } from '@/lib/mock-auth';

export function useAuth() {
  const [user, setUser] = useState<PowerPagesUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to restore mock session from localStorage first
    const mockUser = restoreMockSession();
    if (mockUser) {
      setUser(mockUser);
      setLoading(false);
      return;
    }

    // Fall back to Power Pages injected user context
    const timer = setTimeout(() => {
      setUser(getPortalUser());
      setLoading(false);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return { user, loading, isAuthenticated: user !== null };
}
