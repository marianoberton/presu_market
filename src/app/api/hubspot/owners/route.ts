import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/types/presupuesto';

interface HubSpotOwner {
  id: string;
  email: string;
  type: string;
  firstName: string;
  lastName: string;
  userId: number;
  userIdIncludingInactive: number;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  teams?: Array<{
    id: string;
    name: string;
    primary: boolean;
  }>;
}

interface HubSpotOwnersResponse {
  results: HubSpotOwner[];
}

export async function GET(request: NextRequest) {
  try {
    const token = process.env.HUBSPOT_TOKEN;

    if (!token) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Token de HubSpot no configurado',
        status: 500
      }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Email es requerido como parámetro de consulta',
        status: 400
      }, { status: 400 });
    }

    // Obtener owner por email usando la API de HubSpot
    const response = await fetch(`https://api.hubapi.com/crm/v3/owners/?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al obtener owner de HubSpot:', errorText);
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Error al obtener owner: ${response.status} - ${errorText}`,
        status: response.status
      }, { status: response.status });
    }

    const ownersData: HubSpotOwnersResponse = await response.json();

    if (ownersData.results.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `No se encontró owner con email: ${email}`,
        status: 404
      }, { status: 404 });
    }

    const owner = ownersData.results[0];

    return NextResponse.json<ApiResponse<{
      ownerId: string;
      email: string;
      firstName: string;
      lastName: string;
      fullName: string;
    }>>({
      success: true,
      data: {
        ownerId: owner.id,
        email: owner.email,
        firstName: owner.firstName,
        lastName: owner.lastName,
        fullName: `${owner.firstName} ${owner.lastName}`.trim()
      }
    });

  } catch (error) {
    console.error('Error al obtener owner:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
      status: 500
    }, { status: 500 });
  }
}