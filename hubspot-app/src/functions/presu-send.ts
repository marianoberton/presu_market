// Función serverless para enviar presupuestos por WhatsApp
// Input: { dealId: string, presuId: string }
// Output: { ok: boolean, error?: string }

const presuSend = async (context) => {
  const { dealId, presuId } = context.parameters;
  
  // Validar parámetros
  if (!dealId || !presuId) {
    return json({ ok: false, error: 'dealId y presuId son requeridos' });
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
    
    const url = `${backendBase}/api/acciones/enviar-whatsapp`;
    
    console.log(`Enviando presupuesto ${presuId} del deal ${dealId} por WhatsApp via API: ${url}`);
    
    // Realizar la petición POST a la API local del proyecto
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Usar el token de HubSpot para autenticación si es necesario
        'Authorization': `Bearer ${process.env.PRIVATE_APP_TOKEN}`
      },
      body: JSON.stringify({
        dealId,
        presuId
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error del backend: ${response.status} - ${errorText}`);
      return json({ 
        ok: false, 
        error: `Error del backend: ${response.status} - ${errorText}` 
      });
    }

    const data = await response.json();
    
    // Si el backend devuelve información adicional, la incluimos
    if (data && data.success) {
      console.log('Presupuesto enviado exitosamente por WhatsApp');
      
      // Opcional: Actualizar propiedades del deal en HubSpot
      // await updateDealProperties(dealId, {
      //   'mp_ultimo_envio_whatsapp': new Date().toISOString(),
      //   'mp_presupuesto_enviado': 'true'
      // });
      
      return json({ ok: true, message: 'Presupuesto enviado exitosamente' });
    } else {
      return json({ 
        ok: false, 
        error: data?.error || 'Error desconocido al enviar presupuesto' 
      });
    }

  } catch (error) {
    console.error('Error en presu-send:', error);
    return json({ 
      ok: false, 
      error: `Error interno: ${error.message}` 
    });
  }
};

// Helper para actualizar propiedades del deal en HubSpot (opcional)
const updateDealProperties = async (dealId, properties) => {
  try {
    const token = process.env.PRIVATE_APP_TOKEN;
    if (!token) {
      console.warn('PRIVATE_APP_TOKEN no configurado, no se pueden actualizar propiedades del deal');
      return;
    }

    const response = await fetch(`https://api.hubapi.com/crm/v3/objects/deals/${dealId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ properties })
    });

    if (!response.ok) {
      console.error(`Error al actualizar deal ${dealId}:`, await response.text());
    } else {
      console.log(`Deal ${dealId} actualizado exitosamente`);
    }
  } catch (error) {
    console.error('Error al actualizar propiedades del deal:', error);
  }
};

// Helper para respuesta JSON estándar
const json = (data) => {
  return {
    statusCode: 200,
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  };
};

// Helper para respuesta de error
const error = (message, statusCode = 500) => {
  return {
    statusCode,
    body: JSON.stringify({ ok: false, error: message }),
    headers: {
      'Content-Type': 'application/json'
    }
  };
};

export default presuSend;
