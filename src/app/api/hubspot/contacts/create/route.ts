import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/hubspot-integration";

type CreateContactProps = {
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  mp_live_chat_url?: string;
  mp_manychat_user_id?: string;
  mp_page_id?: string;
};

type CreateContactBody = CreateContactProps | { properties: CreateContactProps };

export async function POST(req: NextRequest) {
  try {
    const token = await getAccessToken();
    if (!token) {
      return NextResponse.json(
        { error: "No HubSpot OAuth token available" },
        { status: 401 }
      );
    }

    const body: CreateContactBody = await req.json();
    const props: CreateContactProps = (body && (body as any).properties) ? (body as any).properties : (body as any);

    // Validación: email requerido (HubSpot) y link de ManyChat opcional
    if (!props?.email) {
      return NextResponse.json(
        { error: "Missing required field: email" },
        { status: 400 }
      );
    }
    // Si viene el link de ManyChat, derivar page_id y user_id
    const derived = deriveManyChat(props?.mp_live_chat_url);

    const payload = {
      properties: {
        ...(props.firstname ? { firstname: props.firstname } : {}),
        ...(props.lastname ? { lastname: props.lastname } : {}),
        ...(props.email ? { email: props.email } : {}),
        ...(props.phone ? { phone: props.phone } : {}),
        ...(props.mp_live_chat_url ? { mp_live_chat_url: String(props.mp_live_chat_url) } : {}),
        ...(props.mp_manychat_user_id || derived?.manychat_user_id ? { mp_manychat_user_id: String(props.mp_manychat_user_id ?? derived!.manychat_user_id) } : {}),
        ...(props.mp_page_id || derived?.page_id ? { mp_page_id: String(props.mp_page_id ?? derived!.page_id) } : {}),
      },
    };

    const resp = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json(
        { error: "Failed to create contact", details: safeJson(text) },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    return NextResponse.json({ id: data.id, properties: data.properties });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Unexpected error creating contact", details: err?.message ?? String(err) },
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