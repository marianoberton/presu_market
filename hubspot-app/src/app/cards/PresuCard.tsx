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
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        console.error('ERROR FINAL:', errorMessage);
        setError(`Error obteniendo Deal ID: ${errorMessage}`);
        setStatus('error');
      }
    };

    getDealId();
  }, [context, actions]);

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
            'mp_tiene_items_a_cotizar'
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
        mp_condiciones_entrega: 'Demora producción 15 días aprox.\nLa mercadería se entrega palletizada. Debe contar con personal para la descarga.',
        mp_total_subtotal: '15000',
        mp_total_iva: '3150',
        mp_total_final: '18150',
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
        mp_condiciones_entrega: 'Demora producción 15 días aprox.\nLa mercadería se entrega palletizada. Debe contar con personal para la descarga.',
        mp_total_subtotal: '15000',
        mp_total_iva: '3150',
        mp_total_final: '18150',
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
        <Text variant="h3">💰 Presupuestador FOMO</Text>
        
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
              const items = parseBudgetItems(dealData.mp_items_json);
              if (items.length === 0) {
                return <Text>No hay items disponibles</Text>;
              }
              
              return (
                <Box>
                  {items.map((item, index) => (
                    <Box key={index} style={{ 
                      border: '1px solid #e1e5e9', 
                      borderRadius: '4px', 
                      padding: '12px', 
                      marginBottom: '8px',
                      backgroundColor: item.aCotizar ? '#fff3cd' : '#f8f9fa'
                    }}>
                      <Flex direction="column" gap="small">
                        <Text variant="h5">{item.descripcion}</Text>
                        <Flex direction="row" justify="between">
                          <Text>Cantidad: {item.cantidad}</Text>
                        </Flex>
                        {item.aCotizar ? (
                          <Text style={{ color: '#856404', fontWeight: 'bold' }}>
                            🔍 A COTIZAR
                          </Text>
                        ) : (
                          <Text style={{ fontWeight: 'bold' }}>
                            Subtotal: {formatCurrency(item.subtotal)}
                          </Text>
                        )}
                      </Flex>
                    </Box>
                  ))}
                  
                  {/* Totales */}
                  {(dealData.mp_total_subtotal || dealData.mp_total_iva || dealData.mp_total_final) && (
                    <Box style={{ 
                      border: '2px solid #007bff', 
                      borderRadius: '4px', 
                      padding: '12px', 
                      marginTop: '12px',
                      backgroundColor: '#f8f9ff'
                    }}>
                      <Text variant="h5">💰 Totales</Text>
                      {dealData.mp_total_subtotal && (
                        <Text>Subtotal: {formatCurrency(Number(dealData.mp_total_subtotal))}</Text>
                      )}
                      {dealData.mp_total_iva && (
                        <Text>IVA (21%): {formatCurrency(Number(dealData.mp_total_iva))}</Text>
                      )}
                      {dealData.mp_total_final && (
                        <Text style={{ fontWeight: 'bold', fontSize: '16px' }}>
                          TOTAL: {formatCurrency(Number(dealData.mp_total_final))}
                        </Text>
                      )}
                      {dealData.mp_tiene_items_a_cotizar === 'true' && (
                        <Text style={{ color: '#856404', fontSize: '12px', marginTop: '4px' }}>
                          * Los productos "A COTIZAR" no se incluyen en el total
                        </Text>
                      )}
                    </Box>
                  )}
                </Box>
              );
            })()}
          </Box>
        )}

        {/* Condiciones de Pago */}
        {dealData?.mp_condiciones_pago && (
          <Box>
            <Text variant="h4">💳 Condiciones de Pago</Text>
            <Box style={{ 
              border: '1px solid #e1e5e9', 
              borderRadius: '4px', 
              padding: '12px',
              backgroundColor: '#f8f9fa'
            }}>
              <Text style={{ whiteSpace: 'pre-line' }}>
                {dealData.mp_condiciones_pago}
              </Text>
            </Box>
          </Box>
        )}

        {/* Condiciones de Entrega */}
        {dealData?.mp_condiciones_entrega && (
          <Box>
            <Text variant="h4">🚚 Condiciones de Entrega</Text>
            <Box style={{ 
              border: '1px solid #e1e5e9', 
              borderRadius: '4px', 
              padding: '12px',
              backgroundColor: '#f8f9fa'
            }}>
              <Text style={{ whiteSpace: 'pre-line' }}>
                {dealData.mp_condiciones_entrega}
              </Text>
            </Box>
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
            href="https://app.manychat.com/fb104200486030266/chat"
            external={true}
            onClick={() => {}} // Sin logging ya que eliminamos debugInfo
          >
            💬 Abrir ManyChat
          </Button>
        </Flex>

        <Box>
          <Text variant="microcopy">
            Build #39 - Fórmula caja aleta simple actualizada
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};

export default hubspot.extend(({ context, actions }) => <PresuCard context={context} actions={actions} />);

