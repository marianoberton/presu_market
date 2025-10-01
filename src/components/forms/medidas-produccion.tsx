import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface MedidasProduccionProps {
  largo: number;
  ancho: number;
  alto: number;
  precio: number;
  remarcacion: number;
  onPrecioChange: (precio: number) => void;
  onRemarcacionChange: (remarcacion: number) => void;
}

export const MedidasProduccion: React.FC<MedidasProduccionProps> = ({
  largo,
  ancho,
  alto,
  precio,
  remarcacion,
  onPrecioChange,
  onRemarcacionChange
}) => {
  // Estados locales para permitir entrada libre
  const [precioInput, setPrecioInput] = useState(precio.toString());
  const [remarcacionInput, setRemarcacionInput] = useState(remarcacion.toString());

  // Sincronizar con props cuando cambien externamente
  useEffect(() => {
    setPrecioInput(precio.toString());
  }, [precio]);

  useEffect(() => {
    setRemarcacionInput(remarcacion.toString());
  }, [remarcacion]);

  // Cálculos de medidas de producción
  const largoProduccion = largo * 2 + ancho * 2 + 50;
  const anchoProduccion = ancho + alto;
  const superficie = (largoProduccion * anchoProduccion) / 1000000;

  return (
    <Card className="p-4 bg-gray-50">
      <h4 className="font-semibold text-sm mb-3 text-gray-700">
        Medidas de Producción
      </h4>
      
      <div className="grid grid-cols-3 gap-4 text-sm mb-4">
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Largo</div>
          <div className="font-medium text-blue-600">
            {largoProduccion.toFixed(1)} cm
          </div>
          <div className="text-xs text-gray-400 mt-1">
            ({largo}×2 + {ancho}×2 + 50)
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Ancho</div>
          <div className="font-medium text-blue-600">
            {anchoProduccion.toFixed(1)} cm
          </div>
          <div className="text-xs text-gray-400 mt-1">
            ({ancho} + {alto})
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Superficie</div>
          <div className="font-medium text-green-600">
            {superficie.toFixed(4)} m²
          </div>
          <div className="text-xs text-gray-400 mt-1">
            ({largoProduccion.toFixed(1)} × {anchoProduccion.toFixed(1)} ÷ 1M)
          </div>
        </div>
      </div>

      {/* Campos manuales para precio y remarcación */}
      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Precio ($/m²)
          </label>
          <Input
            type="text"
            value={precioInput}
            onChange={(e) => {
              const inputValue = e.target.value;
              setPrecioInput(inputValue);
              
              // Solo actualizar el estado padre si es un número válido
              if (inputValue === '') {
                onPrecioChange(0);
              } else {
                const value = parseFloat(inputValue);
                if (!isNaN(value)) {
                  onPrecioChange(value);
                }
              }
            }}
            placeholder="0.00"
            className="text-sm"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Remarcación
          </label>
          <Input
            type="text"
            value={remarcacionInput}
            onChange={(e) => {
              const inputValue = e.target.value;
              setRemarcacionInput(inputValue);
              
              // Solo actualizar el estado padre si es un número válido
              if (inputValue === '') {
                onRemarcacionChange(0);
              } else {
                const value = parseFloat(inputValue);
                if (!isNaN(value)) {
                  onRemarcacionChange(value);
                }
              }
            }}
            placeholder="1.5"
            className="text-sm"
          />
        </div>
      </div>
    </Card>
  );
};