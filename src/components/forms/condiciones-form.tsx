"use client";

import { CondicionesData, CONDICIONES_PAGO_OPTIONS, CONDICIONES_ENTREGA_OPTIONS, CONDICIONES_FIJAS } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";
import { useCallback } from 'react';

interface CondicionesFormProps {
  data: CondicionesData;
  onChange: (data: CondicionesData) => void;
}

export function CondicionesForm({ data, onChange }: CondicionesFormProps) {
  
  // Función para generar el texto completo de condiciones comerciales
  const generarTextoCompleto = useCallback((tipoPago: string, tipoEntrega: string) => {
     const opcionPago = CONDICIONES_PAGO_OPTIONS.find(op => op.value === tipoPago);
     const opcionEntrega = CONDICIONES_ENTREGA_OPTIONS.find(op => op.value === tipoEntrega);
    
    if (!opcionPago || !opcionEntrega) return;

    // Generar texto de condiciones de pago
    const textoPago = opcionPago.texto;

    // Generar texto de condiciones de entrega
    const textoEntrega = [
      opcionEntrega.texto,
      CONDICIONES_FIJAS.entregaCABA,
      CONDICIONES_FIJAS.entregaPalletizada,
      CONDICIONES_FIJAS.enviosInterior
    ].join('\n');

    // Actualizar los datos
    onChange({
      ...data,
      condicionesPago: textoPago,
      condicionesEntrega: textoEntrega,
      validez: CONDICIONES_FIJAS.validez,
      tipoPago: tipoPago as CondicionesData['tipoPago'],
      tipoEntrega: tipoEntrega as CondicionesData['tipoEntrega']
    });
  }, [data, onChange]);

  const handlePagoChange = (tipoPago: string) => {
    if (data.tipoEntrega) {
      generarTextoCompleto(tipoPago, data.tipoEntrega);
    } else {
      onChange({
        ...data,
        tipoPago: tipoPago as CondicionesData['tipoPago']
      });
    }
  };

  const handleEntregaChange = (tipoEntrega: string) => {
    if (data.tipoPago) {
      generarTextoCompleto(data.tipoPago, tipoEntrega);
    } else {
      onChange({
        ...data,
        tipoEntrega: tipoEntrega as CondicionesData['tipoEntrega']
      });
    }
  };

  // Generar texto automáticamente cuando ambos desplegables tienen valor
  useEffect(() => {
    if (data.tipoPago && data.tipoEntrega) {
      generarTextoCompleto(data.tipoPago, data.tipoEntrega);
    }
  }, [data.tipoPago, data.tipoEntrega, generarTextoCompleto]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Condiciones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        {/* Condiciones de Pago */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Condiciones de Pago
          </label>
          <Select value={data.tipoPago || ""} onValueChange={handlePagoChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar condición de pago" />
            </SelectTrigger>
            <SelectContent>
              {CONDICIONES_PAGO_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Condiciones de Entrega */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Condiciones de Entrega
          </label>
          <Select value={data.tipoEntrega || ""} onValueChange={handleEntregaChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar condición de entrega" />
            </SelectTrigger>
            <SelectContent>
              {CONDICIONES_ENTREGA_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}