"use client";

import { TotalesData, ProductoData } from "@/lib/types";
import { formatearMoneda } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TotalesDisplayProps {
  totales: TotalesData;
  productos: ProductoData[];
}

export function TotalesDisplay({ totales, productos }: TotalesDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Resumen del Presupuesto</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Desglose del subtotal por producto */}
          {productos.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Desglose por Item:</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {productos.map((producto, index) => (
                  <div key={producto.id} className="flex justify-between items-center text-xs text-gray-600 py-1">
                    <span className="truncate max-w-[200px]">
                      {index + 1}. {producto.descripcion || 'Sin descripción'} (x{producto.cantidad})
                      {producto.tipo === 'polimero' && (
                        <span className="text-orange-600 font-medium ml-1">(A COTIZAR)</span>
                      )}
                    </span>
                    <span className="font-medium ml-2">
                      {producto.tipo === 'polimero' ? 'A COTIZAR' : formatearMoneda(producto.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 mt-2 pt-2"></div>
              {productos.some(p => p.tipo === 'polimero') && (
                <div className="text-xs text-orange-600 mt-1">
                  * Los productos &quot;A COTIZAR&quot; no se incluyen en el total del presupuesto
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Subtotal:</span>
            <span className="font-medium">{formatearMoneda(totales.subtotal)}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">IVA (21%):</span>
            <span className="font-medium">{formatearMoneda(totales.iva)}</span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-t-2 border-gray-200">
            <span className="text-lg font-semibold text-gray-900">Total:</span>
            <span className="text-xl font-bold text-blue-600">{formatearMoneda(totales.total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}