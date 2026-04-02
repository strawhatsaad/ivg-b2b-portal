'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';

export function PortalShell({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
