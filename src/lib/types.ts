// Tipos principales para el generador de presupuestos

export interface ClienteData {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
}

export interface ProductoData {
  id: string;
  descripcion: string;
  tipo: 'caja' | 'plancha';
  largo: number;
  ancho: number;
  alto: number;
  calidad: string;
  color: string;
  cantidad: number;
  precio: number;
  remarcacion: number;
  precioUnitario: number;
  subtotal: number;
}

export interface CondicionesData {
  condicionesPago: string;
  condicionesEntrega: string;
  validez: string;
}

export interface TotalesData {
  subtotal: number;
  iva: number;
  total: number;
}

export interface PresupuestoData {
  cliente: ClienteData;
  productos: ProductoData[];
  condiciones: CondicionesData;
  totales: TotalesData;
  fecha: string;
}

// Tipos para formularios
export interface FormErrors {
  cliente?: Partial<ClienteData>;
  productos?: { [key: string]: Partial<ProductoData> };
  condiciones?: Partial<CondicionesData>;
}

// Constantes
export const IVA_PERCENTAGE = 0.21;

// Opciones por defecto para productos
export const TIPO_PRODUCTO_OPTIONS = [
  { value: 'caja', label: 'Caja' },
  { value: 'plancha', label: 'Plancha de Cartón' }
] as const;

export const CALIDAD_OPTIONS = [
  "4mm 90lbs",
  "3mm 80lbs", 
  "5mm 100lbs",
  "6mm 120lbs"
];

export const COLOR_OPTIONS = [
  "kraft",
  "blanco",
  "negro",
  "marron"
];

export const DEFAULT_PRODUCT_VALUES = {
  tipo: 'caja' as const,
  calidad: "4mm 90lbs",
  color: "kraft",
  precio: 1000,
  remarcacion: 1.5
};

export const DEFAULT_CONDITIONS: CondicionesData = {
  condicionesPago: "50% anticipo por transferencia bancaria. Una vez acreditado el importe se toma el pedido. Enviar OC.\nEl resto del pago, 48 hs previo a la entrega. Una vez acreditado se coordina entrega.",
  condicionesEntrega: "Presupuesto contempla una entrega CABA, por el total del presupuesto.\nDemora producción 15 días aprox. Pedir contemplando esta anticipación.\nLa mercadería se entrega palletizada.\nEnvíos al interior: Entregamos en el transporte que ustedes trabajen dentro del radio de CABA.",
  validez: "El presente presupuesto tiene una validez de 48 hs desde su emisión, vencido ese plazo se vuelve a cotizar."
};

export const COMPANY_INFO = {
  name: "Market Paper",
  phone: "+54 11 1234-5678",
  email: "info@marketpaper.com.ar",
  website: "www.marketpaper.com.ar"
};