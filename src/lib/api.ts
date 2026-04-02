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
