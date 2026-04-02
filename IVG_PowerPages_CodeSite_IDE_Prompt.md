# ANTIGRAVITY IDE PROMPT — IVG Power Pages Code Site (Next.js SPA)
## Version 2.0 | April 2026 | Devsinc × IVG
## Architecture: Next.js Static Export → PAC CLI → Power Pages SPA (Code Site)

---

## 🔴 CRITICAL CONTEXT — READ EVERY WORD BEFORE WRITING A SINGLE LINE

You are building a **Next.js application** that will be exported as a static SPA and hosted **inside Microsoft's Power Pages Code Site infrastructure**. This is NOT a typical Next.js deployment. It is NOT headless. It will not be hosted on Vercel, AWS, or anywhere else. The compiled `out/` (or `dist/`) folder will be uploaded directly into a **Power Pages environment** using the PAC CLI command `pac pages upload-code-site`.

This means:
- The app runs **client-side only** (CSR). No SSR. No ISR. No SSG that uses `getServerSideProps`. No API Routes.
- Data fetching happens **100% in the browser** via the **Power Pages Web API** (`/_api/...` endpoints) — not Next.js API routes, not a separate backend, not GraphQL.
- Authentication is provided **by Power Pages itself** — not NextAuth, not Clerk, not Auth.js. The logged-in user's data is injected into `window["Microsoft"].Dynamic365.Portal.User` by the Power Pages runtime before your JS executes.
- Routing is **client-side only** via Next.js's App Router or Pages Router. A hard refresh on any sub-route always returns the root `index.html`, and the client router handles the rest.
- The **Power Pages Designer, Liquid templating, style workspace, and page workspace are all unavailable** for Code Sites. All design, styling, and logic lives entirely in your Next.js code.

**The client:** IVG (I Vape Great / Acme Vape Limited), UK's leading premium e-liquid manufacturer, serving 100+ countries. Portal is for their B2B wholesale customers and distributors.

**Design mandate:** The portal must be visually **indistinguishable** from IVG's consumer Shopify store at `ivapegreat.com`. Every color, font, spacing decision, and UI pattern must mirror it exactly.

---

## 🏗️ ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│  YOUR LOCAL MACHINE                                              │
│                                                                  │
│  Next.js App (App Router, TypeScript)                           │
│  ├── src/app/           ← App Router pages                      │
│  ├── src/components/    ← Reusable components                   │
│  ├── src/hooks/         ← Data fetching hooks (Web API)         │
│  ├── src/lib/           ← API client, auth helpers, types       │
│  ├── src/styles/        ← Global CSS                            │
│  └── powerpages.config.json  ← PAC CLI config                  │
│                                                                  │
│  next build → next export → out/ directory (static HTML/JS/CSS) │
│                                                                  │
│  pac pages upload-code-site                                      │
│    --rootPath "./"                                               │
│    --compiledPath "./out"                                        │
│    --siteName "IVG B2B Portal"                                   │
└────────────────────┬────────────────────────────────────────────┘
                     │ PAC CLI upload
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  MICROSOFT POWER PAGES (Cloud)                                   │
│                                                                  │
│  Power Pages CDN serves your static files                       │
│  Power Pages runtime injects:                                    │
│    - window["Microsoft"].Dynamic365.Portal.User (auth context)   │
│    - Anti-forgery token via /_layout/tokenhtml                   │
│  Power Pages Web API:  /_api/<table>  (Dataverse OData)         │
│  Power Pages Auth:     /Account/Login/ExternalLogin             │
│                        /Account/Login/LogOff                     │
│  Power Pages RBAC:     Table permissions + Web Roles            │
│                        enforce on /_api/ calls server-side       │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ PROJECT SETUP

### 1. `next.config.ts`

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // CRITICAL: Static export for Power Pages Code Site
  output: 'export',

  // CRITICAL: Trailing slash ensures correct routing behavior
  // when Power Pages serves the root index.html for all sub-routes
  trailingSlash: true,

  // CRITICAL: No image optimization — static export doesn't support it
  images: {
    unoptimized: true,
  },

  // Base path — leave empty unless Power Pages mounts at a sub-path
  // basePath: '',

  // No server-side features
  // No API routes will be used — all data via Power Pages Web API

  // Compiler options
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
```

### 2. `powerpages.config.json` (project root)

```json
{
  "siteName": "IVG B2B Portal",
  "defaultLandingPage": "index.html",
  "compiledPath": "./out"
}
```

### 3. `package.json` scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "export": "next build",
    "upload": "pac pages upload-code-site --rootPath ./ --compiledPath ./out --siteName \"IVG B2B Portal\"",
    "deploy": "npm run export && npm run upload",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

### 4. Required Dependencies

```json
{
  "dependencies": {
    "next": "^15.x",
    "react": "^19.x",
    "react-dom": "^19.x",
    "swr": "^2.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/react": "^19.x",
    "@types/react-dom": "^19.x",
    "eslint": "^9.x",
    "eslint-config-next": "^15.x"
  }
}
```

**No Axios. No Redux. No React Query (SWR is sufficient). No NextAuth. No Prisma. No tRPC. No server-side libraries of any kind.** Keep the bundle lean — this is running on Power Pages CDN.

---

## 🔐 AUTHENTICATION SYSTEM

### How Power Pages Auth Works in Code Sites

Power Pages injects user context into the global `window` object **before** your app's JavaScript runs. You do NOT implement authentication yourself. You consume it.

```typescript
// src/lib/auth.ts

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
```

### Login & Logout

Power Pages handles login and logout via its own endpoints. Your app just redirects to these URLs:

```typescript
// src/lib/auth-actions.ts

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
 * Programmatically submit the external login form.
 * This is the correct way to trigger login in Power Pages Code Sites.
 */
export async function login(returnUrl: string = '/'): Promise<void> {
  const token = await fetchAntiForgeryToken();
  const tenantId = getPortalTenant();

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = '/Account/Login/ExternalLogin';

  const tokenInput = document.createElement('input');
  tokenInput.name = '__RequestVerificationToken';
  tokenInput.type = 'hidden';
  tokenInput.value = token;
  form.appendChild(tokenInput);

  const providerInput = document.createElement('input');
  providerInput.name = 'provider';
  providerInput.type = 'hidden';
  providerInput.value = `https://login.windows.net/${tenantId}/`;
  form.appendChild(providerInput);

  const returnInput = document.createElement('input');
  returnInput.name = 'returnUrl';
  returnInput.type = 'hidden';
  returnInput.value = returnUrl;
  form.appendChild(returnInput);

  document.body.appendChild(form);
  form.submit();
}

/**
 * Logout — redirect to Power Pages logout endpoint
 */
export function logout(): void {
  window.location.href = '/Account/Login/LogOff?returnUrl=%2F';
}
```

### `useAuth` Hook

```typescript
// src/hooks/useAuth.ts
'use client';

