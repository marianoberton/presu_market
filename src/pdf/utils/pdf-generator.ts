import { pdf } from '@react-pdf/renderer';
import { PresupuestoData } from '@/lib/types';
import { PDFDocument } from '../components/pdf-document';

/**
 * Genera un blob del PDF a partir de los datos del presupuesto
 */
export async function generarPDFBlob(data: PresupuestoData): Promise<Blob> {
  try {
    const pdfDocument = PDFDocument({ data });
    const blob = await pdf(pdfDocument).toBlob();
    return blob;
  } catch (error) {
    console.error('Error al generar PDF:', error);
    throw new Error('No se pudo generar el PDF');
  }
}

/**
 * Descarga el PDF con un nombre de archivo específico
 */
export async function descargarPDF(data: PresupuestoData, nombreArchivo?: string): Promise<void> {
  try {
    const blob = await generarPDFBlob(data);
    
    // Crear nombre de archivo por defecto si no se proporciona
    const fecha = new Date().toISOString().split('T')[0];
    const clienteNombre = data.cliente.nombre?.replace(/[^a-zA-Z0-9]/g, '_') || 'Cliente';
    const nombre = nombreArchivo || `Presupuesto_${clienteNombre}_${fecha}.pdf`;
    
    // Crear URL temporal y descargar
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombre;
    document.body.appendChild(link);
    link.click();
    
    // Limpiar
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al descargar PDF:', error);
    throw new Error('No se pudo descargar el PDF');
  }
}

/**
 * Genera una URL temporal para previsualizar el PDF
 */
export async function generarURLPrevisualizacion(data: PresupuestoData): Promise<string> {
  try {
    const blob = await generarPDFBlob(data);
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error al generar URL de previsualización:', error);
    throw new Error('No se pudo generar la previsualización del PDF');
  }
}