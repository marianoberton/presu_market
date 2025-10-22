import { NextRequest, NextResponse } from 'next/server';
import { DealUpdatePayload, ApiResponse } from '@/lib/types/presupuesto';

export async function POST(request: NextRequest) {
  try {
    const token = process.env.HUBSPOT_TOKEN;
    const stageEnviado = process.env.HUBSPOT_STAGE_ENVIADO;

    if (!token) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Token de HubSpot no configurado',
        status: 500
      }, { status: 500 });
    }

    const payload: DealUpdatePayload = await request.json();

    // Validar payload básico
    if (!payload.dealId || !payload.properties) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'dealId y properties son requeridos',
        status: 400
      }, { status: 400 });
    }

    // Preparar propiedades para actualizar
    const updateProperties = { ...payload.properties };

    // Lógica para mover de etapa: solo si no hay items a cotizar y se solicita explícitamente
    if (payload.moveToStage && stageEnviado) {
      const tieneItemsACotizar = payload.properties.mp_tiene_items_a_cotizar === 'true';
      
      if (tieneItemsACotizar) {
        console.log(`Deal ${payload.dealId}: No se mueve de etapa porque tiene items a cotizar`);
      } else {
        updateProperties.dealstage = payload.targetStage || stageEnviado;
        console.log(`Deal ${payload.dealId}: Moviendo a etapa ${updateProperties.dealstage}`);
      }
    }

    // Actualizar el deal en HubSpot
    const response = await fetch(`https://api.hubapi.com/crm/v3/objects/deals/${payload.dealId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: updateProperties
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al actualizar deal en HubSpot:', errorText);
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Error al actualizar deal: ${response.status} - ${errorText}`,
        status: response.status
      }, { status: response.status });
    }

    const updatedDeal = await response.json();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        dealId: payload.dealId,
        updatedProperties: updateProperties,
        movedToStage: payload.moveToStage && updateProperties.dealstage !== undefined,
        newStage: updateProperties.dealstage,
        hubspotResponse: updatedDeal
      }
    });

  } catch (error) {
    console.error('Error al actualizar deal:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
      status: 500
    }, { status: 500 });
  }
}