import { useState, useEffect } from 'react';
import { getPortalUser, PowerPagesUser } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<PowerPagesUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Power Pages injects user context synchronously on page load.
    // A short timeout ensures the window object is fully populated.
    const timer = setTimeout(() => {
      setUser(getPortalUser());
      setLoading(false);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return { user, loading, isAuthenticated: user !== null };
}
```

### Route Guard Component

```typescript
// src/components/RouteGuard.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface RouteGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function RouteGuard({ children, redirectTo = '/' }: RouteGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Trigger Power Pages login flow
      import('@/lib/auth-actions').then(({ login }) => {
        login(window.location.pathname);
      });
    }
  }, [user, loading, redirectTo, router]);

  if (loading) {
    return <IVGPageLoader />;
  }

  if (!user) {
    return null; // Will redirect
  }

  return <>{children}</>;
}

function IVGPageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '60vh', flexDirection: 'column', gap: '16px'
    }}>
      <div className="ivg-spinner" aria-label="Loading..." role="status" />
      <p style={{ color: 'var(--ivg-grey-dark)', fontSize: '14px' }}>Loading your portal...</p>
    </div>
  );
}
```

---

## 🌐 POWER PAGES WEB API CLIENT

This is the **only** way to read/write Dataverse data from your Next.js app. No direct Dataverse SDK. No server-side calls. Everything goes through `/_api/`.

### How it works

Power Pages Web API is an OData v4 endpoint exposed at `/_api/<table-logical-name-plural>`. It enforces **table permissions and web roles** server-side — your client code cannot bypass them.

```typescript
// src/lib/api.ts

const API_BASE = '/_api';

/**
 * Fetch the anti-forgery token (reused from auth-actions.ts, cached per session)
 */
let cachedToken: string | null = null;

async function getToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  try {
    const res = await fetch('/_layout/tokenhtml');
    const html = await res.text();
    const start = html.indexOf('value="') + 7;
    const end = html.indexOf('" />', start);
    cachedToken = html.substring(start, end);
    return cachedToken;
  } catch {
    return '';
  }
}

/**
 * GET — list records with OData query options
 * @param table  Plural entity set name (e.g. 'ivg_orderdrafts')
 * @param query  OData query string (e.g. '$select=name&$filter=statecode eq 0&$orderby=createdon desc')
 */
export async function apiGet<T>(table: string, query?: string): Promise<T[]> {
  const url = query ? `${API_BASE}/${table}?${query}` : `${API_BASE}/${table}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new ApiError(res.status, await res.text(), table);
  const data = await res.json();
  return data.value as T[];
}

/**
 * GET — single record by ID
 */
export async function apiGetById<T>(table: string, id: string, select?: string): Promise<T> {
  const url = select
    ? `${API_BASE}/${table}(${id})?$select=${select}`
    : `${API_BASE}/${table}(${id})`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new ApiError(res.status, await res.text(), table);
  return await res.json() as T;
}

/**
 * POST — create a record
 * Returns the created record (with ID) if $select is provided, else just the ID header
 */
export async function apiCreate<T>(table: string, body: Partial<T>): Promise<string> {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      '__RequestVerificationToken': token,
    },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new ApiError(res.status, await res.text(), table);
  // OData returns the new record ID in the OData-EntityId response header
  const entityId = res.headers.get('OData-EntityId') ?? '';
  // Extract GUID from URL format: .../<table>(guid)
  const match = entityId.match(/\(([^)]+)\)$/);
  return match ? match[1] : entityId;
}

/**
 * PATCH — update a record
 */
export async function apiUpdate<T>(table: string, id: string, body: Partial<T>): Promise<void> {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/${table}(${id})`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      '__RequestVerificationToken': token,
    },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new ApiError(res.status, await res.text(), table);
}

/**
 * DELETE — delete a record
 */
