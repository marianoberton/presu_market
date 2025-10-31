import { ProductoData, TotalesData, IVA_PERCENTAGE } from './types';

/**
 * Calcula las medidas de producción basado en las dimensiones del producto y tipo de caja
 */
export function calcularMedidasProduccion(
  largo: number, 
  ancho: number, 
  alto: number, 
  tipo: 'caja-aleta-simple' | 'plancha' | 'bandeja' | 'cerco' | 'caja-aleta-cruzada-x1' | 'caja-aleta-cruzada-x2' | 'base-telescopica' | 'tapa-telescopica' | 'polimero' | 'sacabocado' = 'caja-aleta-simple'
) {
  if (tipo === 'polimero' || tipo === 'sacabocado') {
    // Para polímero y sacabocado, no se calculan medidas de producción especiales
    return {
      largoProduccion: largo,
      anchoProduccion: ancho,
      superficie: (largo * ancho) / 1000000 // Convertir de mm² a m²
    };
  }

  if (tipo === 'plancha') {
    // Para planchas, las medidas son las mismas
    return {
      largoProduccion: largo,
      anchoProduccion: ancho,
      superficie: (largo * ancho) / 1000000 // Convertir de mm² a m²
    };
  }

  // Cálculos específicos según el tipo de producto
  let largoProduccion: number;
  let anchoProduccion: number;

  switch (tipo) {
    case 'caja-aleta-simple':
      // Fórmula correcta de caja aleta simple:
      // LARGO DE PLANCHA: 2 LARGOS + 2 ANCHOS + 40
      // ANCHO DE PLANCHA: 1 ANCHO + 1 ALTO
      largoProduccion = 2 * largo + 2 * ancho + 40;
      anchoProduccion = ancho + alto;
      break;
    
    case 'bandeja':
      // Fórmula de bandejas cartón
      largoProduccion = largo + 2 * alto + 30;
      anchoProduccion = ancho + 2 * alto;
      break;
    
    case 'cerco':
      // Fórmula de cerco de cartón
      largoProduccion = 2 * (largo - 10) + 2 * (ancho - 10) + 40;
      anchoProduccion = ancho + alto;
      break;
    
    case 'caja-aleta-cruzada-x1':
      // Fórmula de aleta cruzada 1 lado
      largoProduccion = 2 * largo + 2 * ancho + 40;
      anchoProduccion = ancho + 0.5 * ancho + alto - 10;
      break;
    
    case 'caja-aleta-cruzada-x2':
      // Fórmula de aleta cruzada ambos lados
      largoProduccion = 2 * largo + 2 * ancho + 40;
      anchoProduccion = 2 * ancho + largo - 20;
      break;
    
    case 'base-telescopica':
    case 'tapa-telescopica':
      // Fórmula para base y tapa telescópica
      largoProduccion = 2 * largo + 2 * ancho + 50;
      anchoProduccion = 0.5 * ancho + alto;
      break;
    
    default:
      // Fórmula por defecto (caja aleta simple)
      largoProduccion = 2 * largo + 2 * ancho + 50;
      anchoProduccion = ancho + alto;
      break;
  }
  
  const superficie = (largoProduccion * anchoProduccion) / 1000000;
  
  return {
    largoProduccion,
    anchoProduccion,
    superficie
  };
  
  // Fallback para casos no contemplados
  return {
    largoProduccion: 0,
    anchoProduccion: 0,
    superficie: 0
  };
}

/**
 * Calcula el precio unitario basado en superficie, precio por m² y remarcación
 */
export function calcularPrecioUnitario(
  largo: number,
  ancho: number,
  alto: number,
  precio: number,
  remarcacion: number = 1,
  tipo: 'caja-aleta-simple' | 'plancha' | 'bandeja' | 'cerco' | 'caja-aleta-cruzada-x1' | 'caja-aleta-cruzada-x2' | 'base-telescopica' | 'tapa-telescopica' | 'polimero' | 'sacabocado' = 'caja-aleta-simple'
) {
  const medidas = calcularMedidasProduccion(largo, ancho, alto, tipo);
  return medidas.superficie * precio * remarcacion;
}

/**
 * Calcula el subtotal de un producto individual
 */
export function calcularSubtotalProducto(cantidad: number, precioUnitario: number): number {
  return Math.round((cantidad * precioUnitario) * 100) / 100;
}

/**
 * Calcula los totales generales del presupuesto
 * Excluye productos marcados como "A COTIZAR" (polímeros)
 */
