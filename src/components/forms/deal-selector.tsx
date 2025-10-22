'use client';

import { useState, useEffect } from 'react';
import { HubSpotDeal, HubSpotDealsResponse, ApiResponse } from '@/lib/types/presupuesto';
import { Check } from 'lucide-react';

interface DealSelectorProps {
  onDealSelected: (deal: HubSpotDeal | null) => void;
  selectedDeal?: HubSpotDeal | null;
  disabled?: boolean;
}

export default function DealSelector({ onDealSelected, selectedDeal, disabled = false }: DealSelectorProps) {
  const [deals, setDeals] = useState<HubSpotDeal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/hubspot/deals');
      const result: ApiResponse<HubSpotDealsResponse> = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error al cargar deals');
      }

      setDeals(result.data?.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error al cargar deals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDealChange = (dealId: string) => {
    if (dealId === '') {
      onDealSelected(null);
      return;
    }

    const deal = deals.find(d => d.id === dealId);
    onDealSelected(deal || null);
  };

  const formatDealName = (deal: HubSpotDeal) => {
    const name = deal.properties.dealname || 'Sin nombre';
    const cliente = deal.properties.mp_cliente_nombre || deal.properties.mp_cliente_empresa;
    const amount = deal.properties.amount ? ` - $${deal.properties.amount}` : '';
    
    return cliente ? `${name} (${cliente})${amount}` : `${name}${amount}`;
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Deal de HubSpot
        </label>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-500">Cargando deals...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Deal de HubSpot
        </label>
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={loadDeals}
              className="text-sm text-red-600 hover:text-red-800 underline"
              disabled={loading}
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor="deal-selector" className="block text-sm font-medium text-gray-700">
        Deal de HubSpot
        <span className="text-gray-500 text-xs ml-1">
          ({deals.length} deals disponibles)
        </span>
      </label>
      
      <div className="flex items-center gap-3">
        <select
          id="deal-selector"
          value={selectedDeal?.id || ''}
          onChange={(e) => handleDealChange(e.target.value)}
          disabled={disabled || deals.length === 0}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed h-10"
        >
          <option value="">Seleccionar deal...</option>
          {deals.map((deal) => (
            <option key={deal.id} value={deal.id}>
              {formatDealName(deal)}
            </option>
          ))}
        </select>
        
        <div className="w-6 h-10 flex items-center justify-center flex-shrink-0">
          {selectedDeal && (
            <Check className="h-5 w-5 text-green-600" />
          )}
        </div>
      </div>

      {deals.length === 0 && !loading && (
        <p className="text-sm text-gray-500 italic">
          No hay deals en etapa inicial disponibles
        </p>
      )}
    </div>
  );
}