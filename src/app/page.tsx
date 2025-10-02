'use client';

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { ClienteForm } from '@/components/forms/cliente-form';
import { ProductosForm } from '@/components/forms/productos-form';
import { TotalesDisplay } from '@/components/forms/totales-display';
import { ClienteData, ProductoData, TotalesData, PresupuestoData, DEFAULT_CONDITIONS } from '@/lib/types';
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
        condiciones: DEFAULT_CONDITIONS, // Usar condiciones fijas
        fecha: new Date().toLocaleDateString('es-AR')
      };

      const { descargarPDF } = await import('@/pdf/utils/pdf-generator');
      await descargarPDF(presupuestoData);
    } catch (error) {
      console.error('Error al generar PDF:', error);
    } finally {
      setGenerandoPDF(false);
    }
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
          <ClienteForm 
            data={datosCliente} 
            onChange={setDatosCliente} 
          />

          {/* Items */}
          <ProductosForm 
            productos={productos} 
            onChange={setProductos} 
          />

          {/* Resumen y Botón de Descarga - Abajo a la derecha */}
          <div className="flex justify-end">
            <div className="w-full max-w-md space-y-4">
              {/* Totales */}
              <TotalesDisplay totales={totales} productos={productos} />

              {/* Botón de Descarga */}
              <Button 
                onClick={handleGenerarPDF}
                disabled={!esFormularioValido() || generandoPDF}
                className="w-full"
                size="lg"
              >
                {generandoPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generando PDF...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar Presupuesto
                  </>
                )}
              </Button>
              
              {!esFormularioValido() && (
                <p className="text-sm text-gray-500 text-center">
                  Complete todos los campos requeridos para generar el presupuesto
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
