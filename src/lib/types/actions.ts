// Tipos para acciones de HubSpot (sin Custom Cards)

export interface DuplicateDealRequest {
  dealId: string;
}

export interface SendManyChatRequest {
  dealId: string;
  clienteNombre: string;
  clienteEmail?: string;
  clienteTelefono?: string;
  totalFinal: number;
  pdfUrl?: string;
}

export interface ActionResponse {
  ok: boolean;
  error?: string;
  message?: string;
  data?: unknown;
}

export interface HubSpotDealResponse {
  id: string;
  properties: Record<string, unknown>;
}