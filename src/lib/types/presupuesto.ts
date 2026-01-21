// Tipos para la integración con HubSpot
export interface HubSpotDeal {
  id: string;
  properties: {
    dealname: string;
    dealstage: string;
    amount?: string;
    closedate?: string;
    pipeline?: string;
    // Propiedades personalizadas de Market Paper
    mp_cliente_nombre?: string;
    mp_cliente_empresa?: string;
    mp_cliente_email?: string;
    mp_cliente_telefono?: string;
    mp_condiciones_entrega?: string;
    mp_condiciones_validez?: string;
    mp_condiciones_pago?: string;
    mp_total_subtotal?: string;
    mp_total_iva?: string;
    mp_total_final?: string;
    mp_metros_cuadrados_totales?: number;
    mp_items_json?: string; // JSON stringificado de los productos
    mp_tiene_items_a_cotizar?: string; // "true" o "false"
    mp_pdf_presupuesto_url?: string;
  };
  associations?: {
    contacts?: {
      results: Array<{
        id: string;
        type: string;
      }>;
    };
  };
  // Meta opcional agregada en el backend para facilitar la UI
  __assoc?: {
    contactIds?: string[];
    companyIdsFromDeal?: string[];
    companyIdsFromContacts?: string[];
    contactsCount?: number;
    companiesUniqueCount?: number;
    missingManyChatContact?: { id: string; properties: Record<string, any> } | null;
  };
}

export interface HubSpotDealsResponse {
  results: HubSpotDeal[];
  paging?: {
    next?: {
      after: string;
    };
  };
}

export interface HubSpotFileUploadResponse {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  created_at: string;
}

export interface DealUpdatePayload {
  dealId: string;
  properties: Record<string, string>;
  moveToStage?: boolean;
  targetStage?: string;
  items?: any[]; // Array de productos para crear Line Items
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

// Tipos para mapear datos del presupuesto a HubSpot
export interface PresupuestoToHubSpot {
  cliente: {
    nombre: string;
    empresa: string;
    email: string;
    telefono: string;
  };
  condiciones: {
    entrega: string;
    validez: string;
    pago: string;
  };
  totales: {
    subtotal: number;
    iva: number;
    total: number;
  };
  productos: Array<{
    id: string;
    descripcion: string;
    cantidad: number;
    precio: number;
    subtotal: number;
    aCotizar: boolean;
  }>;
  tieneItemsACotizar: boolean;
}