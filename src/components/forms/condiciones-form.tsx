"use client";

import { CondicionesData } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface CondicionesFormProps {
  data: CondicionesData;
  onChange: (data: CondicionesData) => void;
}

export function CondicionesForm({ data, onChange }: CondicionesFormProps) {
  const handleChange = (field: keyof CondicionesData, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Condiciones Comerciales</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="pago" className="block text-sm font-medium text-gray-700 mb-1">
            Condiciones de Pago
          </label>
          <Textarea
            id="pago"
            placeholder="Condiciones de pago..."
            value={data.pago}
            onChange={(e) => handleChange('pago', e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="entrega" className="block text-sm font-medium text-gray-700 mb-1">
            Condiciones de Entrega
          </label>
          <Textarea
            id="entrega"
            placeholder="Condiciones de entrega..."
            value={data.entrega}
            onChange={(e) => handleChange('entrega', e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="validez" className="block text-sm font-medium text-gray-700 mb-1">
            Validez del Presupuesto
          </label>
          <Input
            id="validez"
            type="text"
            placeholder="Validez del presupuesto..."
            value={data.validez}
            onChange={(e) => handleChange('validez', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}