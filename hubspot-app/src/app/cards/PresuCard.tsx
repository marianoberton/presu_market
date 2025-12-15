import React, { useState, useEffect } from 'react';
import {
  hubspot,
  Text,
  Box,
  Flex,
  Button,
  Alert,
  LoadingSpinner
} from '@hubspot/ui-extensions';

interface DealData {
  dealname?: string;
  amount?: string;
  dealstage?: string;
  // Propiedades personalizadas de Market Paper
  mp_items_json?: string;
  mp_condiciones_pago?: string;
  mp_condiciones_entrega?: string;
  mp_total_subtotal?: string;
  mp_total_iva?: string;
  mp_total_final?: string;
  mp_tiene_items_a_cotizar?: string;
  mp_metros_cuadrados_totales?: number;
}

interface BudgetItem {
  descripcion: string;
  cantidad: number;
  precio: number;
  subtotal: number;
  aCotizar?: boolean;
}

const PresuCard = ({ context, actions }: any) => {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [dealId, setDealId] = useState<string | null>(null);
  const [dealData, setDealData] = useState<DealData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manyChatUrl, setManyChatUrl] = useState<string | null>(null);
  const [contactName, setContactName] = useState<string | null>(null);
  const [assocContactIds, setAssocContactIds] = useState<string[]>([]);
  const [manyChatSource, setManyChatSource] = useState<'sdk' | 'serverless' | null>(null);
  const [serverlessDiag, setServerlessDiag] = useState<{ ok?: boolean; error?: string; contactId?: string } | null>(null);
  const [isSendingN8n, setIsSendingN8n] = useState(false);
  const [n8nDiag, setN8nDiag] = useState<{ ok?: boolean; status?: number; error?: string } | null>(null);
  const [loadingStages, setLoadingStages] = useState(false);
  const [stagesError, setStagesError] = useState<string | null>(null);
  const [pipelineStages, setPipelineStages] = useState<Array<{ id: string; label: string }>>([]);

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Función para parsear items del JSON
  const parseBudgetItems = (jsonString?: string): BudgetItem[] => {
    if (!jsonString) return [];
    try {
      return JSON.parse(jsonString);
    } catch (err) {
        console.error('Error parseando items JSON:', err);
        return [];
      }
  };

  // Cargar etapas del pipeline "Venta Mayorista"
  const loadVentaMayoristaStages = async () => {
    setLoadingStages(true);
    setStagesError(null);
    setPipelineStages([]);
    try {
      const resp = await hubspot.fetch({
        url: 'https://api.hubapi.com/crm/v3/pipelines/deals',
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await resp.json();
      const pipelines = Array.isArray((data as any)?.results) ? (data as any).results : (Array.isArray(data) ? data : []);
      const target = pipelines.find((p: any) => {
        const label = String(p?.label || '').toLowerCase();
        const name = String(p?.name || '').toLowerCase();
        return label === 'venta mayorista' || name === 'venta mayorista';
      }) || null;
      const stages = Array.isArray(target?.stages) ? target.stages : [];
      const normalized = stages.map((s: any) => ({ id: String(s?.id || s?.stageId || ''), label: String(s?.label || '') }))
        .filter(s => s.id);
      setPipelineStages(normalized);
    } catch (e: any) {
      const msg = e?.message || 'Error desconocido obteniendo etapas';
      setStagesError(msg);
    } finally {
      setLoadingStages(false);
    }
  };

  // Obtener ID del deal al cargar
  useEffect(() => {
    const getDealId = async () => {
      try {
        
        // Método 1: Usar el context proporcionado por el nuevo SDK
        if (context?.crm?.objectId) {
          const currentDealId = context.crm.objectId;
          setDealId(currentDealId);
          
          // Cargar datos reales del deal
          await loadDealDataDirectly(currentDealId);
          await loadAssociatedContactManyChatUrl(currentDealId);
          return;
        }

        // Método 2: Usar actions.fetchCrmObjectProperties si está disponible
        if (actions?.fetchCrmObjectProperties) {
          try {
            const properties = await actions.fetchCrmObjectProperties(['dealname', 'amount', 'dealstage']);
            if (properties && context?.crm?.objectId) {
              const currentDealId = context.crm.objectId;
              setDealId(currentDealId);
              
              // Cargar datos reales del deal
              await loadDealDataDirectly(currentDealId);
              await loadAssociatedContactManyChatUrl(currentDealId);
              return;
            }
          } catch (err) {
            console.error('fetchCrmObjectProperties falló:', err);
          }
        }

        // Método 3: Fallback - usar datos de prueba
        const testDealId = '46735598605';
        setDealId(testDealId);
        
        // Cargar datos de prueba
        await loadDealDataDirectly(testDealId);
        // Sin fallback: mantener deshabilitado si no hay mp_live_chat_url
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        console.error('ERROR FINAL:', errorMessage);
        setError(`Error obteniendo Deal ID: ${errorMessage}`);
        setStatus('error');
      }
    };

    getDealId();
  }, [context, actions]);

  // Intentar cargar el mp_live_chat_url del contacto asociado al deal
  const loadAssociatedContactManyChatUrl = async (dealIdParam: string) => {
    try {
      // Estrategia 1: usar asociaciones del SDK si están disponibles
      const hasAssoc = !!hubspot?.crm?.associations;
      const hasRecord = !!hubspot?.crm?.record?.getRecord;
      let contactIds: string[] = [];

      // Intentar distintos métodos/IDs según versión del SDK
      const assocApi = (hubspot as any)?.crm?.associations || {};
      const tryAssocMany = async (fromType: string, toType: string) => {
        const ids: string[] = [];
        if (typeof assocApi.getAssociatedIds === 'function') {
          const assocResp = await assocApi.getAssociatedIds({
            objectTypeId: fromType,
            objectId: String(dealIdParam),
            toObjectTypeId: toType
          });
          if (Array.isArray(assocResp?.results)) {
            for (const r of assocResp.results) {
              const id = r?.toObjectId ?? r?.id;
              if (id) ids.push(String(id));
            }
          } else if (Array.isArray(assocResp)) {
            for (const id of assocResp) {
              if (id) ids.push(String(id));
            }
          }
        } else if (typeof assocApi.getAssociatedObjects === 'function') {
          const assocResp = await assocApi.getAssociatedObjects({
            objectTypeId: fromType,
            objectId: String(dealIdParam),
            toObjectTypeId: toType
          });
          if (Array.isArray(assocResp?.results)) {
            for (const r of assocResp.results) {
              const id = r?.id;
              if (id) ids.push(String(id));
            }
          } else if (Array.isArray(assocResp)) {
            for (const r of assocResp) {
              const id = r?.id ?? r;
              if (id) ids.push(String(id));
            }
          }
        }
        return ids;
      };

      try {
        contactIds = await tryAssocMany('deal', 'contact');
        if (!contactIds.length) {
          // Fallback a type IDs numéricos
          contactIds = await tryAssocMany('0-5', '0-3');
        }
      } catch (e) {
        console.warn('Asociaciones deal→contact no disponibles o fallaron:', e);
      }

      // Fallback adicional: intentar obtener IDs desde el context si existen
      try {
        const ctxContacts = (context as any)?.crm?.associations?.contacts
          || (context as any)?.associations?.contacts
          || [];
        if (Array.isArray(ctxContacts)) {
          for (const id of ctxContacts) {
            if (id) contactIds.push(String(id));
          }
        }
      } catch {}
      // Normalizar únicos
      contactIds = Array.from(new Set(contactIds.filter(Boolean)));
      // Guardar para debug
      setAssocContactIds(contactIds);

      // Estrategia 2: iterar contactos y leer propiedad mp_live_chat_url
      if (contactIds.length && hasRecord) {
        for (const cid of contactIds) {
          try {
            const rec1 = await hubspot.crm.record.getRecord({
              objectTypeId: 'contact',
              recordId: String(cid),
              properties: ['mp_live_chat_url', 'firstname', 'lastname']
            });
            const url1 = String(rec1?.properties?.mp_live_chat_url || '').trim();
            const name1 = `${String(rec1?.properties?.firstname || '').trim()} ${String(rec1?.properties?.lastname || '').trim()}`.trim();
            if (name1) {
              setContactName(name1);
            }
            if (url1) {
              setManyChatUrl(url1);
              setManyChatSource('sdk');
              return;
            }
            // Segundo intento con ID numérico de tipo
            const rec2 = await hubspot.crm.record.getRecord({
              objectTypeId: '0-3',
              recordId: String(cid),
              properties: ['mp_live_chat_url', 'firstname', 'lastname']
            });
            const url2 = String(rec2?.properties?.mp_live_chat_url || '').trim();
            const name2 = `${String(rec2?.properties?.firstname || '').trim()} ${String(rec2?.properties?.lastname || '').trim()}`.trim();
            if (name2) {
              setContactName(name2);
            }
            if (url2) {
              setManyChatUrl(url2);
              setManyChatSource('sdk');
              return;
            }
          } catch (e) {
            console.warn('No se pudo leer mp_live_chat_url de contacto', cid, e);
          }
        }
      }

      // Sin fallback: dejar el botón deshabilitado si no se resuelve
    } catch (err) {
      console.warn('Error obteniendo URL de ManyChat del contacto asociado:', err);
      // Sin fallback
    }

    // Fallback final: invocar función serverless interna; si no está disponible, usar backend externo
    if (!manyChatUrl || !String(manyChatUrl).trim()) {
      let resolved = false;
      // 1) Intentar actions.runServerlessFunction (UI Extensions)
      try {
        const runFn = (actions as any)?.runServerlessFunction;
        if (typeof runFn === 'function') {
          const json = await runFn('contact-manychat-url', { dealId: String(dealIdParam) });
          setServerlessDiag({ ok: json?.ok, error: json?.error, contactId: json?.contactId });
          if (json?.ok && json?.url) {
            setManyChatUrl(String(json.url));
            setManyChatSource('serverless');
            try {
              if (json?.contactId && hubspot?.crm?.record?.getRecord) {
                const rec = await hubspot.crm.record.getRecord({
                  objectTypeId: 'contact',
                  recordId: String(json.contactId),
                  properties: ['firstname', 'lastname']
                });
                const name = `${String(rec?.properties?.firstname || '').trim()} ${String(rec?.properties?.lastname || '').trim()}`.trim();
                if (name) setContactName(name);
              }
            } catch {}
            resolved = true;
          }
        }
      } catch (e) {
        setServerlessDiag({ ok: false, error: (e as any)?.message || String(e) });
        console.warn('Error en runServerlessFunction contact-manychat-url:', e);
      }

      // 2) Intentar hubspot.serverless.run si existe
      if (!resolved) {
        try {
          const serverlessRun = (hubspot as any)?.serverless?.run;
          if (typeof serverlessRun === 'function') {
            const json = await serverlessRun('contact-manychat-url', { dealId: String(dealIdParam) });
            setServerlessDiag({ ok: json?.ok, error: json?.error, contactId: json?.contactId });
            if (json?.ok && json?.url) {
              setManyChatUrl(String(json.url));
              setManyChatSource('serverless');
              try {
                if (json?.contactId && hubspot?.crm?.record?.getRecord) {
                  const rec = await hubspot.crm.record.getRecord({
                    objectTypeId: 'contact',
                    recordId: String(json.contactId),
                    properties: ['firstname', 'lastname']
                  });
                  const name = `${String(rec?.properties?.firstname || '').trim()} ${String(rec?.properties?.lastname || '').trim()}`.trim();
                  if (name) setContactName(name);
                }
              } catch {}
              resolved = true;
            }
          }
        } catch (e) {
          setServerlessDiag({ ok: false, error: (e as any)?.message || String(e) });
          console.warn('Error en hubspot.serverless.run contact-manychat-url:', e);
        }
      }

      // 3) Fallback externo con URL absoluta (si ninguna de las anteriores funcionó)
      if (!resolved && hubspot?.fetch) {
        try {
          const resp = await (hubspot as any).fetch(
            'https://presu-market.vercel.app/api/hubspot/contact-manychat-url',
            {
              method: 'POST',
              body: { dealId: String(dealIdParam) },
              timeout: 12000
            }
          );
          if (resp?.ok) {
            const json = await resp.json();
            setServerlessDiag({ ok: json?.ok, error: json?.error, contactId: json?.contactId });
            if (json?.ok && json?.url) {
              setManyChatUrl(String(json.url));
              setManyChatSource('serverless');
              try {
                if (json?.contactId && hubspot?.crm?.record?.getRecord) {
                  const rec = await hubspot.crm.record.getRecord({
                    objectTypeId: 'contact',
                    recordId: String(json.contactId),
                    properties: ['firstname', 'lastname']
                  });
                  const name = `${String(rec?.properties?.firstname || '').trim()} ${String(rec?.properties?.lastname || '').trim()}`.trim();
                  if (name) setContactName(name);
                }
              } catch {}
              resolved = true;
            } else {
              console.warn('Backend externo contact-manychat-url no devolvió URL:', json?.error || json);
            }
          } else {
            const text = resp ? await resp.text() : 'sin respuesta';
            setServerlessDiag({ ok: false, error: `HTTP ${resp?.status ?? '??'}: ${text}` });
            console.warn('Backend externo contact-manychat-url falló:', resp?.status, text);
          }
        } catch (e) {
          setServerlessDiag({ ok: false, error: (e as any)?.message || String(e) });
          console.warn('Error en fallback externo contact-manychat-url:', e);
        }
      }
    }
  };

  // Botón: enviar payload completo al webhook de n8n
  const handleSendToN8N = async () => {
    if (!dealId) return;
    setIsSendingN8n(true);
    setN8nDiag(null);

    const payload: any = {
      dealId,
      dealProperties: dealData || null,
      assocContactIds: assocContactIds || [],
      manyChatUrl: manyChatUrl || null,
      manyChatSource: manyChatSource || null,
      serverlessDiag: serverlessDiag || null,
      cardMeta: {
        component: 'PresuCard',
        version: 'n8n-webhook-v1',
        timestamp: new Date().toISOString(),
      },
    };

    // Intentar enriquecer con propiedades básicas de contactos asociados
    try {
      if (assocContactIds?.length && hubspot?.crm?.record?.getRecord) {
        const contacts: any[] = [];
        for (const cid of assocContactIds) {
          try {
            const rec = await hubspot.crm.record.getRecord({
              objectTypeId: 'contact',
              recordId: String(cid),
              properties: ['email', 'firstname', 'lastname', 'mp_live_chat_url']
            });
            contacts.push({ id: cid, properties: rec?.properties || {} });
          } catch (e) {
            contacts.push({ id: cid, error: 'failed_to_fetch_properties' });
          }
        }
        payload.associatedContacts = contacts;
      }
    } catch {}

    try {
      const resp = await (hubspot as any).fetch(
        'https://n8n-n8n.jjwsfm.easypanel.host/webhook/send-budget-v1',
        {
          method: 'POST',
          body: payload,
          timeout: 20000,
        }
      );
      const status = resp?.status ?? 0;
      const ok = status >= 200 && status < 300;
      let errorMsg: string | undefined;
      try {
        const data = await resp.json();
        payload.n8nResponse = data;
      } catch {
        // Puede que n8n no devuelva JSON; ignoramos
      }
      if (!ok) {
        errorMsg = `n8n responded with status ${status}`;
      }
      setN8nDiag({ ok, status, error: errorMsg });
    } catch (err: any) {
      setN8nDiag({ ok: false, status: 0, error: err?.message || 'unknown error' });
    } finally {
      setIsSendingN8n(false);
    }
  };

  // Cargar datos del deal directamente con un ID específico
  const loadDealDataDirectly = async (dealIdParam: string) => {
    try {
      setStatus('loading');
      
      // Intentar usar el nuevo SDK de HubSpot con actions.fetchCrmObjectProperties
      if (actions?.fetchCrmObjectProperties) {
        try {
          const properties = await actions.fetchCrmObjectProperties([
        'dealname',
        'amount', 
        'dealstage',
        'mp_items_json',
        'mp_condiciones_pago',
        'mp_condiciones_entrega',
        'mp_total_subtotal',
        'mp_total_iva',
        'mp_total_final',
        'mp_tiene_items_a_cotizar',
        'mp_metros_cuadrados_totales'
      ]);
          
          setDealData(properties);
          setStatus('ready');
          return;
        } catch (err) {
          console.error('Error con actions.fetchCrmObjectProperties:', err);
        }
      }

      // Fallback: datos de prueba
      const sampleItems = [
        {
          descripcion: "Caja de cartón corrugado 30x20x15cm",
          cantidad: 100,
          precio: 150,
          subtotal: 15000,
          aCotizar: false
        },
        {
          descripcion: "Polímero 2 colores personalizado",
          cantidad: 1,
          precio: 0,
          subtotal: 0,
          aCotizar: true
        }
      ];
      
      setDealData({
        dealname: `Deal de Prueba ${dealIdParam}`,
        amount: '$18,150',
        dealstage: 'Qualified to Buy',
        mp_items_json: JSON.stringify(sampleItems),
      mp_condiciones_pago: '50% anticipo por transferencia bancaria. Una vez acreditado el importe se toma el pedido. Enviar OC.\nEl resto del pago, 48 hs previo a la entrega.',
      mp_condiciones_entrega: 'Demora producción 15 días aprox.\nLa mercadería se entrega palletizada para pedidos mayoristas. Debe contar con personal para la descarga.',
      mp_total_subtotal: '15000',
      mp_total_iva: '3150',
      mp_total_final: '18150',
      mp_tiene_items_a_cotizar: 'true',
      mp_metros_cuadrados_totales: 513.82
      });
      setStatus('ready');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('PresuCard: Error cargando datos:', err);
      setError(`Error cargando datos: ${errorMessage}`);
      setStatus('error');
    }
  };

  // Cargar datos del deal
  const loadDealData = async () => {
    if (!dealId) {
      return;
    }

    try {
      setStatus('loading');
      
      // Intentar usar la API de HubSpot si está disponible
      if (hubspot.crm?.record?.getRecord) {
        try {
          const record = await hubspot.crm.record.getRecord({
            objectTypeId: 'deal',
            recordId: dealId,
            properties: [
              'dealname', 
              'amount', 
              'dealstage',
              'mp_items_json',
              'mp_condiciones_pago',
              'mp_condiciones_entrega',
              'mp_total_subtotal',
              'mp_total_iva',
              'mp_total_final',
              'mp_tiene_items_a_cotizar'
            ]
          });
          
          setDealData(record.properties);
          setStatus('ready');
          return;
        } catch (err) {
          console.error('Error con API CRM:', err);
        }
      }

      // Fallback: datos de prueba
      const sampleItems = [
        {
          descripcion: "Caja de cartón corrugado 30x20x15cm",
          cantidad: 100,
          precio: 150,
          subtotal: 15000,
          aCotizar: false
        },
        {
          descripcion: "Polímero 2 colores personalizado",
          cantidad: 1,
          precio: 0,
          subtotal: 0,
          aCotizar: true
        }
      ];
      
      setDealData({
        dealname: `Deal de Prueba ${dealId}`,
        amount: '$18,150',
        dealstage: 'Qualified to Buy',
        mp_items_json: JSON.stringify(sampleItems),
        mp_condiciones_pago: '50% anticipo por transferencia bancaria. Una vez acreditado el importe se toma el pedido. Enviar OC.\nEl resto del pago, 48 hs previo a la entrega.',
        mp_condiciones_entrega: 'Demora producción 15 días aprox.\nLa mercadería se entrega palletizada para pedidos mayoristas. Debe contar con personal para la descarga.',
        mp_total_subtotal: '15000',
        mp_total_iva: '3150',
        mp_total_final: '18150',
        mp_metros_cuadrados_totales: 513.82,
        mp_tiene_items_a_cotizar: 'true'
      });
      setStatus('ready');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('PresuCard: Error cargando datos:', err);
      setError(`Error cargando datos: ${errorMessage}`);
      setStatus('error');
    }
  };

  // Función para logging cuando se hace clic en el presupuestador
  const handlePresupuestadorClick = () => {
    // Sin logging ya que eliminamos debugInfo
  };

  // Función de diagnóstico manual
  const runDiagnostic = async () => {
    try {
      // Verificar APIs disponibles
      console.log('hubspot disponible:', !!hubspot);
      console.log('hubspot.crm disponible:', !!hubspot?.crm);
      console.log('hubspot.crm.record disponible:', !!hubspot?.crm?.record);
      console.log('hubspot.crm.record.getObjectId disponible:', !!hubspot?.crm?.record?.getObjectId);
      console.log('hubspot.crm.record.getRecord disponible:', !!hubspot?.crm?.record?.getRecord);
      console.log('hubspot.context disponible:', !!hubspot?.context);
      console.log('hubspot.context.getContext disponible:', !!hubspot?.context?.getContext);
      console.log('hubspot.actions disponible:', !!hubspot?.actions);
      console.log('hubspot.actions.openUrl disponible:', !!hubspot?.actions?.openUrl);
      
      // Verificar entorno
      console.log('typeof window:', typeof window);
      console.log('typeof document:', typeof document);
      
      // Intentar obtener contexto si está disponible
      if (hubspot?.context?.getContext) {
        try {
          const context = await hubspot.context.getContext();
          console.log('Context completo:', JSON.stringify(context, null, 2));
        } catch (err) {
          console.error('Error obteniendo context:', err);
        }
      }
      
      // Verificar todas las propiedades de hubspot
      if (hubspot) {
        const hubspotKeys = Object.keys(hubspot);
        console.log('Propiedades de hubspot:', hubspotKeys.join(', '));
      }
      
    } catch (err) {
      console.error('Error en diagnóstico:', err);
    }
  };

  if (status === 'loading') {
    return (
      <Box>
        <Flex direction="column" align="center" gap="medium">
          <LoadingSpinner />
          <Text>Cargando...</Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Box>
      <Flex direction="column" gap="medium">
        <Text variant="h2">💰 Presupuestador FOMO</Text>
        
        {/* Métricas Principales */}
        {(dealData?.mp_total_final || dealData?.mp_metros_cuadrados_totales) && (
          <Box>
            <Text variant="h4">📊 Métricas Principales</Text>
            <Flex direction="row" justify="between" gap="medium">
              {dealData.mp_metros_cuadrados_totales && (
                <Box>
                  <Text>📐 M² del Pedido</Text>
                  <Text variant="h3">{dealData.mp_metros_cuadrados_totales} m²</Text>
                </Box>
              )}
              {dealData.mp_total_final && (
                <Box>
                  <Text>💰 Valor Total</Text>
                  <Text variant="h3">{formatCurrency(Number(dealData.mp_total_final))}</Text>
                </Box>
              )}
            </Flex>
          </Box>
        )}
        
        {status === 'error' && (
          <Alert title="Error" variant="error">
            <Text>{error}</Text>
          </Alert>
        )}
        
        {/* Items del Presupuesto */}
        {dealData?.mp_items_json && (
          <Box>
            <Text variant="h4">📦 Items del Presupuesto</Text>
            {(() => {
              try {
                const items: BudgetItem[] = JSON.parse(dealData.mp_items_json);
                return (
                  <Box>
                    {items.map((item, index) => (
                      <Box key={index}>
                        <Flex direction="row" justify="between" align="center">
                          <Box>
                            <Text>{item.descripcion}</Text>
                            {item.aCotizar && (
                              <Text>🔍 A COTIZAR</Text>
                            )}
                          </Box>
                          <Box>
                            <Text>Cantidad: {item.cantidad}</Text>
                          </Box>
                          <Box>
                            {!item.aCotizar ? (
                              <>
                                <Text>${item.precio.toLocaleString('es-AR')} c/u</Text>
                                <Text>${item.subtotal.toLocaleString('es-AR')}</Text>
                              </>
                            ) : (
                              <Text>A cotizar</Text>
                            )}
                          </Box>
                        </Flex>
                      </Box>
                    ))}
                  </Box>
                );
              } catch (error) {
                return (
                  <Alert title="Error" variant="error">
                    <Text>Error al procesar los items del presupuesto</Text>
                  </Alert>
                );
              }
            })()}
          </Box>
        )}

        {/* Totales */}
        {(dealData.mp_total_subtotal || dealData.mp_total_iva || dealData.mp_total_final || dealData.mp_metros_cuadrados_totales) && (
          <Box>
            <Text variant="h4">💰 Totales</Text>
            {dealData.mp_metros_cuadrados_totales && (
              <Text>📐 Superficie Total: {dealData.mp_metros_cuadrados_totales} m²</Text>
            )}
            {dealData.mp_total_subtotal && (
              <Text>Subtotal: {formatCurrency(Number(dealData.mp_total_subtotal))}</Text>
            )}
            {dealData.mp_total_iva && (
              <Text>IVA (21%): {formatCurrency(Number(dealData.mp_total_iva))}</Text>
            )}
            {dealData.mp_total_final && (
              <Text>TOTAL: {formatCurrency(Number(dealData.mp_total_final))}</Text>
            )}
            {dealData.mp_tiene_items_a_cotizar === 'true' && (
              <Text>* Los productos "A COTIZAR" no se incluyen en el total</Text>
            )}
          </Box>
        )}

        {/* Condiciones de Pago */}
        {dealData?.mp_condiciones_pago && (
          <Box>
            <Text variant="h4">💳 Condiciones de Pago</Text>
            <Text>{dealData.mp_condiciones_pago}</Text>
          </Box>
        )}

        {/* Condiciones de Entrega */}
        {dealData?.mp_condiciones_entrega && (
          <Box>
            <Text variant="h4">🚚 Condiciones de Entrega</Text>
            <Text>{dealData.mp_condiciones_entrega}</Text>
          </Box>
        )}

        <Flex direction="row" gap="small" wrap="wrap">
          <Button 
            variant="primary" 
            href="https://presu-market.vercel.app/"
            external={true}
            onClick={handlePresupuestadorClick}
          >
            🚀 Abrir Presupuestador
          </Button>
          <Button 
            variant="secondary"
            disabled={!dealId || isSendingN8n}
            onClick={handleSendToN8N}
          >
            {isSendingN8n ? '📤 Enviando presupuesto…' : '📤 Enviar presupuesto'}
          </Button>
          <Button 
            variant="secondary"
            disabled={loadingStages}
            onClick={loadVentaMayoristaStages}
          >
            {loadingStages ? '🔎 Cargando etapas…' : '🔎 Ver IDs etapas Venta Mayorista'}
          </Button>
        </Flex>

        {stagesError && (
          <Box marginTop="small">
            <Alert title="Error" variant="error">
              <Text>Error obteniendo etapas: {stagesError}</Text>
            </Alert>
          </Box>
        )}

        {!!pipelineStages.length && (
          <Box marginTop="small">
            <Text variant="h4">Etapas – Venta Mayorista</Text>
            {pipelineStages.map((s, idx) => (
              <Text key={idx} variant="microcopy">{s.label || '(sin label)'} — ID: {s.id}</Text>
            ))}
          </Box>
        )}

        
      </Flex>
    </Box>
  );
};

export default hubspot.extend(({ context, actions }) => <PresuCard context={context} actions={actions} />);

