/**
 * Dataverse Server-Side API Utility
 *
 * Implements OAuth 2.0 Client Credentials flow + OData queries.
 * This module must ONLY be imported in Server Components or API Routes.
 */

import { env } from './env';

// ─── Token Cache ───
let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Acquire a bearer token via OAuth 2.0 Client Credentials grant.
 * Caches the token until 60s before expiry.
 */
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const tokenUrl = `https://login.microsoftonline.com/${env.AZURE_TENANT_ID}/oauth2/v2.0/token`;

  const body = new URLSearchParams({
    client_id: env.AZURE_CLIENT_ID,
    client_secret: env.AZURE_CLIENT_SECRET,
    scope: `${env.DATAVERSE_URL}/.default`,
    grant_type: 'client_credentials',
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[Dataverse] Token request failed:', response.status, error);
    throw new Error(`Failed to acquire Dataverse access token: ${response.status}`);
  }

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cachedToken.token;
}

/**
 * Execute an OData GET request against the Dataverse Web API.
 */
export async function dataverseGet<T = Record<string, unknown>>(
  entity: string,
  query?: string,
): Promise<T[]> {
  try {
    const token = await getAccessToken();
    const baseUrl = `${env.DATAVERSE_URL}/api/data/v9.2/${entity}`;
    const url = query ? `${baseUrl}?${query}` : baseUrl;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        Accept: 'application/json',
        Prefer: 'odata.include-annotations="*"',
      },
      next: { revalidate: 30 }, // ISR: revalidate every 30s
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[Dataverse] GET ${entity} failed:`, response.status, error);
      return [];
    }

    const data = await response.json();
    return (data.value ?? []) as T[];
  } catch (err) {
    console.error(`[Dataverse] GET ${entity} error:`, err);
    return [];
  }
}

/**
 * Fetch a single record by ID.
 */
export async function dataverseGetById<T = Record<string, unknown>>(
  entity: string,
  id: string,
  select?: string,
): Promise<T | null> {
  try {
    const token = await getAccessToken();
    let url = `${env.DATAVERSE_URL}/api/data/v9.2/${entity}(${id})`;
    if (select) url += `?$select=${select}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        Accept: 'application/json',
        Prefer: 'odata.include-annotations="*"',
      },
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      console.error(`[Dataverse] GET ${entity}(${id}) failed:`, response.status);
      return null;
    }

    return (await response.json()) as T;
  } catch (err) {
    console.error(`[Dataverse] GET ${entity}(${id}) error:`, err);
    return null;
  }
}

/**
 * Create a record via POST.
 */
export async function dataverseCreate<T = Record<string, unknown>>(
  entity: string,
  data: Record<string, unknown>,
): Promise<T | null> {
  try {
    const token = await getAccessToken();
    const url = `${env.DATAVERSE_URL}/api/data/v9.2/${entity}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[Dataverse] POST ${entity} failed:`, response.status, error);
      return null;
    }

    return (await response.json()) as T;
  } catch (err) {
    console.error(`[Dataverse] POST ${entity} error:`, err);
    return null;
  }
}
