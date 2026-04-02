/**
 * Server-side environment validation.
 * Import this ONLY in Server Components or API routes — never in 'use client' files.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, fallback: string = ''): string {
  return process.env[key] || fallback;
}

export const env = {
  get AZURE_TENANT_ID() { return requireEnv('AZURE_TENANT_ID'); },
  get AZURE_CLIENT_ID() { return requireEnv('AZURE_CLIENT_ID'); },
  get AZURE_CLIENT_SECRET() { return requireEnv('AZURE_CLIENT_SECRET'); },
  get DATAVERSE_URL() { return requireEnv('DATAVERSE_URL'); },
  get DEMO_CONTACT_ID() { return requireEnv('DEMO_CONTACT_ID'); },
} as const;