export async function apiDelete(table: string, id: string): Promise<void> {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/${table}(${id})`, {
    method: 'DELETE',
    headers: { '__RequestVerificationToken': token },
    credentials: 'include',
  });
  if (!res.ok) throw new ApiError(res.status, await res.text(), table);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
    public table: string
  ) {
    super(`API ${status} on ${table}: ${detail}`);
    this.name = 'ApiError';
  }
}
```

### OData Query Patterns

```typescript
// Common OData patterns for IVG portal:

// Get all orders for the current account
const orders = await apiGet<OrderDraft>('ivg_orderdrafts',
  `$filter=_ivg_account_value eq '${accountId}'` +
  `&$orderby=ivg_orderdate desc` +
  `&$select=ivg_orderdraftnumber,ivg_orderdate,ivg_status,ivg_totalgross` +
  `&$top=50`
);

// Expand related records
const orderWithLines = await apiGetById<OrderDraft>('ivg_orderdrafts', orderId,
  undefined  // use URL with expand
);
// For expand, build URL manually:
const res = await fetch(
  `/_api/ivg_orderdrafts(${orderId})?$expand=ivg_orderdraftline_ivg_orderdraft_ivg_orderdraft`,
  { credentials: 'include' }
);

// Get products grouped — fetch all then group client-side
const products = await apiGet<Product>('products',
  `$filter=statecode eq 0 and ivg_portalvisible eq true` +
  `&$select=productid,name,productnumber,ivg_productline,ivg_flavour,ivg_nicstrength,price,ivg_vatrate` +
  `&$orderby=ivg_productline asc,name asc` +
  `&$top=500`
);
```

---

## 🗂️ PROJECT STRUCTURE

```
ivg-b2b-portal/
│
├── src/
│   ├── app/                          ← Next.js App Router
│   │   ├── layout.tsx                ← Root layout (renders Header + Footer)
│   │   ├── page.tsx                  ← Home / landing page (/)
│   │   ├── globals.css               ← ALL site CSS (no CSS modules for global styles)
│   │   │
│   │   ├── sign-in/
│   │   │   └── page.tsx              ← Sign in page
│   │   │
│   │   ├── register/
│   │   │   └── page.tsx              ← New customer application start
│   │   │
│   │   ├── new-customer-application/
│   │   │   └── page.tsx              ← Multi-step onboarding form
│   │   │
│   │   ├── application-submitted/
│   │   │   └── page.tsx              ← Confirmation page
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx              ← [AUTH REQUIRED] Customer dashboard
│   │   │
│   │   ├── place-order/
│   │   │   └── page.tsx              ← [AUTH REQUIRED] B2B order booking
│   │   │
│   │   ├── order-confirmation/
│   │   │   └── page.tsx              ← [AUTH REQUIRED] Post-order confirmation
│   │   │
│   │   ├── my-orders/
│   │   │   ├── page.tsx              ← [AUTH REQUIRED] Order history list
│   │   │   └── [id]/
│   │   │       └── page.tsx          ← [AUTH REQUIRED] Order detail
│   │   │
│   │   ├── credit-application/
│   │   │   └── page.tsx              ← [AUTH REQUIRED] Business credit application
│   │   │
│   │   ├── credit-billing/
│   │   │   └── page.tsx              ← [AUTH REQUIRED] Credit summary + invoice history
│   │   │
│   │   ├── support/
│   │   │   ├── page.tsx              ← [AUTH REQUIRED] Support ticket list
│   │   │   └── [id]/
│   │   │       └── page.tsx          ← [AUTH REQUIRED] Ticket detail
│   │   │
│   │   └── my-account/
│   │       └── page.tsx              ← [AUTH REQUIRED] Account profile
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx            ← Site header (announcement + nav + trust bar)
│   │   │   ├── Footer.tsx            ← Site footer
│   │   │   ├── Nav.tsx               ← Navigation component
│   │   │   └── TrustBar.tsx          ← Trust badges strip
│   │   │
│   │   ├── auth/
│   │   │   ├── RouteGuard.tsx        ← Auth protection wrapper
│   │   │   └── AuthButton.tsx        ← Login/logout button
│   │   │
│   │   ├── forms/
│   │   │   ├── CustomerApplicationForm.tsx   ← New customer multi-step form
│   │   │   ├── CreditApplicationForm.tsx     ← Business credit application
│   │   │   ├── FormStep.tsx                  ← Step wrapper
│   │   │   ├── FormProgress.tsx              ← Step indicator
│   │   │   └── AddressBlock.tsx              ← Reusable address group
│   │   │
│   │   ├── orders/
│   │   │   ├── OrderForm.tsx                 ← B2B order product table
│   │   │   ├── ProductLineTable.tsx          ← Product group + qty inputs
│   │   │   ├── OrderSummaryBar.tsx           ← Sticky totals bar
│   │   │   ├── OrderList.tsx                 ← Order history table
│   │   │   ├── OrderDetail.tsx               ← Single order view
│   │   │   └── OrderStatusStepper.tsx        ← Visual progress stepper
│   │   │
│   │   ├── dashboard/
│   │   │   ├── QuickActions.tsx
│   │   │   ├── RecentOrders.tsx
│   │   │   ├── CreditSummary.tsx
│   │   │   └── OpenTickets.tsx
│   │   │
│   │   ├── ui/
│   │   │   ├── Button.tsx                    ← IVG branded buttons
│   │   │   ├── Card.tsx                      ← IVG card component
│   │   │   ├── Badge.tsx                     ← Status badges
│   │   │   ├── Modal.tsx                     ← Modal dialog
│   │   │   ├── Table.tsx                     ← Data table
│   │   │   ├── Spinner.tsx                   ← Loading indicator
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── PageHero.tsx                  ← Section hero strip
│   │   │
│   │   └── icons/
│   │       └── IVGIcons.tsx                  ← SVG icon components
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                        ← Auth state hook
│   │   ├── useOrders.ts                      ← SWR hooks for orders
│   │   ├── useProducts.ts                    ← SWR hooks for products
│   │   ├── useAccount.ts                     ← SWR hooks for account data
│   │   └── useTickets.ts                     ← SWR hooks for support tickets
│   │
│   └── lib/
│       ├── api.ts                            ← Power Pages Web API client
│       ├── auth.ts                           ← Auth types + helpers
│       ├── auth-actions.ts                   ← Login / logout actions
│       ├── types.ts                          ← All TypeScript interfaces
│       └── utils.ts                          ← Formatters, helpers
│
├── public/
│   ├── ivg-logo.png                          ← IVG logo (black version for header)
│   ├── ivg-logo-white.png                    ← White version for footer
│   └── favicon.ico
│
├── next.config.ts
├── tsconfig.json
├── powerpages.config.json
└── package.json
```

---

## 🎨 DESIGN SYSTEM — IVG BRAND (EXACT SPECIFICATION)

### `src/app/globals.css`

This is the ONLY global CSS file. All component-level styles should use CSS Modules or inline styles that reference these variables.

```css
/* ─── Google Fonts ─── */
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

/* ─── CSS Custom Properties ─── */
:root {
  /* Brand Colors */
  --ivg-red: #E31837;
  --ivg-red-dark: #B5001E;
  --ivg-red-light: rgba(227, 24, 55, 0.08);
  --ivg-black: #0A0A0A;
  --ivg-white: #FFFFFF;
  --ivg-grey-lightest: #FAFAFA;
  --ivg-grey-light: #F5F5F5;
  --ivg-grey-mid: #CCCCCC;
  --ivg-grey-dark: #555555;
  --ivg-overlay: rgba(0, 0, 0, 0.55);

  /* Status Colors */
  --status-pending-bg: #FFF3CD;
  --status-pending-text: #856404;
  --status-approved-bg: #D1E7DD;
  --status-approved-text: #0F5132;
  --status-processing-bg: #CFE2FF;
  --status-processing-text: #084298;
  --status-shipped-bg: #D1FAE5;
  --status-shipped-text: #065F46;
  --status-rejected-bg: #F8D7DA;
  --status-rejected-text: #842029;
  --status-cancelled-bg: #E2E3E5;
  --status-cancelled-text: #41464B;

  /* Layout */
  --nav-height: 72px;
  --content-max: 1280px;
  --content-padding: 24px;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;

  /* Typography */
  --font-display: 'Barlow Condensed', sans-serif;
  --font-body: 'DM Sans', sans-serif;

  /* Border Radius */
  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-xs: 0 1px 3px rgba(0, 0, 0, 0.06);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.10);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.14);
  --shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.18);
  --shadow-red: 0 4px 16px rgba(227, 24, 55, 0.20);

  /* Transitions */
  --transition-fast: 120ms ease;
  --transition-std: 220ms ease;
  --transition-slow: 350ms ease;
}

/* ─── Reset ─── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-body);
  color: var(--ivg-black);
  background-color: var(--ivg-white);
  line-height: 1.6;
  min-height: 100dvh;
}

/* ─── Typography ─── */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  line-height: 1.1;
}

a {
  color: inherit;
  text-decoration: none;
  transition: color var(--transition-fast);
}

img, video {
  max-width: 100%;
  display: block;
}

button {
  font-family: var(--font-body);
  cursor: pointer;
}

/* ─── Layout Utilities ─── */
.ivg-container {
  max-width: var(--content-max);
  margin: 0 auto;
  padding: 0 var(--content-padding);
}

/* ─── Skip Link (Accessibility) ─── */
.skip-link {
  position: absolute;
  top: -100px;
  left: 16px;
  z-index: 9999;
  background: var(--ivg-red);
  color: var(--ivg-white);
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  transition: top var(--transition-fast);
}
.skip-link:focus {
  top: 16px;
}

/* ─── IVG Button System ─── */
.ivg-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
  transition: all var(--transition-std);
  border: 2px solid transparent;
  cursor: pointer;
  outline: none;
}
.ivg-btn:focus-visible {
  box-shadow: 0 0 0 3px rgba(227, 24, 55, 0.35);
}
.ivg-btn--primary {
  background: var(--ivg-red);
  color: var(--ivg-white);
  border-color: var(--ivg-red);
}
.ivg-btn--primary:hover {
  background: var(--ivg-red-dark);
  border-color: var(--ivg-red-dark);
}
.ivg-btn--outline {
  background: transparent;
  color: var(--ivg-red);
  border-color: var(--ivg-red);
}
.ivg-btn--outline:hover {
  background: var(--ivg-red);
  color: var(--ivg-white);
}
.ivg-btn--ghost {
  background: transparent;
  color: var(--ivg-grey-dark);
  border-color: transparent;
}
.ivg-btn--ghost:hover {
  color: var(--ivg-red);
}
.ivg-btn--sm { padding: 8px 18px; font-size: 12px; }
.ivg-btn--lg { padding: 16px 36px; font-size: 15px; }
.ivg-btn--block { width: 100%; }
.ivg-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none;
}

/* ─── Card ─── */
.ivg-card {
  background: var(--ivg-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--ivg-grey-light);
  transition: box-shadow var(--transition-std), border-color var(--transition-std);
  overflow: hidden;
}
.ivg-card--hoverable:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--ivg-red);
}
.ivg-card__body { padding: var(--space-6); }
.ivg-card__header {
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--ivg-grey-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* ─── Section Title ─── */
.ivg-section-title {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  text-transform: uppercase;
  color: var(--ivg-black);
  padding-bottom: 12px;
  border-bottom: 3px solid var(--ivg-red);
  display: inline-block;
  margin-bottom: var(--space-6);
}

/* ─── Form Styles ─── */
.ivg-form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: var(--space-5);
}
.ivg-form-group label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--ivg-grey-dark);
}
.ivg-form-group label .required {
  color: var(--ivg-red);
  margin-left: 2px;
}
.ivg-input {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid var(--ivg-grey-mid);
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--ivg-black);
  background: var(--ivg-white);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  outline: none;
  appearance: none;
}
.ivg-input:focus {
  border-color: var(--ivg-red);
  box-shadow: 0 0 0 3px rgba(227, 24, 55, 0.10);
}
.ivg-input::placeholder {
  color: var(--ivg-grey-mid);
}
.ivg-input--error {
  border-color: #DC3545;
}
.ivg-form-error {
  font-size: 12px;
  color: #DC3545;
  display: flex;
  align-items: center;
  gap: 4px;
}
.ivg-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}
.ivg-form-row--3 {
  grid-template-columns: 1fr 1fr 1fr;
}
.ivg-form-section-heading {
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ivg-red);
  padding: 10px 0;
  border-bottom: 1px solid var(--ivg-grey-light);
  margin: var(--space-6) 0 var(--space-4);
}

/* ─── Badge ─── */
.ivg-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}
.ivg-badge--pending { background: var(--status-pending-bg); color: var(--status-pending-text); }
.ivg-badge--approved, .ivg-badge--delivered { background: var(--status-approved-bg); color: var(--status-approved-text); }
.ivg-badge--processing, .ivg-badge--confirmed { background: var(--status-processing-bg); color: var(--status-processing-text); }
.ivg-badge--shipped { background: var(--status-shipped-bg); color: var(--status-shipped-text); }
.ivg-badge--rejected { background: var(--status-rejected-bg); color: var(--status-rejected-text); }
.ivg-badge--cancelled, .ivg-badge--draft { background: var(--status-cancelled-bg); color: var(--status-cancelled-text); }
.ivg-badge--submitted { background: #E0D9F5; color: #4A2D9C; }

/* ─── Table ─── */
.ivg-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.ivg-table th {
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--ivg-grey-dark);
  padding: 12px 16px;
  text-align: left;
  background: var(--ivg-grey-lightest);
  border-bottom: 2px solid var(--ivg-grey-light);
  white-space: nowrap;
}
.ivg-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--ivg-grey-light);
  color: var(--ivg-black);
  vertical-align: middle;
}
.ivg-table tbody tr:hover {
  background: rgba(227, 24, 55, 0.02);
}
.ivg-table tbody tr:last-child td {
  border-bottom: none;
}

/* ─── Spinner ─── */
.ivg-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--ivg-grey-light);
  border-top-color: var(--ivg-red);
  border-radius: 50%;
  animation: ivg-spin 0.7s linear infinite;
}
@keyframes ivg-spin {
  to { transform: rotate(360deg); }
}

/* ─── Page Hero ─── */
.ivg-page-hero {
  background: linear-gradient(135deg, var(--ivg-black) 0%, #1a1a1a 100%);
  padding: var(--space-16) 0;
  border-bottom: 3px solid var(--ivg-red);
}
.ivg-page-hero--sm {
  padding: var(--space-10) 0;
}
.ivg-page-hero h1 {
  font-size: clamp(2rem, 5vw, 3.5rem);
  color: var(--ivg-white);
  margin-bottom: var(--space-3);
}
.ivg-page-hero p {
  color: rgba(255, 255, 255, 0.65);
  font-size: 16px;
  max-width: 560px;
}

/* ─── Announcement Bar ─── */
.ivg-ann-bar {
  background: var(--ivg-black);
  color: var(--ivg-white);
  padding: 10px var(--content-padding);
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  position: relative;
}
.ivg-ann-bar a {
  color: var(--ivg-red);
  font-weight: 700;
  text-decoration: underline;
}
.ivg-ann-bar__dismiss {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255,255,255,0.6);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  padding: 4px;
  transition: color var(--transition-fast);
}
.ivg-ann-bar__dismiss:hover { color: var(--ivg-white); }

/* ─── Header ─── */
.ivg-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: var(--ivg-white);
  border-bottom: 1px solid var(--ivg-grey-light);
  box-shadow: var(--shadow-xs);
}
.ivg-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--nav-height);
  gap: var(--space-6);
}
.ivg-header__logo img {
  height: 40px;
  width: auto;
}
.ivg-header__actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.ivg-header__greeting {
  font-size: 13px;
  font-weight: 500;
  color: var(--ivg-grey-dark);
}
.ivg-header__apply {
  font-size: 13px;
  font-weight: 500;
  color: var(--ivg-grey-dark);
}
.ivg-header__apply:hover { color: var(--ivg-red); }
.ivg-header__signout {
  font-size: 13px;
  color: var(--ivg-grey-dark);
}
.ivg-header__signout:hover { color: var(--ivg-red); }

/* ─── Navigation ─── */
.ivg-nav {
  display: flex;
  list-style: none;
  gap: var(--space-1);
  flex: 1;
  justify-content: center;
}
.ivg-nav__item { position: relative; }
.ivg-nav__link {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  color: var(--ivg-black);
  background: none;
  border: none;
  cursor: pointer;
  transition: color var(--transition-fast), background var(--transition-fast);
  white-space: nowrap;
  text-decoration: none;
}
.ivg-nav__link:hover,
.ivg-nav__item--active .ivg-nav__link {
  color: var(--ivg-red);
  background: var(--ivg-red-light);
}
.ivg-nav__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: var(--ivg-white);
  border: 1px solid var(--ivg-grey-mid);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  list-style: none;
  min-width: 200px;
  padding: 8px 0;
  z-index: 100;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-6px);
  transition: opacity var(--transition-std), visibility var(--transition-std), transform var(--transition-std);
}
.ivg-nav__item:hover .ivg-nav__dropdown,
.ivg-nav__item:focus-within .ivg-nav__dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}
.ivg-nav__dropdown-item {
  display: block;
  padding: 10px 18px;
  font-size: 14px;
  color: var(--ivg-black);
  transition: background var(--transition-fast), color var(--transition-fast);
}
.ivg-nav__dropdown-item:hover {
  background: var(--ivg-grey-lightest);
  color: var(--ivg-red);
}

/* ─── Trust Bar ─── */
.ivg-trust-bar {
  background: var(--ivg-grey-lightest);
  border-bottom: 1px solid var(--ivg-grey-light);
  padding: 12px 0;
}
.ivg-trust-bar__grid {
  display: flex;
  justify-content: center;
  gap: 48px;
  flex-wrap: wrap;
}
.ivg-trust-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ivg-trust-item strong {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--ivg-black);
}
.ivg-trust-item span {
  display: block;
  font-size: 12px;
  color: var(--ivg-grey-dark);
}

/* ─── Footer ─── */
.ivg-footer {
  background: var(--ivg-black);
  color: var(--ivg-white);
  margin-top: var(--space-20);
}
.ivg-footer__top {
  padding: 60px 0 48px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.ivg-footer__grid {
  display: grid;
  grid-template-columns: 260px repeat(3, 1fr);
  gap: 48px;
}
.ivg-footer__logo { filter: brightness(0) invert(1); margin-bottom: 14px; height: 36px; width: auto; }
.ivg-footer__tagline { font-size: 13px; color: rgba(255,255,255,0.45); line-height: 1.6; margin-bottom: 20px; }
.ivg-footer__social { display: flex; gap: 10px; }
.ivg-footer__social-link {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.65);
  transition: all var(--transition-std);
}
.ivg-footer__social-link:hover { background: var(--ivg-red); border-color: var(--ivg-red); color: var(--ivg-white); }
.ivg-footer__col-title {
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.35);
  margin-bottom: 16px;
}
.ivg-footer__links { list-style: none; display: flex; flex-direction: column; gap: 10px; }
.ivg-footer__link { font-size: 14px; color: rgba(255,255,255,0.7); transition: all var(--transition-fast); }
.ivg-footer__link:hover { color: var(--ivg-red); padding-left: 4px; }
.ivg-footer__bottom { padding: 24px 0; text-align: center; }
.ivg-footer__address { font-size: 12px; color: rgba(255,255,255,0.35); margin-bottom: 8px; }
.ivg-footer__warning { font-size: 11px; color: rgba(255,255,255,0.25); max-width: 900px; margin: 0 auto 8px; }
.ivg-footer__copyright { font-size: 12px; color: rgba(255,255,255,0.25); }

/* ─── Mobile ─── */
.ivg-mobile-toggle {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 40px; height: 40px;
  background: none; border: none;
  cursor: pointer; padding: 6px;
  border-radius: var(--radius-sm);
}
.ivg-mobile-toggle span {
  display: block; height: 2px;
  background: var(--ivg-black);
  border-radius: 2px;
  transition: all var(--transition-std);
}
.ivg-mobile-overlay {
  display: none;
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 998;
  backdrop-filter: blur(2px);
}
.ivg-mobile-drawer {
  position: fixed;
  top: 0; left: 0; bottom: 0;
  width: min(320px, 85vw);
  background: var(--ivg-white);
  z-index: 999;
  transform: translateX(-100%);
  transition: transform var(--transition-slow);
  padding: 80px var(--space-6) var(--space-6);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.ivg-mobile-drawer--open {
  transform: translateX(0);
}
.ivg-mobile-drawer__close {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  background: none; border: none;
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--ivg-black);
  border-radius: var(--radius-sm);
}
.ivg-mobile-drawer__close:hover { background: var(--ivg-grey-light); }
.ivg-mobile-nav-link {
  display: block;
  padding: 16px 0;
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--ivg-black);
  border-bottom: 1px solid var(--ivg-grey-light);
}
.ivg-mobile-nav-link:hover { color: var(--ivg-red); }
.ivg-mobile-actions { margin-top: var(--space-8); display: flex; flex-direction: column; gap: var(--space-3); }

/* ─── Order Form ─── */
.ivg-product-group { margin-bottom: var(--space-8); }
.ivg-product-group-title {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--ivg-black);
  padding: 12px 16px;
  background: var(--ivg-grey-lightest);
  border-left: 4px solid var(--ivg-red);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  margin-bottom: var(--space-3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;
}
.ivg-qty-input {
  width: 80px;
  padding: 8px 10px;
  text-align: center;
  border: 1.5px solid var(--ivg-grey-mid);
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  outline: none;
  transition: border-color var(--transition-fast);
}
.ivg-qty-input:focus { border-color: var(--ivg-red); }
.ivg-qty-input:not([value="0"]):not(:placeholder-shown) { border-color: var(--ivg-red); background: var(--ivg-red-light); }

/* ─── Order Summary Sticky Bar ─── */
.ivg-order-summary {
  position: sticky;
  bottom: 0;
  z-index: 50;
  background: var(--ivg-black);
  color: var(--ivg-white);
  padding: 16px 0;
  box-shadow: 0 -4px 24px rgba(0,0,0,0.2);
}
.ivg-order-summary__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
  flex-wrap: wrap;
}
.ivg-order-summary__totals {
  display: flex;
  gap: var(--space-6);
  flex-wrap: wrap;
}
.ivg-order-summary__item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ivg-order-summary__item label { font-size: 11px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.06em; }
.ivg-order-summary__item strong { font-size: 18px; font-family: var(--font-display); font-weight: 700; }
.ivg-order-summary__gross { color: var(--ivg-red); font-size: 22px !important; }
.ivg-order-summary__actions { display: flex; gap: var(--space-3); }

/* ─── Status Stepper ─── */
.ivg-stepper { display: flex; align-items: center; gap: 0; margin: var(--space-6) 0; }
.ivg-stepper__step { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; }
.ivg-stepper__dot {
  width: 28px; height: 28px;
  border-radius: 50%;
  border: 2px solid var(--ivg-grey-mid);
  background: var(--ivg-white);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700;
  color: var(--ivg-grey-mid);
  transition: all var(--transition-std);
  position: relative; z-index: 1;
}
.ivg-stepper__step--completed .ivg-stepper__dot { background: #0F5132; border-color: #0F5132; color: var(--ivg-white); }
.ivg-stepper__step--active .ivg-stepper__dot { background: var(--ivg-red); border-color: var(--ivg-red); color: var(--ivg-white); box-shadow: var(--shadow-red); }
.ivg-stepper__label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ivg-grey-dark); text-align: center; }
.ivg-stepper__step--active .ivg-stepper__label { color: var(--ivg-red); }
.ivg-stepper__connector { flex: 1; height: 2px; background: var(--ivg-grey-light); margin: 0 -2px; margin-bottom: 24px; }
.ivg-stepper__step--completed ~ .ivg-stepper__connector { background: #0F5132; }

/* ─── Form Progress ─── */
.ivg-form-progress { display: flex; align-items: center; margin-bottom: var(--space-8); }
.ivg-progress-step { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; }
.ivg-progress-number {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--ivg-grey-light);
  border: 2px solid var(--ivg-grey-mid);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700;
  color: var(--ivg-grey-dark);
  transition: all var(--transition-std);
}
.ivg-progress-step--active .ivg-progress-number { background: var(--ivg-red); border-color: var(--ivg-red); color: var(--ivg-white); }
.ivg-progress-step--done .ivg-progress-number { background: #0F5132; border-color: #0F5132; color: var(--ivg-white); }
.ivg-progress-label { font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--ivg-grey-dark); }
.ivg-progress-step--active .ivg-progress-label { color: var(--ivg-red); }
.ivg-progress-connector { flex: 1; height: 2px; background: var(--ivg-grey-light); margin-bottom: 24px; }

/* ─── Dashboard ─── */
.ivg-dashboard-hero {
  background: linear-gradient(135deg, var(--ivg-black) 0%, #1a1a1a 60%, #2a0008 100%);
  padding: var(--space-10) 0;
  border-bottom: 3px solid var(--ivg-red);
}
.ivg-dashboard-hero h1 { color: var(--ivg-white); font-size: clamp(1.8rem, 4vw, 2.8rem); }
.ivg-dashboard-hero p { color: rgba(255,255,255,0.55); margin-top: var(--space-2); }
.ivg-dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
  padding: var(--space-8) var(--content-padding);
}
.ivg-quick-actions { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-3); }
.ivg-quick-action {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: var(--space-3);
  padding: var(--space-6);
  background: var(--ivg-white);
  border-radius: var(--radius-md);
  border: 1px solid var(--ivg-grey-light);
  box-shadow: var(--shadow-xs);
  text-decoration: none; color: var(--ivg-black);
  transition: all var(--transition-std);
  text-align: center;
}
.ivg-quick-action:hover { border-color: var(--ivg-red); box-shadow: var(--shadow-red); color: var(--ivg-red); transform: translateY(-2px); }
.ivg-quick-action__icon { font-size: 28px; }
.ivg-quick-action__label { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }

/* ─── Credit Bar ─── */
.ivg-credit-bar { height: 8px; background: var(--ivg-grey-light); border-radius: var(--radius-full); overflow: hidden; margin-top: var(--space-3); }
.ivg-credit-bar__fill { height: 100%; background: var(--ivg-red); border-radius: var(--radius-full); transition: width 0.5s ease; }

/* ─── Responsive ─── */
@media (max-width: 1024px) {
  .ivg-footer__grid { grid-template-columns: 1fr 1fr; }
  .ivg-dashboard-grid { grid-template-columns: 1fr; }
  .ivg-quick-actions { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) {
  .ivg-header__nav { display: none; }
  .ivg-mobile-toggle { display: flex; }
  .ivg-trust-bar__grid { gap: 24px; }
  .ivg-form-row, .ivg-form-row--3 { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .ivg-footer__grid { grid-template-columns: 1fr; }
  .ivg-order-summary__inner { flex-direction: column; align-items: stretch; }
  .ivg-order-summary__actions { flex-direction: column; }
  :root { --content-padding: 16px; }
}
```

---

## 🧩 KEY COMPONENT IMPLEMENTATIONS

### `src/app/layout.tsx` (Root Layout)

```typescript
import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: { template: '%s — IVG B2B Portal', default: 'IVG B2B Portal' },
  description: 'IVG Premium E-Liquids — B2B Customer Portal for wholesale orders and account management.',
  robots: 'noindex, nofollow', // B2B portal, not for public search
};

// NAV items — hardcoded here since no CMS in Code Sites
// Unauthenticated nav: only show public pages
const PUBLIC_NAV = [
  { label: 'Home', href: '/' },
  { label: 'About IVG', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

// Authenticated nav: full portal navigation
const AUTH_NAV = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Place Order', href: '/place-order' },
  { label: 'My Orders', href: '/my-orders' },
  { label: 'Credit & Billing', href: '/credit-billing' },
  { label: 'Support', href: '/support' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap" rel="stylesheet" />
      </head>
      <body>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <Header publicNav={PUBLIC_NAV} authNav={AUTH_NAV} />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
```

### `src/components/layout/Header.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { login, logout } from '@/lib/auth-actions';
import Image from 'next/image';

interface NavItem { label: string; href: string; children?: NavItem[]; }
interface HeaderProps { publicNav: NavItem[]; authNav: NavItem[]; }

export function Header({ publicNav, authNav }: HeaderProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
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
            <Image src="/ivg-logo.png" alt="IVG Premium E-Liquids" width={110} height={40} priority />
          </Link>

          {/* Desktop Nav */}
          <nav aria-label="Primary navigation">
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
            {loading ? (
              <div style={{ width: 120, height: 36 }} />
            ) : isAuth ? (
              <>
                <span className="ivg-header__greeting">
                  Hello, {user.firstName || user.userName}
                </span>
                <Link href="/my-account" className="ivg-btn ivg-btn--outline ivg-btn--sm">
                  My Account
                </Link>
                <button onClick={logout} className="ivg-header__signout">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/register" className="ivg-header__apply">Apply to Trade</Link>
                <button onClick={() => login(pathname || '/')} className="ivg-btn ivg-btn--primary ivg-btn--sm">
                  Sign In
                </button>
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
              <button onClick={logout} className="ivg-btn ivg-btn--outline ivg-btn--block">Sign Out</button>
            </>
          ) : (
            <>
              <button onClick={() => login(pathname || '/')} className="ivg-btn ivg-btn--primary ivg-btn--block">Sign In</button>
              <Link href="/register" className="ivg-btn ivg-btn--outline ivg-btn--block" onClick={() => setMobileOpen(false)}>Apply to Trade</Link>
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
```

---

## 📊 DATA HOOKS (SWR)

```typescript
// src/hooks/useOrders.ts
'use client';
import useSWR from 'swr';
import { apiGet } from '@/lib/api';
import { OrderDraft } from '@/lib/types';
import { useAuth } from './useAuth';

export function useOrders() {
  const { user } = useAuth();
  const accountId = user?.accountId;

  const { data, error, isLoading, mutate } = useSWR(
    accountId ? ['orders', accountId] : null,
    () => apiGet<OrderDraft>(
      'ivg_orderdrafts',
      `$filter=_ivg_account_value eq '${accountId}'` +
      `&$orderby=ivg_orderdate desc&$top=50` +
      `&$select=ivg_orderdraftid,ivg_orderdraftnumber,ivg_orderdate,ivg_status,ivg_totalgross,ivg_ponumber`
    )
  );

  return { orders: data ?? [], loading: isLoading, error, refresh: mutate };
}

export function useOrder(id: string | null) {
  const { data, error, isLoading } = useSWR(
    id ? ['order', id] : null,
    () => apiGetById<OrderDraft>('ivg_orderdrafts', id!)
  );
  return { order: data, loading: isLoading, error };
}

// src/hooks/useProducts.ts
export function useProducts() {
  const { data, error, isLoading } = useSWR(
    'products',
    () => apiGet<Product>(
      'products',
      `$filter=statecode eq 0 and ivg_portalvisible eq true` +
      `&$orderby=ivg_productline asc,name asc&$top=500` +
      `&$select=productid,name,productnumber,ivg_productline,ivg_flavour,ivg_nicstrength,price,ivg_vatrate`
    ),
    { revalidateOnFocus: false } // products don't change often
  );

  // Group by product line client-side
  const grouped = (data ?? []).reduce<Record<string, Product[]>>((acc, p) => {
    const line = p.ivg_productline ?? 'Other';
    if (!acc[line]) acc[line] = [];
    acc[line].push(p);
    return acc;
  }, {});

  return { products: data ?? [], grouped, loading: isLoading, error };
}
```

---

## 📁 TYPESCRIPT TYPES

```typescript
// src/lib/types.ts

export interface OrderDraft {
  ivg_orderdraftid: string;
  ivg_orderdraftnumber: string;
  ivg_orderdate: string;
  ivg_status: OrderStatus;
  ivg_totalgross?: number;
  ivg_totalnetamount?: number;
  ivg_vatamount?: number;
  ivg_ponumber?: string;
  ivg_customernotes?: string;
  _ivg_account_value?: string;
  _ivg_contact_value?: string;
  ivg_deliverydate?: string;
}

export type OrderStatus =
  | 'Draft' | 'Submitted' | 'Confirmed'
  | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderDraftLine {
  ivg_orderdraftlineid: string;
  ivg_productname: string;
  ivg_quantity: number;
  ivg_unitprice: number;
  ivg_netamount: number;
  ivg_vatpercent: number;
  ivg_vatamount: number;
  ivg_grossamount: number;
  _ivg_product_value?: string;
  _ivg_orderdraft_value?: string;
}

export interface Product {
  productid: string;
  name: string;
  productnumber: string;
  ivg_productline?: string;
  ivg_flavour?: string;
  ivg_nicstrength?: string;
  price?: number;
  ivg_vatrate?: number;
  ivg_portalvisible?: boolean;
}

export interface Account {
  accountid: string;
  name: string;
  ivg_customertier?: CustomerTier;
  ivg_creditlimit?: number;
  ivg_creditavailable?: number;
  ivg_customertype?: string;
}

export type CustomerTier = 'Platinum' | 'Gold' | 'Silver' | 'Bronze';

export interface CustomerApplication {
  ivg_customerapplicationid?: string;
  ivg_companyname: string;
  ivg_email: string;
  ivg_contactnumber1: string;
  ivg_customergroup: number; // OptionSet value
  ivg_directoryname: string;
  ivg_vatnumber?: string;
  ivg_companieshouseno?: string;
  ivg_companystreet: string;
  ivg_companycity: string;
  ivg_companycounty?: string;
  ivg_companypostcode: string;
  ivg_deliverystreet: string;
  ivg_deliverycity: string;
  ivg_deliverucounty?: string;
  ivg_deliverypostcode: string;
  ivg_billingstreet: string;
  ivg_billingcity: string;
  ivg_billingcounty?: string;
  ivg_billingpostcode: string;
  ivg_bankaccountname: string;
  ivg_signatoryname: string;
  ivg_signedbehalfof: string;
  ivg_signatorytitle: string;
}

export interface Incident {
  incidentid: string;
  ticketnumber: string;
  title: string;
  statuscode: number;
  statecode: number;
  createdon: string;
  description?: string;
  casetypecode?: number;
}
```

---

## 🚀 LOCAL DEVELOPMENT (VITE PROXY WORKAROUND)

Since the portal is deployed to Power Pages, local development requires proxying `/_api` calls to avoid CORS issues:

```typescript
// next.config.ts addition for dev mode:
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },

  // Dev proxy — only active with `next dev`, not in the export
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/_api/:path*',
          destination: `${process.env.POWER_PAGES_URL}/_api/:path*`,
        },
        {
          source: '/_layout/:path*',
          destination: `${process.env.POWER_PAGES_URL}/_layout/:path*`,
        },
        {
          source: '/Account/:path*',
          destination: `${process.env.POWER_PAGES_URL}/Account/:path*`,
        },
      ];
    }
    return [];
  },
};
```

`.env.local`:
```
POWER_PAGES_URL=https://your-site.powerappsportals.com
```

**IMPORTANT:** `rewrites` is a Next.js server feature and does NOT export to static output. This proxy ONLY works during `next dev`. In the exported build uploaded to Power Pages, `/_api` calls go directly to the Power Pages runtime — no proxy needed, because both the static files and the API are served from the same domain.

---

## 📦 PAC CLI DEPLOYMENT COMMANDS

```bash
# Step 1: Authenticate to your Power Pages environment
pac auth create --url https://your-org.crm.dynamics.com

