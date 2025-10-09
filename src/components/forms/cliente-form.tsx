"use client";

import { ClienteData } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ClienteFormProps {
  data: ClienteData;
  onChange: (data: ClienteData) => void;
}

export function ClienteForm({ data, onChange }: ClienteFormProps) {
  // Asegurar que data tenga valores por defecto
  const clienteData = {
    nombre: data?.nombre || '',
    email: data?.email || '',
    telefono: data?.telefono || '',
    direccion: data?.direccion || ''
  };

  const handleChange = (field: keyof ClienteData, value: string) => {
    onChange({
      ...clienteData,
      [field]: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Datos del Cliente</CardTitle>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
             <img 
               src="/hubspot-1.svg" 
               alt="HubSpot" 
               className="h-4 w-4"
             />
             Seleccionar Cliente
           </Button>
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