export function calcularTotales(productos: ProductoData[]): TotalesData {
  // Filtrar productos que no son "A COTIZAR" para el cálculo de totales
  const productosParaTotal = productos.filter(producto => !producto.aCotizar);
  
  const subtotal = productosParaTotal.reduce((acc, producto) => acc + producto.subtotal, 0);
  const iva = Math.round((subtotal * IVA_PERCENTAGE) * 100) / 100;
  const total = Math.round((subtotal + iva) * 100) / 100;
  
  // Calcular m² totales de todos los productos (incluye todos, no solo los que tienen precio)
  const metrosCuadradosTotales = calcularMetrosCuadradosTotales(productos);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    iva,
    total,
    metrosCuadradosTotales: Math.round(metrosCuadradosTotales * 100) / 100 // Redondear a 2 decimales
  };
}

/**
 * Formatea un número como moneda argentina
 */
export function formatearMoneda(valor: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor);
}

/**
 * Formatea un número con separadores de miles
 */
export function formatearNumero(valor: number): string {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor);
}

/**
 * Valida que un número sea positivo y válido
 */
export function esNumeroValido(valor: number): boolean {
  return !isNaN(valor) && isFinite(valor) && valor >= 0;
}

/**
 * Genera un ID único para productos
 */
// Función para generar labels explicativas de los cálculos
export function generarLabelsCalculos(
  largo: number,
  ancho: number,
  alto: number,
  tipo: 'caja-aleta-simple' | 'plancha' | 'bandeja' | 'cerco' | 'caja-aleta-cruzada-x1' | 'caja-aleta-cruzada-x2' | 'base-telescopica' | 'tapa-telescopica' | 'polimero' | 'sacabocado'
) {
  if (tipo === 'polimero' || tipo === 'sacabocado') {
    return {
      largoLabel: `${largo} cm`,
      anchoLabel: `${ancho} cm`
    };
  }

  if (tipo === 'plancha') {
    return {
      largoLabel: `${largo} cm`,
      anchoLabel: `${ancho} cm`
    };
  }

  // Generar labels específicos según el tipo de producto
  let largoLabel: string;
  let anchoLabel: string;

  switch (tipo) {
    case 'caja-aleta-simple':
      largoLabel = `(${largo}×2 + ${ancho}×2 + 40)`;
      anchoLabel = `(${ancho} + ${alto})`;
      break;
    
    case 'bandeja':
      largoLabel = `(${largo} + ${alto}×2 + 30)`;
      anchoLabel = `(${ancho} + ${alto}×2)`;
      break;
    
    case 'cerco':
      largoLabel = `(2×(${largo} - 10) + 2×(${ancho} - 10) + 40)`;
      anchoLabel = `(${ancho} + ${alto})`;
      break;
    
    case 'caja-aleta-cruzada-x1':
      largoLabel = `(${largo}×2 + ${ancho}×2 + 40)`;
      anchoLabel = `(${ancho} + ${ancho}×0.5 + ${alto} - 10)`;
      break;
    
    case 'caja-aleta-cruzada-x2':
      largoLabel = `(${largo}×2 + ${ancho}×2 + 40)`;
      anchoLabel = `(${ancho}×2 + ${largo} - 20)`;
      break;
    
    case 'base-telescopica':
    case 'tapa-telescopica':
      largoLabel = `(${largo}×2 + ${ancho}×2 + 50)`;
      anchoLabel = `(${ancho}×0.5 + ${alto})`;
      break;
    
    default:
      largoLabel = `(${largo}×2 + ${ancho}×2 + 50)`;
      anchoLabel = `(${ancho} + ${alto})`;
      break;
  }

  return {
    largoLabel,
    anchoLabel
  };
}

export function generarIdProducto(): string {
  return `producto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calcula los metros cuadrados totales de todos los productos del presupuesto
 * Utiliza la superficie de producción (cartón necesario) para cada producto
 * Solo incluye productos que tienen dimensiones físicas (excluye polímero y sacabocado)
 */
export function calcularMetrosCuadradosTotales(productos: ProductoData[]): number {
  let metrosCuadradosTotales = 0;

  productos.forEach(producto => {
    // Solo calcular m² para productos que tienen dimensiones físicas
    // Excluir polímero y sacabocado ya que no tienen dimensiones físicas relevantes
    if (producto.tipo !== 'polimero' && producto.tipo !== 'sacabocado') {
      // Usar la función existente para obtener la superficie de producción
      const medidas = calcularMedidasProduccion(producto.largo, producto.ancho, producto.alto, producto.tipo);
      const superficieTotalProducto = medidas.superficie * producto.cantidad;
      
      metrosCuadradosTotales += superficieTotalProducto;
    }
  });

  return metrosCuadradosTotales;
}