# Step 2: Verify connection
pac auth list
pac pages list

# Step 3: Build the Next.js static export
npm run build
# This outputs to ./out/

# Step 4: Upload to Power Pages as a Code Site
pac pages upload-code-site \
  --rootPath ./ \
  --compiledPath ./out \
  --siteName "IVG B2B Portal"

# Step 5: In Power Pages admin (make.powerpages.microsoft.com):
# → Go to Inactive Sites
# → Find "IVG B2B Portal"
# → Click "Reactivate"

# Step 6: Subsequent deploys (site is already active)
# Uploading again auto-updates the active site
npm run build && pac pages upload-code-site --rootPath ./ --compiledPath ./out

# Download existing code site for backup or editing
pac pages download-code-site \
  --environment "https://your-org.crm.dynamics.com" \
  --path ./downloaded-site \
  --webSiteId "YOUR-SITE-GUID-HERE" \
  --overwrite
```

### `powerpages.config.json` (full)
```json
{
  "siteName": "IVG B2B Portal",
  "defaultLandingPage": "index.html",
  "compiledPath": "./out"
}
```

### PAC CLI Prerequisites
```bash
# Install PAC CLI (requires Node.js)
npm install -g @microsoft/powerplatform-cli

# Verify installation
pac --version
# Must be >= 1.44.x for upload-code-site support

