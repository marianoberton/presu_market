/**
 * Integración con HubSpot - Funcionalidad en desarrollo
 * Este archivo contiene las funciones para integrar con HubSpot CRM
 */

import { PresupuestoData, ProductoData } from './types';
import { getValidToken } from './oauth-storage';
import { calcularTotales, calcularMedidasProduccion } from './calculations';
import { borrarLineItemsAnteriores, crearLineItemsHubSpot } from './hubspot-line-items';

/**
 * Elimina las asociaciones de Line Items existentes de un Deal
 * Para evitar duplicados al actualizar un presupuesto
 */
// La implementación se ha movido a hubspot-line-items.ts
// Mantenemos la referencia aquí si es necesario, o la eliminamos del todo.
// Como ya se re-exporta arriba, podemos eliminar las funciones duplicadas.

/**
 * Función para generar y enviar presupuesto a HubSpot
 * Actualmente redirige a la página de desarrollo
 */
export async function generarHubSpot() {
  // Por ahora, simplemente abrimos la página de desarrollo
  const hubspotUrl = '/hubspot-integration';
  window.open(hubspotUrl, '_blank');
}

/**
 * Función futura para actualizar deals en HubSpot
 * @param dealId - ID del deal en HubSpot
 * @param presupuestoData - Datos del presupuesto generado
 */
export async function actualizarDealHubSpot(dealId: string, presupuestoData: PresupuestoData): Promise<void> {
  try {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('No se encontró token de acceso para HubSpot');
    }

    // Calcular totales para obtener m²
    const totales = calcularTotales(presupuestoData.productos);
    const metrosCuadradosTotales = totales.metrosCuadradosTotales;
    const promedioPrecioM2 = totales.promedioPrecioM2 || 0;

    // Preparar payload para HubSpot
    const properties = {
      amount: presupuestoData.totales.total.toString(),
      mp_metros_cuadrados_totales: metrosCuadradosTotales.toString(),
      mp_precio_promedio_m2: promedioPrecioM2.toString(),
      dealstage: 'presupuesto_enviado' // Opcional, según requerimiento
    };

    console.log(`[HubSpot] Actualizando deal ${dealId} con m²: ${metrosCuadradosTotales}`);

    const response = await fetch(`https://api.hubapi.com/crm/v3/objects/deals/${dealId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ properties })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error actualizando deal en HubSpot: ${JSON.stringify(errorData)}`);
    }

    console.log('[HubSpot] Deal actualizado correctamente. Procesando Line Items...');

    // Limpiar Line Items anteriores
    await borrarLineItemsAnteriores(dealId, token);

    // Crear nuevos Line Items
    if (presupuestoData.productos && presupuestoData.productos.length > 0) {
        await crearLineItemsHubSpot(dealId, presupuestoData.productos, token);
    }

    console.log('[HubSpot] Actualización completa (Deal + Line Items).');
  } catch (error) {
    console.error('[HubSpot] Error en actualizarDealHubSpot:', error);
    throw error;
  }
}

/**
 * Función futura para crear contacto en HubSpot
 * @param clienteData - Datos del cliente
 */
export async function crearContactoHubSpot(clienteData: PresupuestoData['cliente']): Promise<string> {
  // TODO: Implementar creación de contacto en HubSpot
  console.log('Creando contacto:', clienteData);
  throw new Error('Funcionalidad en desarrollo');
}

/**
 * Obtiene un token de acceso válido para la API de HubSpot.
 * Prioriza el almacenamiento OAuth (cuando esté implementado) y cae a ENV en desarrollo.
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    // Intentar obtener token válido desde almacenamiento OAuth (cuando esté disponible)
    const stored = await getValidToken('dev-user');
    if (stored) return stored;

    // Fallback para desarrollo: usar token de entorno
    // Preferir HUBSPOT_TOKEN para mantener consistencia con los endpoints que lo usan directamente
    const envToken =
      process.env.HUBSPOT_TOKEN ||
      process.env.HUBSPOT_ACCESS_TOKEN ||
      process.env.HUBSPOT_OAUTH_ACCESS_TOKEN ||
      null;

    if (!envToken) {
      console.warn('[HubSpot] No se encontró token OAuth ni token en entorno');
      return null;
    }
    return envToken;
  } catch (err) {
    console.error('[HubSpot] Error obteniendo token de acceso:', err);
    return null;
  }
}