"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CondicionesData, CONDICIONES_PAGO_OPTIONS, CONDICIONES_ENTREGA_OPTIONS, CONDICIONES_FIJAS } from "@/lib/types";
import { useState, useEffect } from "react";

interface CondicionesComercialesFormProps {
  condiciones: CondicionesData;
  onChange: (condiciones: CondicionesData) => void;
}

export function CondicionesComercialesForm({ condiciones, onChange }: CondicionesComercialesFormProps) {
  const [previewText, setPreviewText] = useState({
    pago: '',
    entrega: ''
  });

  // Función para generar el texto de condiciones de pago
  const generatePaymentText = (tipoPago: string, textoLibre?: string) => {
    if (tipoPago === 'texto_libre') {
      return textoLibre || '';
    }
    
    const option = CONDICIONES_PAGO_OPTIONS.find(opt => opt.value === tipoPago);
    return option?.texto || '';
  };

  // Función para generar el texto de condiciones de entrega
  const generateDeliveryText = (tipoEntrega: string) => {
    const option = CONDICIONES_ENTREGA_OPTIONS.find(opt => opt.value === tipoEntrega);
    const baseText = option?.texto || '';
    
    return `${baseText}\n${CONDICIONES_FIJAS.entregaPalletizada}\n${CONDICIONES_FIJAS.enviosInterior}`;
  };

  // Actualizar preview cuando cambian los parámetros
  useEffect(() => {
    const pagoText = generatePaymentText(condiciones.tipoPago || 'anticipo_50', condiciones.textoLibrePago);
    const entregaText = generateDeliveryText(condiciones.tipoEntrega || 'produccion_15');
    
    setPreviewText({
      pago: pagoText,
      entrega: entregaText
    });

    // Actualizar las condiciones en el objeto principal
    onChange({
      ...condiciones,
      condicionesPago: pagoText,
      condicionesEntrega: entregaText,
      validez: CONDICIONES_FIJAS.validez
    });
  }, [condiciones.tipoPago, condiciones.tipoEntrega, condiciones.textoLibrePago]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTipoPagoChange = (value: string) => {
    onChange({
      ...condiciones,
      tipoPago: value as CondicionesData['tipoPago'],
      textoLibrePago: value === 'texto_libre' ? condiciones.textoLibrePago || '' : undefined
    });
  };

  const handleTipoEntregaChange = (value: string) => {
    onChange({
      ...condiciones,
      tipoEntrega: value as CondicionesData['tipoEntrega']
    });
  };

  const handleTextoLibreChange = (value: string) => {
    onChange({
      ...condiciones,
      textoLibrePago: value
    });
  };

  return (
    <div className="space-y-6">
      {/* Card de configuración de parámetros */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Condiciones Comerciales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Condiciones de Pago */}
          <div className="space-y-2">
            <Label htmlFor="tipoPago">Condiciones de Pago</Label>
            <Select 
              value={condiciones.tipoPago || 'anticipo_50'} 
              onValueChange={handleTipoPagoChange}
            >
              <SelectTrigger>
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

          {/* Texto libre para condiciones de pago */}
          {condiciones.tipoPago === 'texto_libre' && (
            <div className="space-y-2 mt-4">
              <Label htmlFor="textoLibrePago" className="text-sm font-medium">
                Texto personalizado para condiciones de pago
              </Label>
              <Textarea
                id="textoLibrePago"
                value={condiciones.textoLibrePago || ''}
                onChange={(e) => handleTextoLibreChange(e.target.value)}
                placeholder="Ingrese las condiciones de pago personalizadas..."
                rows={4}
                className="w-full min-h-[100px] border-2 border-gray-300 focus:border-blue-500"
              />
            </div>
          )}

          {/* Condiciones de Entrega */}
          <div className="space-y-2">
            <Label htmlFor="tipoEntrega">Condiciones de Entrega</Label>
            <Select 
              value={condiciones.tipoEntrega || 'produccion_15'} 
              onValueChange={handleTipoEntregaChange}
            >
              <SelectTrigger>
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

      {/* Card de vista previa */}
      <Card>
        <CardHeader>
          <CardTitle>Vista Previa de Condiciones Comerciales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preview Condiciones de Pago */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Condiciones de Pago:</Label>
            <div className="p-3 bg-gray-50 rounded-md border">
              <p className="text-sm whitespace-pre-line">{previewText.pago}</p>
            </div>
          </div>

          {/* Preview Condiciones de Entrega */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Condiciones de Entrega:</Label>
            <div className="p-3 bg-gray-50 rounded-md border">
              <p className="text-sm whitespace-pre-line">{previewText.entrega}</p>
            </div>
          </div>

          {/* Preview Validez */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Validez del Presupuesto:</Label>
            <div className="p-3 bg-gray-50 rounded-md border">
              <p className="text-sm">{CONDICIONES_FIJAS.validez}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}