# Allow JS uploads in Dataverse environment (one-time)
# Power Platform Admin Center → Environments → [Your Env]
# → Settings → Product → Privacy + Security
# → Blocked Attachments → remove 'js' from list → Save
```

---

## ⚠️ CRITICAL CONSTRAINTS & KNOWN GOTCHAS

### 1. NO SERVER-SIDE RENDERING
```typescript
// ❌ WILL BREAK THE BUILD — these do not exist in static export
export async function getServerSideProps() { ... }
export async function getStaticPaths() { ... } // (except with fallback: false)

// ✅ CORRECT — use client-side data fetching
'use client';
import useSWR from 'swr';
const { data } = useSWR('/api/orders', fetcher);
```

### 2. NO NEXT.JS API ROUTES
```typescript
// ❌ src/app/api/orders/route.ts — WILL NOT WORK in static export
// All data goes via /_api/ (Power Pages Web API)
```

### 3. ALL DATA IS ODATA FROM POWER PAGES WEB API
```typescript
// ✅ CORRECT pattern
const orders = await fetch('/_api/ivg_orderdrafts?$filter=...');
```

### 4. ROUTING — HARD REFRESH RETURNS ROOT
- Power Pages Code Sites always serve `index.html` for any URL
- Next.js client-side router handles all sub-routes
- **`trailingSlash: true` is mandatory** in `next.config.ts`
- Use `<Link>` for all internal navigation — never `window.location.href` for internal routes

### 5. WINDOW IS NOT AVAILABLE DURING BUILD
```typescript
// ❌ This crashes the build
const user = window.Microsoft.Dynamic365.Portal.User;

