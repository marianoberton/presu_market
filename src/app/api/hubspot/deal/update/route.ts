import { NextRequest, NextResponse } from 'next/server';
import { DealUpdatePayload, ApiResponse } from '@/lib/types/presupuesto';
import { borrarLineItemsAnteriores, crearLineItemsHubSpot } from '@/lib/hubspot-line-items';

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

    // Gestionar Line Items si se proporcionan en el payload
    if (payload.items && Array.isArray(payload.items) && payload.items.length > 0) {
      try {
        const targetPipeline = process.env.HUBSPOT_PIPELINE;
        let dealPipeline = updatedDeal.properties?.pipeline;

        // Si no tenemos el pipeline en la respuesta del PATCH, lo consultamos
        if (!dealPipeline) {
           const dealCheck = await fetch(`https://api.hubapi.com/crm/v3/objects/deals/${payload.dealId}?properties=pipeline`, {
             headers: { 'Authorization': `Bearer ${token}` }
           });
           if (dealCheck.ok) {
             const dealData = await dealCheck.json();
             dealPipeline = dealData.properties?.pipeline;
           }
        }

        // Solo procesamos Line Items si estamos en el pipeline correcto (o si no hay restricción configurada)
        if (targetPipeline && dealPipeline !== targetPipeline) {
           console.log(`Deal ${payload.dealId}: Omitiendo creación de Line Items. Pipeline actual (${dealPipeline}) no coincide con el objetivo (${targetPipeline}).`);
        } else {
           console.log(`Deal ${payload.dealId}: Gestionando ${payload.items.length} Line Items...`);
           
           // 1. Borrar items anteriores para evitar duplicados
           await borrarLineItemsAnteriores(payload.dealId, token);
           
           // 2. Crear nuevos items y asociarlos
           await crearLineItemsHubSpot(payload.dealId, payload.items, token);
           
           console.log(`Deal ${payload.dealId}: Line Items actualizados correctamente.`);
        }
      } catch (itemError) {
        console.error(`Deal ${payload.dealId}: Error gestionando Line Items:`, itemError);
        // No fallamos la request completa, pero logueamos el error
      }
    }

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