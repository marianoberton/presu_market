import { ProductoData, TotalesData, IVA_PERCENTAGE } from './types';

/**
 * Calcula las medidas de producción basado en las dimensiones del producto
 */
export function calcularMedidasProduccion(largo: number, ancho: number, alto: number) {
  const largoProduccion = largo * 2 + ancho * 2 + 50;
  const anchoProduccion = ancho + alto;
  const superficie = (largoProduccion * anchoProduccion) / 1000000;
  
  return {
    largoProduccion,
    anchoProduccion,
    superficie
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
  remarcacion: number
): number {
  if (!largo || !ancho || !alto || !precio || !remarcacion) return 0;
  
  // Calcular medidas de producción
  const medidas = calcularMedidasProduccion(largo, ancho, alto);
  
  // Nueva fórmula: superficie × precio × remarcación
  const precioCalculado = medidas.superficie * precio * remarcacion;
  
  // Redondear a 2 decimales
  return Math.round(precioCalculado * 100) / 100;
}

/**
 * Calcula el subtotal de un producto individual
 */
export function calcularSubtotalProducto(cantidad: number, precioUnitario: number): number {
  return Math.round((cantidad * precioUnitario) * 100) / 100;
}

/**
 * Calcula los totales generales del presupuesto
 */
export function calcularTotales(productos: ProductoData[]): TotalesData {
  const subtotal = productos.reduce((acc, producto) => acc + producto.subtotal, 0);
  const iva = Math.round((subtotal * IVA_PERCENTAGE) * 100) / 100;
  const total = Math.round((subtotal + iva) * 100) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    iva,
    total
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
export function generarIdProducto(): string {
  return `producto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}