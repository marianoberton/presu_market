import { ProductoData } from './types';
import { calcularMedidasProduccion } from './calculations';

/**
 * Elimina las asociaciones de Line Items existentes de un Deal
 * Para evitar duplicados al actualizar un presupuesto
 */
export async function borrarLineItemsAnteriores(dealId: string, token: string): Promise<void> {
  try {
    // 1. Obtener Line Items asociados al Deal
    const associationUrl = `https://api.hubapi.com/crm/v4/objects/deals/${dealId}/associations/line_items`;
    const response = await fetch(associationUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
       // Si no hay asociaciones o falla (404), no pasa nada crítico
       console.warn('[HubSpot] No se pudieron obtener asociaciones anteriores o no existen.');
       return;
    }

    const data = await response.json();
    const results = data.results || [];
    
    if (results.length === 0) return;

    console.log(`[HubSpot] Eliminando ${results.length} line items anteriores...`);

    // 2. Eliminar cada Line Item (podemos hacerlo en paralelo)
    // Nota: Eliminamos el objeto Line Item, no solo la asociación, para limpiar la base
    const deletePromises = results.map(async (assoc: any) => {
        const lineItemId = assoc.toObjectId;
        const deleteUrl = `https://api.hubapi.com/crm/v3/objects/line_items/${lineItemId}`;
        await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    });

    await Promise.all(deletePromises);
    console.log('[HubSpot] Line items anteriores eliminados.');

  } catch (error) {
    console.error('[HubSpot] Error limpiando line items anteriores:', error);
    // No lanzamos error para no detener el flujo principal
  }
}

/**
 * Crea Line Items en HubSpot y los asocia al Deal de forma atómica
 */
export async function crearLineItemsHubSpot(dealId: string, items: ProductoData[], token: string): Promise<void> {
    console.log(`[HubSpot] Iniciando creación de ${items.length} items para deal ${dealId}...`);
    
    for (const item of items) {
        // Valores seguros para evitar NaN
        const largo = item.largo || 0;
        const ancho = item.ancho || 0;
        const alto = item.alto || 0;
        const cantidad = item.cantidad || 1; // Default a 1 para evitar división por cero

        // Calcular m2 unitarios
        let m2Unitario = 0;
        try {
             // Lógica especial para 'otros-items' con m2 manuales
             if (item.tipo === 'otros-items' && item.metrosCuadradosManual) {
                 m2Unitario = item.metrosCuadradosManual / cantidad;
             } else {
                 const medidas = calcularMedidasProduccion(largo, ancho, alto, item.tipo);
                 m2Unitario = medidas.superficie;
             }
        } catch (e) {
             console.warn("Error calculando medidas para item, usando 0", e);
        }

        // Asegurar que m2Unitario sea un número válido
        if (isNaN(m2Unitario)) {
            m2Unitario = 0;
        }

        // Construir nombre descriptivo si es genérico
        let name = item.descripcion;
        if (!name || name.trim() === '') {
            name = `Caja ${item.tipo} - ${largo}x${ancho}x${alto}`;
        }

        // Resolver precio unitario (prioridad: precioUnitario > subtotal/cantidad > precio)
        let price = item.precioUnitario;
        if ((price === undefined || price === null) && item.subtotal && cantidad > 0) {
            price = item.subtotal / cantidad;
        }
        if ((price === undefined || price === null)) {
            price = item.precio;
        }
        const finalPrice = price || 0;

        const body = {
            properties: {
                name: name,
                quantity: cantidad.toString(),
                price: finalPrice.toString(),
                // Propiedades personalizadas
                mp_largo_mm: largo.toString(),
                mp_ancho_mm: ancho.toString(),
                mp_alto_mm: alto.toString(),
                mp_tipo_caja: item.tipo || "otro",
                mp_metros_cuadrados_item: m2Unitario.toString()
            },
            associations: [
                {
                    to: { id: dealId },
                    types: [
                        {
                            associationCategory: "HUBSPOT_DEFINED",
                            associationTypeId: 20 // ID estándar para Line Item -> Deal
                        }
                    ]
                }
            ]
        };

        try {
            const response = await fetch('https://api.hubapi.com/crm/v3/objects/line_items', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error(`❌ Error creando item ${name}:`, JSON.stringify(errorData, null, 2));
            } else {
                console.log(`✅ Item creado: ${name}`);
            }
        } catch (error) {
            console.error("Error de red creando item:", error);
        }
    }
    console.log('[HubSpot] Proceso de creación de line items finalizado.');
}