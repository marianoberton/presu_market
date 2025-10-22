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
}

const PresuCard = () => {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [dealId, setDealId] = useState<string | null>(null);
  const [dealData, setDealData] = useState<DealData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // Función para agregar información de debug
  const addDebugInfo = (info: string) => {
    console.log('🔧 PresuCard:', info);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  // Obtener ID del deal al cargar
  useEffect(() => {
    const getDealId = async () => {
      try {
        addDebugInfo('=== INICIANDO OBTENCIÓN DE DEAL ID ===');
        
        // Verificar que hubspot esté disponible
        if (!hubspot) {
          throw new Error('HubSpot SDK no está disponible');
        }
        addDebugInfo('✅ HubSpot SDK disponible');
        
        // Verificar qué APIs están disponibles
        const availableAPIs = [];
        if (hubspot.crm) availableAPIs.push('crm');
        if (hubspot.context) availableAPIs.push('context');
        if (hubspot.actions) availableAPIs.push('actions');
        
        addDebugInfo(`APIs disponibles: ${availableAPIs.join(', ') || 'ninguna'}`);
        
        // Método 1: Intentar con hubspot.crm.record.getObjectId()
        if (hubspot.crm?.record?.getObjectId) {
          try {
            addDebugInfo('Intentando método 1: hubspot.crm.record.getObjectId()');
            const objectId = await hubspot.crm.record.getObjectId();
            if (objectId) {
              addDebugInfo(`✅ Método 1 exitoso - Deal ID: ${objectId}`);
              setDealId(objectId);
              setStatus('ready');
              return;
            }
          } catch (err) {
            addDebugInfo(`❌ Método 1 falló: ${err instanceof Error ? err.message : 'Error desconocido'}`);
          }
        } else {
          addDebugInfo('❌ Método 1 no disponible: hubspot.crm.record.getObjectId no existe');
        }

        // Método 2: Intentar con context
        if (hubspot.context?.getContext) {
          try {
            addDebugInfo('Intentando método 2: hubspot.context.getContext()');
            const context = await hubspot.context.getContext();
            addDebugInfo(`Context obtenido: ${JSON.stringify(context)}`);
            
            if (context?.crm?.objectId) {
              const objectId = context.crm.objectId;
              addDebugInfo(`✅ Método 2 exitoso - Deal ID: ${objectId}`);
              setDealId(objectId);
              setStatus('ready');
              return;
            }
          } catch (err) {
            addDebugInfo(`❌ Método 2 falló: ${err instanceof Error ? err.message : 'Error desconocido'}`);
          }
        } else {
          addDebugInfo('❌ Método 2 no disponible: hubspot.context.getContext no existe');
        }

        // Método 3: Usar un Deal ID de prueba para desarrollo
        addDebugInfo('Usando Deal ID de prueba para desarrollo');
        const testDealId = '12345678';
        setDealId(testDealId);
        addDebugInfo(`✅ Método 3 (prueba) - Deal ID: ${testDealId}`);
        setStatus('ready');
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        addDebugInfo(`❌ ERROR FINAL: ${errorMessage}`);
        console.error('🚨 PresuCard: Error obteniendo Deal ID:', err);
        setError(`Error obteniendo Deal ID: ${errorMessage}`);
        setStatus('error');
      }
    };

    getDealId();
  }, []);

  // Cargar datos del deal
  const loadDealData = async () => {
    if (!dealId) {
      addDebugInfo('No hay Deal ID disponible para cargar datos');
      return;
    }

    try {
      setStatus('loading');
      addDebugInfo(`Cargando datos del deal ${dealId}...`);
      
      // Intentar usar la API de HubSpot si está disponible
      if (hubspot.crm?.record?.getRecord) {
        try {
          const record = await hubspot.crm.record.getRecord({
            objectTypeId: 'deal',
            recordId: dealId,
            properties: ['dealname', 'amount', 'dealstage']
          });
          
          addDebugInfo('✅ Datos obtenidos con hubspot.crm.record.getRecord');
          setDealData(record.properties);
          setStatus('ready');
          return;
        } catch (err) {
          addDebugInfo(`❌ Error con API CRM: ${err instanceof Error ? err.message : 'Error desconocido'}`);
        }
      }

      // Fallback: datos de prueba
      addDebugInfo('⚠️ Usando datos de prueba');
      setDealData({
        dealname: `Deal de Prueba ${dealId}`,
        amount: '$10,000',
        dealstage: 'Qualified to Buy'
      });
      setStatus('ready');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      addDebugInfo(`❌ Error cargando datos: ${errorMessage}`);
      console.error('🚨 PresuCard: Error cargando datos:', err);
      setError(`Error cargando datos: ${errorMessage}`);
      setStatus('error');
    }
  };

  // Abrir presupuestador
  const openPresupuestador = () => {
    if (!dealId) {
      addDebugInfo('No hay Deal ID disponible para abrir presupuestador');
      return;
    }
    
    const baseUrl = 'https://presu-market.vercel.app/hubspot-integration';
    const url = `${baseUrl}?dealId=${dealId}`;
    
    addDebugInfo(`🚀 Intentando abrir presupuestador: ${url}`);
    
    // Usar hubspot.actions si está disponible, sino usar método alternativo
    if (hubspot.actions?.openUrl) {
      try {
        hubspot.actions.openUrl(url);
        addDebugInfo('✅ Abierto con hubspot.actions.openUrl');
      } catch (err) {
        addDebugInfo(`❌ Error con hubspot.actions.openUrl: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      }
    } else {
      addDebugInfo('⚠️ hubspot.actions.openUrl no disponible');
      // En un entorno real, esto podría usar postMessage o similar
      addDebugInfo(`URL generada: ${url}`);
    }
  };

  // Función de diagnóstico manual
  const runDiagnostic = async () => {
    addDebugInfo('=== DIAGNÓSTICO MANUAL COMPLETO ===');
    
    try {
      // Verificar APIs disponibles
      addDebugInfo(`hubspot disponible: ${!!hubspot}`);
      addDebugInfo(`hubspot.crm disponible: ${!!hubspot?.crm}`);
      addDebugInfo(`hubspot.crm.record disponible: ${!!hubspot?.crm?.record}`);
      addDebugInfo(`hubspot.crm.record.getObjectId disponible: ${!!hubspot?.crm?.record?.getObjectId}`);
      addDebugInfo(`hubspot.crm.record.getRecord disponible: ${!!hubspot?.crm?.record?.getRecord}`);
      addDebugInfo(`hubspot.context disponible: ${!!hubspot?.context}`);
      addDebugInfo(`hubspot.context.getContext disponible: ${!!hubspot?.context?.getContext}`);
      addDebugInfo(`hubspot.actions disponible: ${!!hubspot?.actions}`);
      addDebugInfo(`hubspot.actions.openUrl disponible: ${!!hubspot?.actions?.openUrl}`);
      
      // Verificar entorno
      addDebugInfo(`typeof window: ${typeof window}`);
      addDebugInfo(`typeof document: ${typeof document}`);
      
      // Intentar obtener contexto si está disponible
      if (hubspot?.context?.getContext) {
        try {
          const context = await hubspot.context.getContext();
          addDebugInfo(`Context completo: ${JSON.stringify(context, null, 2)}`);
        } catch (err) {
          addDebugInfo(`Error obteniendo context: ${err instanceof Error ? err.message : 'Error desconocido'}`);
        }
      }
      
      // Verificar todas las propiedades de hubspot
      if (hubspot) {
        const hubspotKeys = Object.keys(hubspot);
        addDebugInfo(`Propiedades de hubspot: ${hubspotKeys.join(', ')}`);
      }
      
    } catch (err) {
      addDebugInfo(`Error en diagnóstico: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
    
    addDebugInfo('=== FIN DIAGNÓSTICO ===');
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
        
        {dealId && (
          <Box>
            <Text variant="h4">📋 Información del Deal</Text>
            <Text>ID: {dealId}</Text>
            {dealData && (
              <Box>
                <Text>Nombre: {dealData.dealname || 'Sin nombre'}</Text>
                <Text>Monto: {dealData.amount || 'Sin monto'}</Text>
                <Text>Etapa: {dealData.dealstage || 'Sin etapa'}</Text>
              </Box>
            )}
          </Box>
        )}

        <Flex direction="row" gap="small" wrap="wrap">
          <Button 
            variant="primary" 
            onClick={openPresupuestador}
            disabled={!dealId}
          >
            🚀 Abrir Presupuestador
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={loadDealData}
            disabled={!dealId}
          >
            🔄 Cargar Datos
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={runDiagnostic}
          >
            🔍 Diagnóstico
          </Button>
        </Flex>

        {debugInfo.length > 0 && (
          <Box>
            <Text variant="h4">🐛 Log de Actividad</Text>
            <Box>
              {debugInfo.slice(-20).map((info, index) => (
                <Text key={index} variant="microcopy">
                  {info}
                </Text>
              ))}
            </Box>
          </Box>
        )}

        <Box>
          <Text variant="microcopy">
            Build #24 - Versión compatible con entorno HubSpot UI Extensions
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};

export default hubspot.extend(() => <PresuCard />);

