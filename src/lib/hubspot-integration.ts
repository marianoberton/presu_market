/**
 * Integración con HubSpot - Funcionalidad en desarrollo
 * Este archivo contiene las funciones para integrar con HubSpot CRM
 */

import { PresupuestoData } from './types';
import { getValidToken } from './oauth-storage';

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
  // TODO: Implementar integración real con HubSpot API
  console.log('Actualizando deal:', dealId, 'con datos:', presupuestoData);
  throw new Error('Funcionalidad en desarrollo');
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