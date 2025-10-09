'use client';

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { ClienteForm } from '@/components/forms/cliente-form'
import { ProductosForm } from '@/components/forms/productos-form'
import { CondicionesForm } from '@/components/forms/condiciones-form'
import { TotalesDisplay } from '@/components/forms/totales-display'
import { descargarPDF } from '@/pdf/utils/pdf-generator'
import { DEFAULT_CONDITIONS } from '@/lib/types'
import type { ClienteData, ProductoData, CondicionesData, TotalesData, PresupuestoData } from '@/lib/types';
import { calcularTotales } from '@/lib/calculations';
import { Download } from 'lucide-react';

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

  // Recalcular totales cuando cambien los productos
  useEffect(() => {
    const nuevosTotales = calcularTotales(productos);
    setTotales(nuevosTotales);
  }, [productos]);

  const handleGenerarPDF = async () => {
    setGenerandoPDF(true);
    try {
      const presupuestoData: PresupuestoData = {
        cliente: datosCliente,
        productos,
        totales,
        condiciones: condiciones, // Usar condiciones configurables
        fecha: new Date().toLocaleDateString('es-AR')
      };

      await descargarPDF(presupuestoData);
    } catch (error) {
      console.error('Error al generar PDF:', error);
    } finally {
      setGenerandoPDF(false);
    }
  };

  const handleGenerarHubSpot = () => {
    // Ruta de desarrollo para HubSpot - actualizada al puerto correcto
    const hubspotUrl = 'http://localhost:3001/hubspot-integration';
    window.open(hubspotUrl, '_blank');
  };

  const esFormularioValido = () => {
    return (
      datosCliente?.nombre?.trim() !== '' &&
      datosCliente?.email?.trim() !== '' &&
      datosCliente?.telefono?.trim() !== '' &&
      datosCliente?.direccion?.trim() !== '' &&
      productos.length > 0 &&
      productos.every(p => {
        // Para productos polímero, solo requiere descripción
        if (p.tipo === 'polimero') {
          return p.descripcion?.trim() !== '';
        }
        // Para otros productos, requiere descripción y precio > 0
        return p.descripcion?.trim() !== '' && p.precio > 0;
      })
    );
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
          <ClienteForm data={datosCliente} onChange={setDatosCliente} />

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
                  disabled={!esFormularioValido()}
                  size="lg"
                  className="w-full flex items-center justify-center"
                >
                  <span>Generar</span>
                  <img 
                    src="/hubspot-1.svg" 
                    alt="HubSpot" 
                    className="ml-2 h-6 w-6"
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
