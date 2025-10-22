import React, { useState, useEffect } from 'react';
import {
  hubspot,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Button,
  Flex,
  Text,
  Section,
  Alert,
  LoadingSpinner
} from '@hubspot/ui-extensions';

const PresuCard = () => {
  const [presupuestos, setPresupuestos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dealId, setDealId] = useState(null);

  // Obtener dealId del contexto de la extensión
  useEffect(() => {
    hubspot.crm.record.getObjectId().then((id) => {
      setDealId(id);
    });
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    if (dealId) {
      loadData();
    }
  }, [dealId]);

  // Utilidad para llamar funciones serverless
  const callServerless = async (name, parameters) => {
    try {
      const result = await hubspot.actions.runServerlessFunction({
        name,
        parameters
      });
      return result;
    } catch (error) {
      console.error(`Error calling serverless function ${name}:`, error);
      throw error;
    }
  };

  const loadData = async () => {
    if (!dealId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Llamar a la función serverless presu-get
      const result = await callServerless("presu-get", { dealId });
      
      if (result.ok) {
        setPresupuestos(result.items || []);
      } else {
        setError(result.error || 'Error al cargar presupuestos');
      }
    } catch (err) {
      setError('Error de conexión: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const enviarPorWhatsApp = async (presuId) => {
    if (!dealId || !presuId) return;
    
    setLoading(true);
    
    try {
      // Llamar a la función serverless presu-send
      const result = await callServerless("presu-send", { dealId, presuId });
      
      if (result.ok) {
        // Mostrar notificación de éxito
        alert('Presupuesto enviado por WhatsApp exitosamente');
      } else {
        alert('Error al enviar: ' + (result.error || 'Error desconocido'));
      }
    } catch (err) {
      alert('Error de conexión: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Section>
        <Flex direction="column" align="center" gap="medium">
          <LoadingSpinner />
          <Text>Cargando presupuestos...</Text>
        </Flex>
      </Section>
    );
  }

  return (
    <Section>
      <Flex direction="column" gap="medium">
        <Flex justify="space-between" align="center">
          <Text variant="h3">Presupuestos del Deal</Text>
          <Button 
            variant="primary" 
            onClick={loadData}
            disabled={loading}
          >
            Sincronizar
          </Button>
        </Flex>

        {error && (
          <Alert variant="error">
            {error}
          </Alert>
        )}

        {presupuestos.length === 0 && !error ? (
          <Text>No hay presupuestos disponibles para este deal.</Text>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>ID</TableHeader>
                <TableHeader>Fecha</TableHeader>
                <TableHeader>Total</TableHeader>
                <TableHeader>Estado</TableHeader>
                <TableHeader>Acciones</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {presupuestos.map((presu) => (
                <TableRow key={presu.id}>
                  <TableCell>{presu.id}</TableCell>
                  <TableCell>{presu.fecha || 'N/A'}</TableCell>
                  <TableCell>{presu.total || 'N/A'}</TableCell>
                  <TableCell>{presu.estado || 'Pendiente'}</TableCell>
                  <TableCell>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => enviarPorWhatsApp(presu.id)}
                      disabled={loading}
                    >
                      Enviar por WhatsApp
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Flex>
    </Section>
  );
};

export default PresuCard;
