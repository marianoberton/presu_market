// Función serverless: obtiene mp_live_chat_url del contacto asociado a un deal
// Input: { dealId: string } (vía query ?dealId=... o body JSON)
// Output: { ok: boolean, url?: string, contactId?: string, error?: string }

exports.main = async (context) => {
  // Soportar tanto parámetros de query como cuerpo JSON para POST
  const paramsDealId = (context?.parameters && (context.parameters as any).dealId) || undefined;
  let bodyDealId: string | undefined = undefined;
  try {
    const body = (context as any)?.body;
    if (body) {
      if (typeof body === 'string') {
        const parsed = JSON.parse(body);
        bodyDealId = parsed?.dealId;
      } else if (typeof body === 'object') {
        bodyDealId = (body as any)?.dealId;
      }
    }
  } catch {}
  const dealId = paramsDealId ?? bodyDealId;

  if (!dealId) {
    return { ok: false, error: 'dealId es requerido' };
  }

  const token = process.env.PRIVATE_APP_TOKEN;
  if (!token) {
    return { ok: false, error: 'PRIVATE_APP_TOKEN no configurado en el proyecto' };
  }

  const hsApi = async (url, init = {}) => {
    const res = await fetch(url, {
      ...init,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(init.headers || {})
      }
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status} ${res.statusText}: ${text}`);
    }
    return res.json();
  };

  try {
    // 1) Obtener contactos asociados al deal (intentar v4 y v3)
    let contactIds = [];

    try {
      const v4 = await hsApi(`https://api.hubapi.com/crm/v4/objects/deals/${dealId}/associations/contacts?limit=25`);
      if (Array.isArray(v4?.results)) {
        for (const r of v4.results) {
          const id = r?.toObjectId ?? r?.id;
          if (id) contactIds.push(String(id));
        }
      }
    } catch (e) {
      // Fallback a v3 si v4 falla
      try {
        const v3 = await hsApi(`https://api.hubapi.com/crm/v3/objects/deals/${dealId}/associations/contacts`);
        if (Array.isArray(v3?.results)) {
          for (const r of v3.results) {
            const id = r?.toObjectId ?? r?.id;
            if (id) contactIds.push(String(id));
          }
        }
      } catch (e2) {
        console.warn('Fallo asociaciones v3 y v4:', e, e2);
      }
    }

    contactIds = Array.from(new Set(contactIds.filter(Boolean)));

    if (!contactIds.length) {
      return { ok: false, error: `Deal ${dealId} sin contactos asociados` };
    }

    // 2) Leer propiedad mp_live_chat_url del primer contacto que la tenga
    for (const cid of contactIds) {
      try {
        const c = await hsApi(`https://api.hubapi.com/crm/v3/objects/contacts/${cid}?properties=mp_live_chat_url`);
        const url = String(c?.properties?.mp_live_chat_url || '').trim();
        if (url) {
          return { ok: true, url, contactId: cid };
        }
      } catch (e) {
        console.warn('Error leyendo contacto', cid, e.message);
      }
    }

    return { ok: false, error: `Ningún contacto asociado al deal ${dealId} tiene mp_live_chat_url` };

  } catch (error) {
    console.error('contact-manychat-url error:', error);
    return { ok: false, error: error.message || 'Error desconocido' };
  }
};