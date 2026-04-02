export interface PowerPagesUser {
  userName: string;        // email / UPN
  firstName: string;
  lastName: string;
  contactId?: string;      // Dataverse contact GUID
  accountId?: string;      // Parent account GUID (if set)
  roles?: string[];        // Web roles assigned
}

export interface PowerPagesPortal {
  User: PowerPagesUser;
  tenant: string;          // Azure AD tenant ID
}

declare global {
  interface Window {
    Microsoft?: {
      Dynamic365?: {
        Portal?: PowerPagesPortal;
      };
    };
  }
}

/**
 * Returns the current Power Pages user, or null if not authenticated.
 * Must only be called client-side.
 */
export function getPortalUser(): PowerPagesUser | null {
  if (typeof window === 'undefined') return null;
  const user = window?.Microsoft?.Dynamic365?.Portal?.User;
  if (!user || !user.userName || user.userName === '') return null;
  return user;
}

export function isAuthenticated(): boolean {
  return getPortalUser() !== null;
}

export function getPortalTenant(): string {
  if (typeof window === 'undefined') return '';
  return window?.Microsoft?.Dynamic365?.Portal?.tenant ?? '';
}
