import React from 'react';
import { Card } from '@/components/ui/card';
import { calcularMedidasProduccion, generarLabelsCalculos } from '@/lib/calculations';

interface MedidasProduccionProps {
  largo: number;
  ancho: number;
  alto: number;
  tipo: 'caja-aleta-simple' | 'plancha' | 'bandeja' | 'cerco' | 'caja-aleta-cruzada-x1' | 'caja-aleta-cruzada-x2' | 'base-telescopica' | 'tapa-telescopica' | 'polimero' | 'sacabocado' | 'dos-planchas-una-caja';
}

export const MedidasProduccion: React.FC<MedidasProduccionProps> = ({
  largo,
  ancho,
  alto,
  tipo
}) => {
  // Cálculos de medidas de producción usando la función centralizada
  const medidas = calcularMedidasProduccion(largo, ancho, alto, tipo);
  
  // Generar labels explicativas dinámicas
  const labels = generarLabelsCalculos(largo, ancho, alto, tipo);

  return (
    <Card className="p-4 bg-gray-50">
      <h4 className="font-semibold text-sm mb-3 text-gray-700">
        Medidas de Producción - {tipo.charAt(0).toUpperCase() + tipo.slice(1).replace(/-/g, ' ')}
      </h4>
      
      <div className="grid grid-cols-3 gap-4 text-sm mb-4">
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Largo</div>
          <div className="font-medium text-blue-600">
            {medidas.largoProduccion.toFixed(1)} cm
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {labels.largoLabel}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Ancho</div>
          <div className="font-medium text-blue-600">
            {medidas.anchoProduccion.toFixed(1)} cm
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {labels.anchoLabel}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Superficie</div>
          <div className="font-medium text-green-600">
            {medidas.superficie.toFixed(4)} m²
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {tipo === 'dos-planchas-una-caja'
              ? `(${medidas.largoProduccion.toFixed(1)} × ${medidas.anchoProduccion.toFixed(1)} ÷ 1M × 2 planchas)`
              : `(${medidas.largoProduccion.toFixed(1)} × ${medidas.anchoProduccion.toFixed(1)} ÷ 1M)`}
          </div>
        </div>
      </div>
    </Card>
  );
};