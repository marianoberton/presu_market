import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/hubspot-integration";

type UpdateDealProps = {
  dealname?: string;
};

type UpdateDealBody = {
  id: string;
  properties?: UpdateDealProps;
} | (UpdateDealProps & { id: string });

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest) {
  try {
    const token = await getAccessToken();
    if (!token) {
      return NextResponse.json(
        { error: "No HubSpot OAuth token available" },
        { status: 401 }
      );
    }

    const body: UpdateDealBody = await req.json();
    const id = (body as any)?.id;
    if (!id) {
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 }
      );
    }

    // Normalizar props: si vienen anidadas en `properties` las usamos; si vienen planas, excluir `id`
    const props: UpdateDealProps = (body && (body as any).properties)
      ? (body as any).properties
      : (() => {
          const copy: any = { ...(body as any) };
          delete copy.id;
          delete copy.properties;
          return copy as UpdateDealProps;
        })();
    if (!props || Object.keys(props).length === 0) {
      return NextResponse.json(
        { error: "No properties provided to update" },
        { status: 400 }
      );
    }

    const payload = { properties: {
      ...(props.dealname ? { dealname: String(props.dealname) } : {}),
    }};

    const url = `https://api.hubapi.com/crm/v3/objects/deals/${encodeURIComponent(id)}`;
    const resp = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json(
        { error: "Failed to update deal", details: safeJson(text) },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    return NextResponse.json({ id: data.id, properties: data.properties });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Unexpected error updating deal", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}