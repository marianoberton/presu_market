"use client";

import { TotalesData } from "@/lib/types";
import { formatearMoneda } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TotalesDisplayProps {
  totales: TotalesData;
}

export function TotalesDisplay({ totales }: TotalesDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Resumen del Presupuesto</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
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