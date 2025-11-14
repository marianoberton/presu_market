import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/hubspot-integration";

type UpdateContactProps = {
  mp_live_chat_url?: string;
  mp_manychat_user_id?: string;
  mp_page_id?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
};

type UpdateContactBody = {
  id: string;
  properties?: UpdateContactProps;
} | (UpdateContactProps & { id: string });

export async function PATCH(req: NextRequest) {
  try {
    const token = await getAccessToken();
    if (!token) {
      return NextResponse.json(
        { error: "No HubSpot OAuth token available" },
        { status: 401 }
      );
    }

    const body: UpdateContactBody = await req.json();
    const id = (body as any)?.id;
    if (!id) {
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 }
      );
    }
    // Normalizar props: si vienen anidadas en `properties` las usamos; si vienen planas, excluir `id`
    const props: UpdateContactProps = (body && (body as any).properties)
      ? (body as any).properties
      : (() => {
          const copy: any = { ...(body as any) };
          delete copy.id;
          delete copy.properties;
          return copy as UpdateContactProps;
        })();
    if (!props || Object.keys(props).length === 0) {
      return NextResponse.json(
        { error: "No properties provided to update" },
        { status: 400 }
      );
    }

    // Si viene el link de ManyChat, derivar page_id y user_id si faltan
    const derived = deriveManyChat(props.mp_live_chat_url);
    const payload = { properties: {
      ...(props.mp_live_chat_url ? { mp_live_chat_url: String(props.mp_live_chat_url) } : {}),
      ...(props.firstname ? { firstname: props.firstname } : {}),
      ...(props.lastname ? { lastname: props.lastname } : {}),
      ...(props.email ? { email: props.email } : {}),
      ...(props.phone ? { phone: props.phone } : {}),
      // Derivados solo si faltan
      ...(derived?.manychat_user_id && !props.mp_manychat_user_id ? { mp_manychat_user_id: derived.manychat_user_id } : {}),
      ...(derived?.page_id && !props.mp_page_id ? { mp_page_id: derived.page_id } : {}),
      // Si vienen explícitos en props, respetarlos
      ...(props.mp_manychat_user_id ? { mp_manychat_user_id: String(props.mp_manychat_user_id) } : {}),
      ...(props.mp_page_id ? { mp_page_id: String(props.mp_page_id) } : {}),
    }};
    const url = `https://api.hubapi.com/crm/v3/objects/contacts/${encodeURIComponent(id)}`;
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
        { error: "Failed to update contact", details: safeJson(text) },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    return NextResponse.json({ id: data.id, properties: data.properties });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Unexpected error updating contact", details: err?.message ?? String(err) },
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

function deriveManyChat(url?: string): { page_id: string; manychat_user_id: string } | null {
  if (!url) return null;
  try {
    const normalized = String(url).trim();
    // Buscar los dos números clave de forma robusta
    const pageMatch = normalized.match(/\/fb(\d+)/);
    const userMatch = normalized.match(/\/chat\/(\d+)/);
    const page_id = pageMatch?.[1];
    const manychat_user_id = userMatch?.[1];
    if (page_id && manychat_user_id) return { page_id, manychat_user_id };
    return null;
  } catch {
    return null;
  }
}