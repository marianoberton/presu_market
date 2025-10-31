"use client";

import { ClienteData } from "@/lib/types";
import { HubSpotDeal } from "@/lib/types/presupuesto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import DealSelector from "./deal-selector";
import { useEffect } from "react";

interface ClienteFormProps {
  data: ClienteData;
  onChange: (data: ClienteData) => void;
  selectedDeal?: HubSpotDeal | null;
  onDealSelected?: (deal: HubSpotDeal | null) => void;
  enviandoHubSpot?: boolean;
}

export function ClienteForm({ data, onChange, selectedDeal, onDealSelected, enviandoHubSpot }: ClienteFormProps) {
  // Asegurar que data tenga valores por defecto
  const clienteData = {
    nombre: data?.nombre || '',
    email: data?.email || '',
    telefono: data?.telefono || '',
    direccion: data?.direccion || ''
  };

  // Auto-completar datos del cliente cuando se selecciona un deal
  useEffect(() => {
    if (selectedDeal && selectedDeal.properties) {
      const dealProps = selectedDeal.properties;
      
      // Solo auto-completar si los campos están vacíos
      const updatedData: ClienteData = { ...data };
      let hasChanges = false;

      if (!data.nombre && dealProps.mp_cliente_nombre) {
        updatedData.nombre = dealProps.mp_cliente_nombre;
        hasChanges = true;
      }

      if (!data.email && dealProps.mp_cliente_email) {
        updatedData.email = dealProps.mp_cliente_email;
        hasChanges = true;
      }

      if (!data.telefono && dealProps.mp_cliente_telefono) {
        updatedData.telefono = dealProps.mp_cliente_telefono;
        hasChanges = true;
      }

      if (hasChanges) {
        onChange(updatedData);
      }
    }
  }, [selectedDeal]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (field: keyof ClienteData, value: string) => {
    onChange({
      ...clienteData,
      [field]: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Datos del Cliente</CardTitle>
          {onDealSelected && (
            <DealSelector 
              selectedDeal={selectedDeal}
              onDealSelected={onDealSelected}
              disabled={enviandoHubSpot}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Cliente *
            </label>
            <Input
              id="nombre"
              type="text"
              placeholder="Ej: Universal Fitness"
              value={clienteData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Ej: contacto@empresa.com"
              value={clienteData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono *
            </label>
            <Input
              id="telefono"
              type="tel"
              placeholder="Ej: +54 11 1234-5678"
              value={clienteData.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
              Dirección *
            </label>
            <Input
              id="direccion"
              type="text"
              placeholder="Ej: Av. Corrientes 1234, CABA"
              value={clienteData.direccion}
              onChange={(e) => handleChange('direccion', e.target.value)}
              required
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}