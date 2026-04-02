/**
 * Mock Authentication System for Local Demo
 * Simulates Microsoft Entra ID / Power Pages auth flow
 */

import { PowerPagesUser } from './auth';

const MOCK_USER: PowerPagesUser = {
  userName: 'Saad.Anjum@devsinc.com',
  firstName: 'Saad',
  lastName: 'Anjum',
  contactId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  accountId: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
  roles: ['Authenticated Users', 'B2B Partner', 'Credit Approved'],
};

const STORAGE_KEY = 'ivg_mock_user';

/** Simulate login — stores user in localStorage and sets window globals */
export function mockLogin(): PowerPagesUser {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_USER));
  injectWindowGlobals(MOCK_USER);
  return MOCK_USER;
}

/** Simulate logout — clears storage and window globals */
export function mockLogout(): void {
  localStorage.removeItem(STORAGE_KEY);
  clearWindowGlobals();
}

/** Restore session from localStorage (called on app mount) */
export function restoreMockSession(): PowerPagesUser | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    const user = JSON.parse(stored) as PowerPagesUser;
    injectWindowGlobals(user);
    return user;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

/** Check if a mock session exists */
export function hasMockSession(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) !== null;
}

function injectWindowGlobals(user: PowerPagesUser): void {
  (window as any).Microsoft = {
    Dynamic365: {
      Portal: {
        User: user,
        tenant: '72f988bf-86f1-41af-91ab-2d7cd011db47',
      },
    },
  };
}

function clearWindowGlobals(): void {
  if ((window as any).Microsoft?.Dynamic365?.Portal) {
    delete (window as any).Microsoft;
  }
}
