import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/hubspot-integration";

type ObjectType = "contacts" | "companies" | "deals";

type CreateAssociationBody = {
  fromType: ObjectType;
  fromId: string;
  toType: ObjectType;
  toId: string;
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

    const body: CreateAssociationBody = await req.json();
    if (!body?.fromType || !body?.fromId || !body?.toType || !body?.toId) {
      return NextResponse.json(
        { error: "Missing required fields: fromType, fromId, toType, toId" },
        { status: 400 }
      );
    }

    // Fetch association labels to find a default HUBSPOT_DEFINED type id
    const labelsUrl = `https://api.hubapi.com/crm/v4/associations/${body.fromType}/${body.toType}/labels`;
    const labelsResp = await fetch(labelsUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!labelsResp.ok) {
      const text = await labelsResp.text();
      return NextResponse.json(
        { error: "Failed to fetch association labels", details: safeJson(text) },
        { status: labelsResp.status }
      );
    }
    const labelsData = await labelsResp.json();
    const associationTypeId = pickAssociationTypeId(labelsData, body.fromType, body.toType);

    // Prefer v4 with HUBSPOT_DEFINED typeId when available; otherwise fallback to v3 association API
    let createResp: Response;
    if (associationTypeId) {
      const createUrl = `https://api.hubapi.com/crm/v4/associations/${body.fromType}/${body.toType}/batch/create`;
      const payload = {
        inputs: [
          {
            from: { id: body.fromId },
            to: { id: body.toId },
            types: [
              {
                associationCategory: "HUBSPOT_DEFINED",
                associationTypeId,
              },
            ],
          },
        ],
      };
      createResp = await fetch(createUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } else {
      // Fallback: use v3 association endpoint with default associationType strings
      const v3Type = getV3AssociationType(body.fromType, body.toType);
      if (!v3Type) {
        return NextResponse.json(
          { error: "No association type available for pair", pair: `${body.fromType}->${body.toType}` },
          { status: 422 }
        );
      }
      const v3Url = `https://api.hubapi.com/crm/v3/objects/${body.fromType}/${body.fromId}/associations/${body.toType}/${body.toId}/${v3Type}`;
      createResp = await fetch(v3Url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    }
    if (!createResp.ok) {
      const text = await createResp.text();
      return NextResponse.json(
        { error: "Failed to create association", details: safeJson(text) },
        { status: createResp.status }
      );
    }

    const data = await createResp.json();
    return NextResponse.json({ success: true, result: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Unexpected error creating association", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

function pickAssociationTypeId(labelsData: any, fromType: ObjectType, toType: ObjectType): number | null {
  // HubSpot may return `labels` or `results` arrays depending on API version/portal
  const items: any[] = labelsData?.labels ?? labelsData?.results ?? (Array.isArray(labelsData) ? labelsData : []);
  if (!Array.isArray(items) || items.length === 0) return null;

  // Prefer "Primary" for contacts->companies
  if (fromType === "contacts" && toType === "companies") {
    const primary = items.find((i) =>
      (String(i?.associationCategory || i?.category).toUpperCase() === "HUBSPOT_DEFINED") && /primary/i.test(String(i?.label))
    );
    const typeId = primary?.associationTypeId ?? primary?.typeId;
    if (typeId) return Number(typeId);
  }

  const firstDefault = items.find((i) =>
    String(i?.associationCategory || i?.category).toUpperCase() === "HUBSPOT_DEFINED" && (i?.associationTypeId || i?.typeId)
  );
  const typeId = firstDefault?.associationTypeId ?? firstDefault?.typeId;
  return typeId ? Number(typeId) : null;
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getV3AssociationType(fromType: ObjectType, toType: ObjectType): string | null {
  const key = `${fromType}->${toType}`;
  switch (key) {
    case "deals->contacts":
      return "deal_to_contact";
    case "deals->companies":
      return "deal_to_company";
    case "contacts->companies":
      return "contact_to_company";
    case "companies->contacts":
      return "company_to_contact";
    case "companies->deals":
      return "company_to_deal";
    case "contacts->deals":
      return "contact_to_deal";
    default:
      return null;
  }
}