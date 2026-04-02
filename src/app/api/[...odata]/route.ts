import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/dataverse';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

async function proxyDataverse(req: NextRequest, params: { odata: string[] }) {
  try {
    const token = await getAccessToken();
    const path = params.odata.join('/');
    const search = req.nextUrl.search;
    
    const targetUrl = `${env.DATAVERSE_URL}/api/data/v9.2/${path}${search}`;

    const headers = new Headers();
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('OData-MaxVersion', '4.0');
    headers.set('OData-Version', '4.0');
    headers.set('Accept', 'application/json');
    
    // Only copy Content-Type if it's there
    const contentType = req.headers.get('content-type');
    if (contentType) headers.set('Content-Type', contentType);
    
    // If it's a GET, Prefer annotations
    if (req.method === 'GET') {
      headers.set('Prefer', 'odata.include-annotations="*"');
    } else {
      headers.set('Prefer', 'return=representation');
    }

    const options: RequestInit = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = await req.text();
    }

    const response = await fetch(targetUrl, options);
    
    let data;
    const text = await response.text();
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: text };
    }

    const resHeaders = new Headers();
    resHeaders.set('Content-Type', 'application/json');
    
    // Copy OData-EntityId if present (needed by apiCreate in api.ts)
    const entityId = response.headers.get('OData-EntityId');
    if (entityId) {
      resHeaders.set('OData-EntityId', entityId);
    }

    return new NextResponse(JSON.stringify(data), {
      status: response.status,
      headers: resHeaders,
    });
  } catch (err: any) {
    console.error(`[Dataverse Proxy] Error:`, err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { odata: string[] } }) {
  return proxyDataverse(req, params);
}

export async function POST(req: NextRequest, { params }: { params: { odata: string[] } }) {
  return proxyDataverse(req, params);
}

export async function PATCH(req: NextRequest, { params }: { params: { odata: string[] } }) {
  return proxyDataverse(req, params);
}

export async function DELETE(req: NextRequest, { params }: { params: { odata: string[] } }) {
  return proxyDataverse(req, params);
}
