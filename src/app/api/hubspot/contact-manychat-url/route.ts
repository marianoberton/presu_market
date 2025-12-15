import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/hubspot-integration';

export const runtime = 'nodejs';

type Result = { ok: boolean; url?: string; contactId?: string; error?: string };

async function hsJson(url: string, token: string, init: RequestInit = {}): Promise<any> {
  const resp = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`${resp.status} ${resp.statusText}: ${text}`);
  }
  return resp.json();
}

async function resolveManyChatUrl(dealId: string, token: string): Promise<Result> {
  // 1) Intentar asociaciones v4; fallback a v3
  let contactIds: string[] = [];
  try {
    const v4 = await hsJson(
      `https://api.hubapi.com/crm/v4/objects/deals/${encodeURIComponent(dealId)}/associations/contacts?limit=25`,
      token
    );
    if (Array.isArray(v4?.results)) {
      for (const r of v4.results) {
        const id = r?.toObjectId ?? r?.id;
        if (id) contactIds.push(String(id));
      }
    }
  } catch (e) {
    try {
      const v3 = await hsJson(
        `https://api.hubapi.com/crm/v3/objects/deals/${encodeURIComponent(dealId)}/associations/contacts`,
        token
      );
      if (Array.isArray(v3?.results)) {
        for (const r of v3.results) {
          const id = r?.toObjectId ?? r?.id;
          if (id) contactIds.push(String(id));
        }
      }
    } catch (e2) {
      console.warn('Fallo asociaciones v3 y v4:', (e as any)?.message, (e2 as any)?.message);
    }
  }

  contactIds = Array.from(new Set(contactIds.filter(Boolean)));
  if (!contactIds.length) {
    return { ok: false, error: `Deal ${dealId} sin contactos asociados` };
  }

  // 2) Leer mp_live_chat_url del primer contacto que la tenga
  for (const cid of contactIds) {
    try {
      const c = await hsJson(
        `https://api.hubapi.com/crm/v3/objects/contacts/${encodeURIComponent(cid)}?properties=mp_live_chat_url`,
        token
      );
      const url = String(c?.properties?.mp_live_chat_url || '').trim();
      if (url) {
        return { ok: true, url, contactId: cid };
      }
    } catch (err: any) {
      console.warn('Error leyendo contacto', cid, err?.message || String(err));
    }
  }

  return { ok: false, error: `Ningún contacto asociado al deal ${dealId} tiene mp_live_chat_url` };
}

function getDealIdFromUrl(req: NextRequest): string | null {
  try {
    const { searchParams } = new URL(req.url);
    const dealId = searchParams.get('dealId');
    return dealId ? String(dealId) : null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = await getAccessToken();
    if (!token) {
      return NextResponse.json({ ok: false, error: 'No HubSpot OAuth token available' } as Result, { status: 401 });
    }
    const dealId = getDealIdFromUrl(req);
    if (!dealId) {
      return NextResponse.json({ ok: false, error: 'dealId es requerido' } as Result, { status: 400 });
    }

    const result = await resolveManyChatUrl(dealId, token);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) } as Result,
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getAccessToken();
    if (!token) {
      return NextResponse.json({ ok: false, error: 'No HubSpot OAuth token available' } as Result, { status: 401 });
    }

    let dealId: string | null = null;
    try {
      const body = await req.json();
      dealId = body?.dealId ? String(body.dealId) : null;
    } catch {}

    if (!dealId) {
      // Intentar leer desde query si no viene en body
      dealId = getDealIdFromUrl(req);
    }

    if (!dealId) {
      return NextResponse.json({ ok: false, error: 'dealId es requerido' } as Result, { status: 400 });
    }

    const result = await resolveManyChatUrl(dealId, token);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) } as Result,
      { status: 500 }
    );
  }
}