import { mockLogin, mockLogout } from './mock-auth';

/**
 * Fetch the anti-forgery token required for POST login requests.
 * Power Pages exposes this at /_layout/tokenhtml
 */
export async function fetchAntiForgeryToken(): Promise<string> {
  try {
    const response = await fetch('/_layout/tokenhtml');
    if (!response.ok) throw new Error(`Token fetch failed: ${response.status}`);
    const html = await response.text();
    const valueStart = 'value="';
    const valueEnd = '" />';
    const idx = html.indexOf(valueStart);
    if (idx === -1) throw new Error('Token not found in response');
    return html.substring(idx + valueStart.length, html.indexOf(valueEnd, idx));
  } catch (err) {
    console.error('[Auth] Failed to fetch anti-forgery token:', err);
    return '';
  }
}

/**
 * Login — In demo mode, uses mock auth. In production, submits external login form.
 */
export async function login(returnUrl: string = '/'): Promise<void> {
  // Demo mode: use mock login
  mockLogin();
  window.location.href = returnUrl || '/dashboard';
  return;

  // Production Power Pages login (unreachable in demo):
  // const token = await fetchAntiForgeryToken();
  // const tenantId = getPortalTenant();
  // ... form submission
}

/**
 * Logout — clears mock session and redirects
 */
export function logout(): void {
  mockLogout();
  window.location.href = '/';
}
