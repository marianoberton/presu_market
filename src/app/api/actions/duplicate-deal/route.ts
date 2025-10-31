import { NextRequest, NextResponse } from 'next/server';
import { DuplicateDealRequest, ActionResponse, HubSpotDealResponse } from '@/lib/types/actions';

const HUBSPOT_TOKEN = process.env.HUBSPOT_TOKEN;

// Propiedades que se copiarán al nuevo deal
const PROPERTIES_TO_COPY = [
  'dealname',
  'pipeline',
  'dealstage',
  'amount',
  'mp_pdf_presupuesto_url',
  'mp_items_json',
  'mp_total_subtotal',
  'mp_total_iva',
  'mp_total_final',
  'mp_cliente_nombre',
  'mp_cliente_empresa',
  'mp_cliente_email',
  'mp_cliente_telefono',
  'mp_condiciones_pago',
  'mp_validez_oferta',
  'mp_tiempo_entrega',
  'mp_observaciones'
].join(',');

export async function POST(request: NextRequest) {
  try {
    // Validar token de HubSpot
    if (!HUBSPOT_TOKEN) {
      return NextResponse.json({
        ok: false,
        error: 'HUBSPOT_TOKEN no configurado'
      } as ActionResponse, { status: 500 });
    }

    // Parsear el cuerpo de la petición
    let body: DuplicateDealRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({
        ok: false,
        error: 'JSON inválido en el cuerpo de la petición'
      } as ActionResponse);
    }

    const { dealId } = body;

    // Validar dealId
    if (!dealId) {
      return NextResponse.json({
        ok: false,
        error: 'dealId es requerido'
      } as ActionResponse);
    }

    // 1. Obtener el deal original
    const originalDealResponse = await fetch(
      `https://api.hubapi.com/crm/v3/objects/deals/${dealId}?properties=${PROPERTIES_TO_COPY}`,
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!originalDealResponse.ok) {
      const errorText = await originalDealResponse.text();
      console.error('Error obteniendo deal original:', errorText);
      
      return NextResponse.json({
        ok: false,
        error: `Error al obtener deal original: ${originalDealResponse.status}`
      } as ActionResponse);
    }

    const originalDeal: HubSpotDealResponse = await originalDealResponse.json();
    const { properties } = originalDeal;

    // 2. Preparar propiedades para el nuevo deal
    const newDealProperties: Record<string, string> = {};
    
    // Copiar todas las propiedades excepto el nombre (que será modificado)
    Object.entries(properties).forEach(([key, value]) => {
      if (key !== 'dealname' && value !== null && value !== undefined) {
        newDealProperties[key] = String(value);
      }
    });

    // Modificar el nombre del deal para indicar que es una copia
    const originalName = properties.dealname || 'Deal sin nombre';
    newDealProperties.dealname = `${originalName} (copia)`;

    // Resetear el stage al inicial si está configurado
    const initialStage = process.env.HUBSPOT_STAGE_INICIAL;
    if (initialStage) {
      newDealProperties.dealstage = initialStage;
    }

    // 3. Crear el nuevo deal
    const createDealResponse = await fetch(
      'https://api.hubapi.com/crm/v3/objects/deals',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: newDealProperties
        }),
      }
    );

    if (!createDealResponse.ok) {
      const errorText = await createDealResponse.text();
      console.error('Error creando nuevo deal:', errorText);
      
      return NextResponse.json({
        ok: false,
        error: `Error al crear nuevo deal: ${createDealResponse.status}`
      } as ActionResponse);
    }

    const newDeal: HubSpotDealResponse = await createDealResponse.json();

    // Respuesta exitosa
    return NextResponse.json({
      ok: true,
      newDealId: newDeal.id
    } as ActionResponse);

  } catch (error) {
    console.error('Error en duplicate-deal:', error);
    return NextResponse.json({
      ok: false,
      error: 'Error interno del servidor'
    } as ActionResponse, { status: 500 });
  }
}

// TODO: Agregar opción para duplicar también las asociaciones (contactos, empresas)
// TODO: Implementar logs de auditoría para tracking de duplicaciones
// TODO: Permitir personalizar qué propiedades copiar via parámetros