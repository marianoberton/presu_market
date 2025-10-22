'use client';

import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { ClienteForm } from '@/components/forms/cliente-form';
import { ProductosForm } from '@/components/forms/productos-form';
import { CondicionesForm } from '@/components/forms/condiciones-form';
import { TotalesDisplay } from '@/components/forms/totales-display';
import { descargarPDF } from '@/pdf/utils/pdf-generator';
import { DEFAULT_CONDITIONS } from '@/lib/types';
import { ClienteData, ProductoData, CondicionesData, TotalesData, PresupuestoData } from '@/lib/types';
import { HubSpotDeal, ApiResponse } from '@/lib/types/presupuesto';
import { calcularTotales } from '@/lib/calculations';
import { Download, Upload } from 'lucide-react';

export default function Home() {
  const [datosCliente, setDatosCliente] = useState<ClienteData>({
    nombre: '',
    email: '',
    telefono: '',
    direccion: ''
  });

  const [productos, setProductos] = useState<ProductoData[]>([]);
  const [totales, setTotales] = useState<TotalesData>({
    subtotal: 0,
    iva: 0,
    total: 0
  });
  const [condiciones, setCondiciones] = useState<CondicionesData>(DEFAULT_CONDITIONS);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<HubSpotDeal | null>(null);
  const [enviandoHubSpot, setEnviandoHubSpot] = useState(false);

  // Recalcular totales cuando cambien los productos
  useEffect(() => {
    const nuevosTotales = calcularTotales(productos);
    setTotales(nuevosTotales);
  }, [productos]);

  const handleGenerarPDF = async () => {
    console.log('Iniciando generación de PDF...');
    console.log('Datos del cliente:', datosCliente);
    console.log('Productos:', productos);
    console.log('Condiciones:', condiciones);
    
    setGenerandoPDF(true);
    try {
      const presupuestoData: PresupuestoData = {
        cliente: datosCliente,
        productos,
        totales,
        condiciones: condiciones, // Usar condiciones configurables
        fecha: new Date().toLocaleDateString('es-AR')
      };

      console.log('Datos del presupuesto:', presupuestoData);
      await descargarPDF(presupuestoData);
      console.log('PDF generado exitosamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF: ' + (error as Error).message);
    } finally {
      setGenerandoPDF(false);
    }
  };

  const handleGenerarHubSpot = async () => {
    if (!selectedDeal) {
      alert('Por favor selecciona un deal de HubSpot');
      return;
    }

    console.log('Iniciando envío a HubSpot...');
    setEnviandoHubSpot(true);

    try {
      // 1. Generar PDF
      const presupuestoData: PresupuestoData = {
        cliente: datosCliente,
        productos,
        totales,
        condiciones,
        fecha: new Date().toLocaleDateString('es-AR')
      };

      // Generar PDF como blob
      const { pdf } = await import('@react-pdf/renderer');
      const { PDFDocument } = await import('@/pdf/components/pdf-document');
      const pdfBlob = await pdf(<PDFDocument data={presupuestoData} />).toBlob();

      // 2. Subir PDF a HubSpot
      const formData = new FormData();
      formData.append('file', pdfBlob, `presupuesto-${selectedDeal.properties.dealname}-${Date.now()}.pdf`);
      formData.append('fileName', `presupuesto-${selectedDeal.properties.dealname}-${Date.now()}.pdf`);

      const uploadResponse = await fetch('/api/hubspot/files', {
        method: 'POST',
        body: formData
      });

      const uploadResult: ApiResponse = await uploadResponse.json();
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Error al subir PDF');
      }

      const fileUrl = (uploadResult.data as { url: string }).url;

      // 3. Preparar datos para actualizar el deal
      const tieneItemsACotizar = productos.some(p => p.aCotizar);
      
      const updatePayload = {
        dealId: selectedDeal.id,
        properties: {
          // Campos estándar de HubSpot
          amount: totales.total.toString(), // Total final va al campo amount del deal
          
          // Propiedades personalizadas
          mp_cliente_nombre: datosCliente.nombre,
          mp_cliente_empresa: datosCliente.direccion, // Usando dirección como empresa por ahora
          mp_cliente_email: datosCliente.email,
          mp_cliente_telefono: datosCliente.telefono,
          mp_condiciones_entrega: condiciones.condicionesEntrega,
          mp_condiciones_validez: condiciones.validez,
          mp_condiciones_pago: condiciones.condicionesPago,
          mp_total_subtotal: totales.subtotal.toString(),
          mp_total_iva: totales.iva.toString(),
          mp_items_json: JSON.stringify(productos.map(p => ({
            descripcion: p.descripcion,
            cantidad: p.cantidad,
            precio: p.precio,
            subtotal: p.subtotal,
            aCotizar: p.aCotizar
          }))),
          mp_tiene_items_a_cotizar: tieneItemsACotizar.toString(),
          mp_pdf_presupuesto_url: fileUrl
        },
        moveToStage: true // Solo moverá si no hay items a cotizar
      };

      // 4. Actualizar deal en HubSpot
      const updateResponse = await fetch('/api/hubspot/deal/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatePayload)
      });

      const updateResult: ApiResponse = await updateResponse.json();
      if (!updateResult.success) {
        throw new Error(updateResult.error || 'Error al actualizar deal');
      }

      console.log('Presupuesto enviado exitosamente a HubSpot');
      
      // Mostrar mensaje de éxito
      const mensaje = tieneItemsACotizar 
        ? 'Presupuesto enviado a HubSpot. El deal no se movió de etapa porque contiene items a cotizar.'
        : 'Presupuesto enviado a HubSpot y deal actualizado exitosamente.';
      
      alert(mensaje);

      // Limpiar selección de deal
      setSelectedDeal(null);

    } catch (error) {
      console.error('Error al enviar a HubSpot:', error);
      alert('Error al enviar a HubSpot: ' + (error as Error).message);
    } finally {
      setEnviandoHubSpot(false);
    }
  };

  const esFormularioValido = () => {
    const clienteValido = datosCliente?.nombre?.trim() !== '' &&
      datosCliente?.email?.trim() !== '' &&
      datosCliente?.telefono?.trim() !== '' &&
      datosCliente?.direccion?.trim() !== '';
    
    const productosValidos = productos.length > 0 &&
      productos.every(p => {
        // Para productos polímero, solo requiere descripción
        if (p.tipo === 'polimero') {
          return p.descripcion?.trim() !== '';
        }
        // Para otros productos, requiere descripción y precio > 0
        return p.descripcion?.trim() !== '' && p.precio > 0;
      });
    
    console.log('Validación del formulario:');
    console.log('- Cliente válido:', clienteValido);
    console.log('- Productos válidos:', productosValidos);
    console.log('- Datos cliente:', datosCliente);
    console.log('- Productos:', productos);
    
    return clienteValido && productosValidos;
  };

  const esFormularioValidoParaHubSpot = () => {
    return esFormularioValido() && selectedDeal !== null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="shadow-sm border-b" style={{backgroundColor: '#2E9FEF'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-2 rounded-lg">
                <img 
                  src="/MARKET-PAPER-LOGO-CURVAS_Mesa-de-trabajo-1-3-e1726845431314-1400x571 (1).png" 
                  alt="Market Paper Logo" 
                  className="h-8 w-auto"
                />
              </div>
              <h1 className="text-lg font-bold text-white">Generador de presupuestos</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Datos del Cliente */}
          <ClienteForm 
            data={datosCliente} 
            onChange={setDatosCliente} 
            selectedDeal={selectedDeal}
            onDealSelected={setSelectedDeal}
            enviandoHubSpot={enviandoHubSpot}
          />

          {/* Items */}
          <ProductosForm 
            productos={productos} 
            onChange={setProductos} 
          />

          {/* Condiciones Comerciales y Resumen - Lado a lado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Condiciones Comerciales - Izquierda */}
            <CondicionesForm 
              data={condiciones} 
              onChange={setCondiciones} 
            />

            {/* Resumen y Botones - Derecha */}
            <div className="space-y-4">
              {/* Totales */}
              <TotalesDisplay totales={totales} productos={productos} />

              {/* Botones */}
              <div className="grid grid-cols-2 gap-3">
                {/* Botón de Descarga - Izquierda */}
                <Button 
                  onClick={handleGenerarPDF}
                  disabled={!esFormularioValido()}
                  variant="outline"
                  size="lg"
                  className="w-full flex items-center justify-center text-gray-900 hover:text-black"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {generandoPDF ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                      Generando...
                    </span>
                  ) : (
                    <span>Descargar</span>
                  )}
                </Button>

                {/* Botón de HubSpot - Derecha */}
                <Button 
                  onClick={handleGenerarHubSpot}
                  disabled={!esFormularioValidoParaHubSpot() || enviandoHubSpot}
                  size="lg"
                  className="w-full flex items-center justify-center"
                >
                  {enviandoHubSpot ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </span>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      <span>Generar y Enviar</span>
                      <img 
                        src="/hubspot-1.svg" 
                        alt="HubSpot" 
                        className="ml-2 h-4 w-4"
                      />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
