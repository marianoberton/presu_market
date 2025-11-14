import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/hubspot-integration";

type CreateCompanyBodyProperties = {
  name: string;
  province?: string;
  city?: string;
  address?: string;
};

type CreateCompanyBody = CreateCompanyBodyProperties | { properties: CreateCompanyBodyProperties };

export async function POST(req: NextRequest) {
  try {
    const token = await getAccessToken();
    if (!token) {
      return NextResponse.json(
        { error: "No HubSpot OAuth token available" },
        { status: 401 }
      );
    }

    const body: CreateCompanyBody = await req.json();
    const props = (body && (body as any).properties) ? (body as any).properties : body;
    if (!props?.name) {
      return NextResponse.json(
        { error: "Missing required field: name" },
        { status: 400 }
      );
    }

    const payload = {
      properties: {
        name: props.name,
        // Mapear provincia al campo estándar de HubSpot: state
        ...(props.province ? { state: props.province } : {}),
        ...(props.city ? { city: props.city } : {}),
        ...(props.address ? { address: props.address } : {}),
      },
    };

    const resp = await fetch("https://api.hubapi.com/crm/v3/objects/companies", {
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
        { error: "Failed to create company", details: safeJson(text) },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    return NextResponse.json({ id: data.id, properties: data.properties });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Unexpected error creating company", details: err?.message ?? String(err) },
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