// ✅ Always guard with typeof window check or useEffect
useEffect(() => {
  const user = window?.Microsoft?.Dynamic365?.Portal?.User;
}, []);
```

### 6. AUTH STATE IS SYNCHRONOUS BUT REQUIRES MOUNT
The Power Pages user object is present on `window` immediately but only accessible after the component mounts in the browser. Always use the `useAuth` hook pattern.

### 7. IMAGE OPTIMIZATION IS DISABLED
```typescript
// next.config.ts must have:
images: { unoptimized: true }

// Use next/image with unoptimized prop for all images:
<Image src="/ivg-logo.png" alt="IVG" width={110} height={40} unoptimized />
```

### 8. NO GIT INTEGRATION
Power Platform Git integration is NOT supported for Code Sites. Use your own Git repo and deploy via PAC CLI in your CI/CD pipeline.

### 9. LIQUID TEMPLATING DOES NOT EXIST
There are zero Liquid templates, snippets, weblink sets, or any Power Pages designer features available in a Code Site. Navigation, content, styling — everything is in your React code.

### 10. TABLE PERMISSIONS STILL APPLY
Even though this is a React app, every `/_api/` call is still subject to Power Pages table permissions and web roles configured in Dataverse. Configure these in the Portal Management app, not in your React code.

---

## ✅ DELIVERABLE CHECKLIST

### Build & Deployment
- [ ] `next.config.ts` has `output: 'export'` and `trailingSlash: true`
- [ ] `powerpages.config.json` exists at project root
- [ ] `npm run build` completes without errors
- [ ] `./out/` directory is generated with `index.html` at root
- [ ] No API routes in `src/app/api/`
- [ ] No `getServerSideProps` anywhere
- [ ] All images use `unoptimized: true`

### Authentication
- [ ] `useAuth` hook returns correct user from `window.Microsoft.Dynamic365.Portal.User`
- [ ] `RouteGuard` correctly triggers Power Pages login flow
- [ ] Login uses `fetchAntiForgeryToken` + form POST to `/Account/Login/ExternalLogin`
- [ ] Logout redirects to `/Account/Login/LogOff?returnUrl=%2F`
- [ ] Header shows correct state for authenticated vs unauthenticated users
- [ ] All `window` accesses are guarded with `typeof window !== 'undefined'`

### Data Layer
- [ ] All data fetching uses `/_api/` endpoints
- [ ] OData queries include `$filter`, `$select`, `$top` on every query
- [ ] POST/PATCH/DELETE requests include `__RequestVerificationToken` header
- [ ] Anti-forgery token is fetched from `/_layout/tokenhtml` and cached
- [ ] SWR keys are correctly set to `null` when dependencies are not yet available
- [ ] `ApiError` class is used for consistent error handling

### Design & Brand
- [ ] `--ivg-red: #E31837` used for all CTAs, accents, active states
- [ ] Barlow Condensed used for ALL headings, uppercase
- [ ] DM Sans used for ALL body text
- [ ] Announcement bar renders with dismiss functionality
- [ ] Trust bar shows on interior pages, hidden on sign-in/register
- [ ] Header is sticky, white, with IVG logo
- [ ] Footer is black with 4 columns, social icons, nicotine warning
- [ ] Cards have hover effect with red border
- [ ] Primary button: red filled; Outline button: red border
- [ ] Mobile hamburger drawer works on ≤900px

