"use client";

import { CondicionesData, CONDICIONES_PAGO_OPTIONS, CONDICIONES_ENTREGA_OPTIONS, CONDICIONES_FIJAS, VARIACION_CANTIDAD_OPTIONS } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";
import { useCallback } from 'react';

interface CondicionesFormProps {
  data: CondicionesData;
  onChange: (data: CondicionesData) => void;
}

export function CondicionesForm({ data, onChange }: CondicionesFormProps) {
  
  // Función para generar el texto completo de condiciones comerciales
  const generarAclaracionesTecnicas = useCallback((variacion: string | undefined) => {
    const porcentaje = variacion === '10' ? '10%' : '5%';
    const lineas = [
      'Las medidas cotizadas son medidas externas y dispuestas en largo x ancho x alto.',
      `La cantidad final de cajas a medida e impresas puede variar, no es exacta; la producción total se define al momento que se termina la producción, puede variar en un ${porcentaje}.`,
      'En caso de ser impresa, no trabajamos con Pantone, los colores se arman similares, pueden tener diferencias.',
      'En caso de descarga manual, deben contar con personal para realizarlo.'
    ];
    return lineas.join('\n');
  }, []);

  const generarTextoCompleto = useCallback((tipoPago: string, tipoEntrega: string, textoLibrePago?: string, variacionCantidad?: string) => {
    const opcionPago = CONDICIONES_PAGO_OPTIONS.find(opt => opt.value === tipoPago);
    const opcionEntrega = CONDICIONES_ENTREGA_OPTIONS.find(opt => opt.value === tipoEntrega);
    
    if (!opcionPago || !opcionEntrega) return;

    // Generar texto de condiciones de pago
    const textoPago = tipoPago === 'texto_libre' ? (textoLibrePago || '') : opcionPago.texto;

    // Generar texto de condiciones de entrega
    const textoEntrega = [
      opcionEntrega.texto,
      CONDICIONES_FIJAS.entregaCABA,
      CONDICIONES_FIJAS.entregaPalletizada,
      CONDICIONES_FIJAS.enviosInterior
    ].join('\n');

    // Generar aclaraciones técnicas según variación seleccionada
    const aclaraciones = generarAclaracionesTecnicas(variacionCantidad ?? data.variacionCantidad);

    // Actualizar los datos
    onChange({
      ...data,
      condicionesPago: textoPago,
      condicionesEntrega: textoEntrega,
      validez: CONDICIONES_FIJAS.validez,
      tipoPago: tipoPago as CondicionesData['tipoPago'],
      tipoEntrega: tipoEntrega as CondicionesData['tipoEntrega'],
      variacionCantidad: (variacionCantidad ?? data.variacionCantidad) as CondicionesData['variacionCantidad'],
      aclaracionesTecnicas: aclaraciones,
      textoLibrePago: tipoPago === 'texto_libre' ? (textoLibrePago ?? data.textoLibrePago ?? '') : undefined
    });
  }, [onChange, generarAclaracionesTecnicas]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePagoChange = (tipoPago: string) => {
    if (data.tipoEntrega) {
      generarTextoCompleto(tipoPago, data.tipoEntrega, data.textoLibrePago, data.variacionCantidad);
    } else {
      onChange({
        ...data,
        tipoPago: tipoPago as CondicionesData['tipoPago'],
        textoLibrePago: tipoPago === 'texto_libre' ? (data.textoLibrePago ?? '') : undefined
      });
    }
  };

  const handleEntregaChange = (tipoEntrega: string) => {
    if (data.tipoPago) {
      generarTextoCompleto(data.tipoPago, tipoEntrega, data.textoLibrePago, data.variacionCantidad);
    } else {
      onChange({
        ...data,
        tipoEntrega: tipoEntrega as CondicionesData['tipoEntrega']
      });
    }
  };

  const handleVariacionChange = (variacion: string) => {
    if (data.tipoPago && data.tipoEntrega) {
      generarTextoCompleto(data.tipoPago, data.tipoEntrega, data.textoLibrePago, variacion);
    } else {
      onChange({
        ...data,
        variacionCantidad: variacion as CondicionesData['variacionCantidad'],
        aclaracionesTecnicas: generarAclaracionesTecnicas(variacion)
      });
    }
  };

  const handleTextoLibreChange = (texto: string) => {
    const nuevo = {
      ...data,
      textoLibrePago: texto
    };
    onChange(nuevo);
    if (nuevo.tipoPago && nuevo.tipoEntrega) {
      generarTextoCompleto(nuevo.tipoPago, nuevo.tipoEntrega, texto, nuevo.variacionCantidad);
    }
  };

  // Generar texto automáticamente cuando ambos desplegables tienen valor
  useEffect(() => {
    if (data.tipoPago && data.tipoEntrega) {
      generarTextoCompleto(data.tipoPago, data.tipoEntrega, data.textoLibrePago, data.variacionCantidad);
    }
  }, [data.tipoPago, data.tipoEntrega, data.textoLibrePago, data.variacionCantidad]); // eslint-disable-line react-hooks/exhaustive-deps

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

        {data.tipoPago === 'texto_libre' && (
          <div className="space-y-2">
            <label htmlFor="textoLibrePago" className="block text-sm font-medium text-gray-700">
              Texto personalizado para condiciones de pago
            </label>
            <Textarea
              id="textoLibrePago"
              value={data.textoLibrePago || ''}
              onChange={(e) => handleTextoLibreChange(e.target.value)}
              placeholder="Ingrese las condiciones de pago personalizadas..."
              rows={4}
              className="w-full"
            />
          </div>
        )}

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

        {/* Variación Cantidad */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Variación Cantidad
          </label>
          <Select value={data.variacionCantidad || ""} onValueChange={handleVariacionChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar variación (5% o 10%)" />
            </SelectTrigger>
            <SelectContent>
              {VARIACION_CANTIDAD_OPTIONS.map((option) => (
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