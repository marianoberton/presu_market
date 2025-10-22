// Función serverless para obtener presupuestos desde el backend
// Input: { dealId: string }
// Output: { ok: boolean, items?: Array, error?: string }

exports.main = async (context) => {
  const { dealId } = context.parameters;
  
  // Validar parámetros
  if (!dealId) {
    return { ok: false, error: 'dealId es requerido' };
  }

  try {
    // Detectar automáticamente la URL base según el entorno
    let backendBase;
    if (process.env.VERCEL_URL) {
      // En Vercel, usar la URL automática
      backendBase = `https://${process.env.VERCEL_URL}`;
    } else if (process.env.BACKEND_BASE) {
      // Variable de entorno personalizada
      backendBase = process.env.BACKEND_BASE;
    } else {
      // Fallback para desarrollo local
      backendBase = 'https://presu-market.vercel.app';
    }
    
    const url = `${backendBase}/api/presupuestos?dealId=${encodeURIComponent(dealId)}`;
    
    console.log(`Llamando a API: ${url}`);
    
    // Realizar la petición a la API local del proyecto
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Usar el token de HubSpot para autenticación si es necesario
        'Authorization': `Bearer ${process.env.PRIVATE_APP_TOKEN}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error del backend: ${response.status} - ${errorText}`);
      return { 
        ok: false, 
        error: `Error del backend: ${response.status} - ${errorText}` 
      };
    }

    const data = await response.json();
    
    // Verificar si la respuesta tiene el formato esperado
    if (data && Array.isArray(data.items)) {
      return { ok: true, items: data.items };
    } else if (Array.isArray(data)) {
      return { ok: true, items: data };
    } else {
      return { ok: true, items: [] };
    }

  } catch (error) {
    console.error('Error en presu-get:', error);
    return { 
      ok: false, 
      error: `Error interno: ${error.message}` 
    };
  }
};
