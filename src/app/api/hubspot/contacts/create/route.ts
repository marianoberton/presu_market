import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/hubspot-integration";

type CreateContactBody = {
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
};

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

    const payload = {
      properties: {
        ...(body.firstname ? { firstname: body.firstname } : {}),
        ...(body.lastname ? { lastname: body.lastname } : {}),
        ...(body.email ? { email: body.email } : {}),
        ...(body.phone ? { phone: body.phone } : {}),
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