'use client';

import React, { useState, useEffect } from 'react';
import { PDFDocument } from '@/pdf/components/pdf-document';
import { mockPresupuestoData } from '@/lib/mock-data';
import { PresupuestoData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Eye, RefreshCw } from 'lucide-react';

export default function DevPreviewPage() {
  const [presupuestoData, setPresupuestoData] = useState<PresupuestoData>(mockPresupuestoData);
  const [showPDF, setShowPDF] = useState(true);
  const [PDFViewer, setPDFViewer] = useState<any>(null);
  const [PDFDownloadLink, setPDFDownloadLink] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Importación dinámica para evitar problemas de SSR
    import('@react-pdf/renderer').then((module) => {
      setPDFViewer(() => module.PDFViewer);
      setPDFDownloadLink(() => module.PDFDownloadLink);
    });
  }, []);

  const refreshData = () => {
    // Actualizar la fecha para simular un nuevo presupuesto
    setPresupuestoData({
      ...mockPresupuestoData,
      fecha: new Date().toLocaleDateString('es-AR')
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Vista Previa de Desarrollo - PDF Presupuesto
          </h1>
          <p className="text-gray-600">
            Aquí puedes ver y probar los cambios en el PDF sin necesidad de llenar el formulario completo.
          </p>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Controles de Vista Previa
            </CardTitle>
            <CardDescription>
              Herramientas para trabajar con el PDF de desarrollo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => setShowPDF(!showPDF)}
                variant={showPDF ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {showPDF ? 'Ocultar PDF' : 'Mostrar PDF'}
              </Button>
              
              <Button
                onClick={refreshData}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Actualizar Fecha
              </Button>

              {isClient && PDFDownloadLink && (
                <PDFDownloadLink
                  document={<PDFDocument data={presupuestoData} />}
                  fileName={`presupuesto-dev-${new Date().toISOString().split('T')[0]}.pdf`}
                >
                  {({ loading }: { loading: boolean }) => (
                    <Button
                      disabled={loading}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      {loading ? 'Generando...' : 'Descargar PDF'}
                    </Button>
                  )}
                </PDFDownloadLink>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Data Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Datos de Prueba Cargados</CardTitle>
            <CardDescription>
              Resumen de la información que se está usando para generar el PDF
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Cliente:</strong> {presupuestoData.cliente.nombre}
              </div>
              <div>
                <strong>Fecha:</strong> {presupuestoData.fecha}
              </div>
              <div>
                <strong>Productos:</strong> {presupuestoData.productos.length} items
              </div>
              <div>
                <strong>Subtotal:</strong> ${presupuestoData.totales.subtotal.toLocaleString('es-AR')}
              </div>
              <div>
                <strong>IVA:</strong> ${presupuestoData.totales.iva.toLocaleString('es-AR')}
              </div>
              <div>
                <strong>Total:</strong> ${presupuestoData.totales.total.toLocaleString('es-AR')}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PDF Viewer */}
        {showPDF && isClient && PDFViewer && (
          <Card>
            <CardHeader>
              <CardTitle>Vista Previa del PDF</CardTitle>
              <CardDescription>
                Visualización en tiempo real del documento PDF
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden" style={{ height: '800px' }}>
                <PDFViewer width="100%" height="100%">
                  <PDFDocument data={presupuestoData} />
                </PDFViewer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading message */}
        {showPDF && !isClient && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Cargando vista previa del PDF...</p>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Instrucciones de Uso</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
              <li>Usa esta página para ver los cambios en el PDF sin llenar formularios</li>
              <li>Los datos de prueba se cargan automáticamente desde <code>mock-data.ts</code></li>
              <li>Puedes ocultar/mostrar el PDF para mejorar el rendimiento mientras trabajas</li>
              <li>El botón "Actualizar Fecha" simula un nuevo presupuesto</li>
              <li>Usa "Descargar PDF" para obtener una copia del documento actual</li>
              <li>Modifica <code>mock-data.ts</code> para probar con diferentes datos</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}