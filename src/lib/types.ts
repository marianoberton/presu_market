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
  tipo: 'caja' | 'plancha' | 'polimero';
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
  // Campos específicos para polímero
  colores?: number; // Cantidad de colores para polímero
  aCotizar?: boolean; // Indica si el precio es "A COTIZAR"
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
  { value: 'plancha', label: 'Plancha de Cartón' },
  { value: 'polimero', label: 'Polímero (Matricería)' }
] as const;

export const CALIDAD_OPTIONS = [
  "4 mm 90 lbs",
  "4 mm 110 lbs",
  "4 mm 130 lbs",
  "4 mm 150 lbs",
  "7 mm dt",
  "7 mm dt ref",
  "90 lbs 4 mm",
  "150 lbs 4mm",
  "4 mm",
  "90",
  "x unidad"
];

export const COLOR_OPTIONS = [
  "kraft",
  "blanco",
  "negro",
  "marron"
];

export const DESCRIPCION_OPTIONS = [
  "Cajas de cartón corrugado.",
  "Cajas de cartón corrugado. Aleta simpla onda c.",
  "Cajas de cartón corrugado. Aleta cruzada inferior. Onda C.",
  "Cajas de cartón corrugado. Aleta simple superior, aleta doble inferior. onda c.",
  "Cajas de cartón corrugado. CON IMPRESIÓN.",
  "Cajas de cartón corrugado. SIN IMPRESIÓN.",
  "Cajas de cartón corrugado impresa, polimero disponible.",
  "Plancha carton corrugado.",
  "Plancha lisa carton corrugado.",
  "Plancha trazada carton corrugado.",
  "Vaso De Polipapel Kraft/Blanco Con Tapa.",
  "Bolsas de papel kraft delivery.",
  "CAJA CC (en varias medidas, indicando paquetes).",
  "POLIMERO 1 COLOR / polimero un color.",
  "POLIMERO 1 O 2 COLOR (ENVIAR ARCHIVO DE DISEÑO).",
  "Sacabocado para troquelar."
];

export const DEFAULT_PRODUCT_VALUES = {
  tipo: 'caja' as const,
  calidad: "",
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