### Forms
- [ ] New Customer Application is a multi-step form (5 steps with progress indicator)
- [ ] All fields from the uploaded customer application document are present
- [ ] Address copy buttons work (JS — copy company address to delivery/billing)
- [ ] Credit Application shows/hides sections based on Applicant Type
- [ ] All required fields have red asterisk visual indicator
- [ ] Form submission POSTs to `/_api/ivg_customerapplications` via `apiCreate`

### Order Module
- [ ] Products fetched from `/_api/products` via `useProducts` hook
- [ ] Products grouped by `ivg_productline` and shown as collapsible sections
- [ ] Qty inputs with real-time total recalculation
- [ ] Sticky summary bar shows item count, net, VAT, gross
- [ ] Submit disabled until at least one product has qty > 0
- [ ] Order creates `ivg_orderdraft` + `ivg_orderdraftline` records

### Accessibility
- [ ] Skip-to-content link at top of page
- [ ] All images have descriptive `alt` text
- [ ] All form inputs have `<label>` elements
- [ ] Focus states visible (red shadow outline)
- [ ] ARIA attributes on interactive elements
- [ ] Color contrast meets WCAG 2.1 AA

### Performance
- [ ] No blocking third-party scripts
- [ ] Google Fonts loaded with `display=swap`
- [ ] SWR cache set with appropriate `revalidateOnFocus: false` for static data
- [ ] OData queries use `$top` to limit result sets
- [ ] Bundle size checked — no server-side libraries in client bundle

---

*End of Antigravity IDE Prompt — IVG Power Pages Code Site (Next.js SPA)*
*Architecture: Next.js Static Export → pac pages upload-code-site → Power Pages CDN*
*Prepared by Devsinc | April 2026*
