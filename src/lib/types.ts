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
  tipo: 'caja-aleta-simple' | 'plancha' | 'bandeja' | 'cerco' | 'caja-aleta-cruzada-x1' | 'caja-aleta-cruzada-x2' | 'base-telescopica' | 'tapa-telescopica' | 'polimero' | 'sacabocado';
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
  // Campos para los desplegables
  tipoPago?: 'echeq_15' | 'echeq_30' | 'echeq_45' | 'anticipo_50' | 'cta_cte_7' | 'cta_cte_30' | 'cta_cte_60' | 'texto_libre';
  tipoEntrega?: 'produccion_15' | 'stock_48_72';
  // Campo para texto libre de condiciones de pago
  textoLibrePago?: string;
}

export interface TotalesData {
  subtotal: number;
  iva: number;
  total: number;
  metrosCuadradosTotales: number; // m² totales del presupuesto
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
  { value: 'caja-aleta-simple', label: 'Caja aleta simple' },
  { value: 'plancha', label: 'Plancha' },
  { value: 'bandeja', label: 'Bandeja' },
  { value: 'cerco', label: 'Cerco' },
  { value: 'caja-aleta-cruzada-x1', label: 'Caja aleta cruzada x 1' },
  { value: 'caja-aleta-cruzada-x2', label: 'Caja aleta cruzada x 2' },
  { value: 'base-telescopica', label: 'Base telescópica' },
  { value: 'tapa-telescopica', label: 'Tapa telescópica' },
  { value: 'polimero', label: 'Polímero' },
  { value: 'sacabocado', label: 'Sacabocado' }
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
  tipo: 'caja-aleta-simple' as const,
  calidad: "",
  color: "kraft",
  precio: 1000,
  remarcacion: 1
};

export const DEFAULT_CONDITIONS: CondicionesData = {
  condicionesPago: "50% anticipo por transferencia bancaria. Una vez acreditado el importe se toma el pedido. Enviar OC.\nEl resto del pago, 48 hs previo a la entrega. Una vez acreditado se coordina entrega.",
  condicionesEntrega: "Demora producción 15 días aprox.\nLa mercadería se entrega palletizada. Debe contar con personal para la descarga.\nEnvíos al interior. Entregamos en el transporte que ustedes trabajen dentro del radio de CABA.",
  validez: "El presente presupuesto tiene una validez de 48 hs desde su emisión, vencido ese plazo se vuelve a cotizar.",
  // Valores por defecto para los nuevos campos
  tipoPago: 'anticipo_50',
  tipoEntrega: 'produccion_15'
};

// Opciones para condiciones de pago
export const CONDICIONES_PAGO_OPTIONS = [
  {
    value: 'echeq_15',
    label: 'E-cheqs a 15 días',
    texto: '48 hs previo a la entrega con eCheqs a 15 días. Enviar OC. Una vez acreditado se coordina entrega.'
  },
  {
    value: 'echeq_30',
    label: 'E-cheqs a 30 días',
    texto: '48 hs previo a la entrega con eCheqs a 30 días. Enviar OC. Una vez acreditado se coordina entrega.'
  },
  {
    value: 'echeq_45',
    label: 'E-cheqs a 45 días',
    texto: '48 hs previo a la entrega con eCheqs a 45 días. Enviar OC. Una vez acreditado se coordina entrega.'
  },
  {
    value: 'anticipo_50',
    label: '50% anticipo + resto previo entrega',
    texto: '50 % anticipo por transferencia bancaria. Una vez acreditado el importe se toma el pedido. Enviar OC. El resto del pago, 48 hs previo a la entrega. Una vez acreditado se coordina entrega.'
  },
  {
    value: 'cta_cte_7',
    label: 'Cuenta corriente 7 días',
    texto: 'Cuenta corriente a 7 días por transferencia bancaria.'
  },
  {
    value: 'cta_cte_30',
    label: 'Cuenta corriente 30 días',
    texto: 'Cuenta corriente a 30 días por transferencia bancaria.'
  },
  {
    value: 'cta_cte_60',
    label: 'Cuenta corriente 60 días',
    texto: 'Cuenta corriente a 60 días por transferencia bancaria.'
  },
  {
    value: 'texto_libre',
    label: 'Texto personalizado',
    texto: ''
  }
];

// Opciones para condiciones de entrega
export const CONDICIONES_ENTREGA_OPTIONS = [
  {
    value: 'produccion_15',
    label: 'Producción 15 días',
    texto: 'Demora producción 15 días aprox.'
  },
  {
    value: 'stock_48_72',
    label: 'Stock disponible 48-72hs',
    texto: 'Stock disponible, entrega dentro de 48/72 hs desde acreditado el importe.'
  }
];

// Condiciones fijas que se agregan automáticamente
export const CONDICIONES_FIJAS = {
  entregaCABA: "Presupuesto contempla una entrega CABA, por el total del presupuesto.",
  entregaPalletizada: "La mercadería se entrega palletizada.",
  enviosInterior: "Envíos al interior: Entregamos en el transporte que ustedes trabajen dentro del radio de CABA.",
  validez: "El presente presupuesto tiene una validez de 48 hs desde su emisión, vencido ese plazo se vuelve a cotizar."
};

export const COMPANY_INFO = {
  name: "Market Paper",
  phone: "+54 11 1234-5678",
  email: "info@marketpaper.com.ar",
  website: "www.marketpaper.com.ar"
};