import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/hubspot-integration";

export async function GET(req: NextRequest) {
  try {
    const token = await getAccessToken();
    if (!token) {
      return NextResponse.json(
        { error: "No HubSpot OAuth token available" },
        { status: 401 }
      );
    }

    const urlObj = new URL(req.url);
    const id = urlObj.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Missing required query param: id" },
        { status: 400 }
      );
    }

    const props = ["mp_live_chat_url", "mp_manychat_user_id", "mp_page_id", "firstname", "lastname", "email", "phone"].join(",");
    const url = `https://api.hubapi.com/crm/v3/objects/contacts/${encodeURIComponent(id)}?properties=${props}`;
    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json(
        { error: "Failed to read contact", details: safeJson(text) },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    return NextResponse.json({ id: data.id, properties: data.properties });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Unexpected error reading contact", details: err?.message ?? String(err) },
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