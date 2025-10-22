import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { PresupuestoData } from '@/lib/types';
import { formatearMoneda } from '@/lib/calculations';

// Estilos para el PDF - Diseño Profesional Market Paper
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 0,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  // HEADER PROFESIONAL
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#2E9FEF', // Nuevo color azul solicitado
    borderBottomWidth: 3,
    borderBottomColor: '#2E9FEF', // Mismo color para consistencia
    marginBottom: 25,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 6,
    marginRight: 15,
  },
  logo: {
    width: 120,
    // Removemos height para mantener relación de aspecto
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginLeft: 10,
  },
  headerRight: {
    alignItems: 'flex-end',
    flex: 1,
  },
  presupuestoInfo: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  presupuestoNumber: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  presupuestoDate: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  contactInfo: {
    alignItems: 'flex-end',
  },
  companyDetails: {
    fontSize: 10,
    color: '#FFFFFF',
    textAlign: 'right',
    marginBottom: 1,
  },
  content: {
    paddingTop: 30, // Espaciado superior en todas las páginas
    paddingHorizontal: 30,
    paddingBottom: 30,
    flex: 1,
    // Removido height: '100%', display: 'flex', flexDirection: 'column' para permitir flujo natural
  },
  // SECCIÓN CLIENTE MEJORADA
  clientSection: {
    marginBottom: 25,
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    // Controles de página para evitar cortes
    breakInside: 'avoid',
    orphans: 2,
    widows: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: '#2563EB',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  clientField: {
    flexDirection: 'row',
    marginBottom: 6,
    minWidth: '40%', // Columna izquierda más estrecha
  },
  clientFieldWide: {
    flexDirection: 'row',
    marginBottom: 6,
    minWidth: '55%', // Columna derecha más ancha para email y dirección
  },
  fieldLabel: {
    fontWeight: 'bold',
    color: '#374151',
    width: 85,
    textTransform: 'uppercase',
    fontSize: 9,
  },
  fieldValue: {
    color: '#1F2937',
    flex: 1,
    fontSize: 10,
    // Removido textTransform: 'uppercase' - se aplicará selectivamente
  },
  fieldValueUppercase: {
    color: '#1F2937',
    flex: 1,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  // TABLA PROFESIONAL CON MEJOR DISEÑO
  table: {
    marginBottom: 25,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    overflow: 'hidden',
    // Controles de página para evitar cortes
    breakInside: 'avoid',
    orphans: 3,
    widows: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2563EB', // Azul Market Paper
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center', // Centrado vertical del contenido de las celdas
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    minHeight: 35, // Altura mínima para evitar cortes
  },
  tableRowAlt: {
    backgroundColor: '#F8FAFC',
  },
  tableRowEven: {
    backgroundColor: '#FFFFFF',
  },
  // COLUMNAS OPTIMIZADAS
  col1: { width: '5%', textAlign: 'center' },
  col2: { width: '25%', paddingRight: 5 }, // Reducido de 28% a 25%
  col3: { width: '7%', textAlign: 'center' },
  col4: { width: '9%', textAlign: 'center' }, // Aumentado de 7% a 9% para ANCHO
  col5: { width: '7%', textAlign: 'center' },
  col6: { width: '12%', textAlign: 'center' },
  col7: { width: '10%', textAlign: 'center' },
  col8: { width: '7%', textAlign: 'center' }, // Aumentado de 6% a 7%
  col9: { width: '18%', textAlign: 'right', paddingRight: 5 },
  headerText: {
    fontWeight: 'bold',
    fontSize: 10,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cellText: {
    fontSize: 9,
    color: '#1F2937',
    lineHeight: 1.3,
  },
  cellTextBold: {
    fontSize: 9,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  // TOTALES DESTACADOS - DISEÑO PROFESIONAL
  totalsContainer: {
    alignItems: 'flex-end',
    marginTop: 24, // Separación visual de la tabla de productos
    marginBottom: 25,
    // Controles de página para evitar cortes
    breakInside: 'avoid',
    orphans: 2,
    widows: 2,
  },
  totalsBox: {
    width: 240, // Reducido de 280 a 240
    backgroundColor: '#F8FAFC',
    padding: 15, // Reducido de 20 a 15
    borderWidth: 2,
    borderColor: '#2563EB',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6, // Reducido de 8 a 6
    paddingVertical: 3, // Reducido de 4 a 3
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4, // Reducido de 6 a 4
    paddingVertical: 3, // Reducido de 4 a 3
  },
  finalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6, // Reducido de 8 a 6
    paddingHorizontal: 10, // Reducido de 12 a 10
    backgroundColor: '#2563EB',
    borderRadius: 8,
    marginTop: 6, // Reducido de 8 a 6
  },
  totalLabel: {
    fontSize: 10, // Reducido de 11 a 10
    color: '#374151',
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 10, // Reducido de 11 a 10
    fontWeight: 'bold',
    color: '#1F2937',
  },
  finalTotalLabel: {
    fontSize: 12, // Reducido de 14 a 12
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  finalTotalValue: {
    fontSize: 14, // Reducido de 16 a 14
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // CONDICIONES COMERCIALES MEJORADAS
  conditionsSection: {
    marginTop: 40, // Añadido margen superior para separar del borde
    marginBottom: 25,
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    // Controles de página para evitar cortes
    breakInside: 'avoid',
    orphans: 3,
    widows: 3,
  },
  conditionsText: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.4,
    marginBottom: 10,
  },
  conditionsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 6,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // FOOTER PROFESIONAL
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1E293B',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 3,
    borderTopColor: '#2563EB',
  },
  footerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 10,
    right: 30,
    fontSize: 8,
    color: '#64748B',
  },
});

interface PDFDocumentProps {
  data: PresupuestoData;
}

export function PDFDocument({ data }: PDFDocumentProps) {
  const currentDate = new Date().toLocaleDateString('es-AR');
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER PROFESIONAL */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Image style={styles.logo} src="/MARKET-PAPER-LOGO-CURVAS_Mesa-de-trabajo-1-3-e1726845431314-1400x571 (1).png" />
            </View>
            <Text style={styles.headerTitle}>PRESUPUESTO</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.presupuestoInfo}>
              <Text style={styles.presupuestoDate}>Fecha: {currentDate}</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.companyDetails}>Tel: +54 9 11 5053-5746</Text>
              <Text style={styles.companyDetails}>ventas@marketpaper.com.ar</Text>
              <Text style={styles.companyDetails}>www.marketpaper.com.ar</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>

        {/* DATOS DEL CLIENTE MEJORADOS */}
        <View style={styles.clientSection}>
          <Text style={styles.sectionTitle}>Datos del Cliente</Text>
          <View style={styles.clientGrid}>
            <View style={styles.clientField}>
              <Text style={styles.fieldLabel}>Cliente:</Text>
              <Text style={styles.fieldValueUppercase}>{data.cliente.nombre}</Text>
            </View>
            <View style={styles.clientFieldWide}>
              <Text style={styles.fieldLabel}>Email:</Text>
              <Text style={styles.fieldValue}>{data.cliente.email}</Text>
            </View>
            <View style={styles.clientField}>
              <Text style={styles.fieldLabel}>Teléfono:</Text>
              <Text style={styles.fieldValue}>{data.cliente.telefono}</Text>
            </View>
            <View style={styles.clientFieldWide}>
              <Text style={styles.fieldLabel}>Dirección:</Text>
              <Text style={styles.fieldValue}>{data.cliente.direccion}</Text>
            </View>
          </View>
        </View>

        {/* TABLA DE PRODUCTOS PROFESIONAL */}
        <View style={styles.table}>
          <Text style={styles.sectionTitle}>Detalle de Items</Text>
          
          <View style={styles.tableContainer}>
            {/* Header de la tabla - Se repite en cada página */}
            <View style={styles.tableHeader} fixed>
              <Text style={[styles.headerText, styles.col1]}>#</Text>
              <Text style={[styles.headerText, styles.col2]}>Descripción</Text>
              <Text style={[styles.headerText, styles.col3]}>Largo</Text>
              <Text style={[styles.headerText, styles.col4]}>Ancho</Text>
              <Text style={[styles.headerText, styles.col5]}>Alto</Text>
              <Text style={[styles.headerText, styles.col6]}>Calidad</Text>
              <Text style={[styles.headerText, styles.col7]}>Color</Text>
              <Text style={[styles.headerText, styles.col8]}>Cant.</Text>
              <Text style={[styles.headerText, styles.col9]}>Subtotal</Text>
            </View>

            {/* Filas de productos */}
            {data.productos.map((producto, index) => {
              return (
                <View 
                  key={producto.id} 
                  style={[
                    styles.tableRow, 
                    index % 2 === 1 ? styles.tableRowAlt : styles.tableRowEven
                  ]}
                  wrap={false}
                >
                  <Text style={[styles.cellText, styles.col1]}>{index + 1}</Text>
                  <Text style={[styles.cellTextBold, styles.col2]}>{producto.descripcion}</Text>
                  <Text style={[styles.cellText, styles.col3]}>{producto.largo || '-'}</Text>
                  <Text style={[styles.cellText, styles.col4]}>{producto.ancho || '-'}</Text>
                  <Text style={[styles.cellText, styles.col5]}>{producto.alto || '-'}</Text>
                  <Text style={[styles.cellText, styles.col6]}>{producto.calidad || '-'}</Text>
                  <Text style={[styles.cellText, styles.col7]}>{producto.color || '-'}</Text>
                  <Text style={[styles.cellText, styles.col8]}>{producto.cantidad}</Text>
                  <Text style={[styles.cellTextBold, styles.col9]}>
                    {producto.aCotizar ? 'A COTIZAR' : formatearMoneda(producto.subtotal)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* TOTALES DESTACADOS - FLUJO NATURAL */}
        <View style={styles.totalsContainer} wrap={false}>
          <View style={styles.totalsBox}>
            <View style={styles.subtotalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>{formatearMoneda(data.totales.subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>IVA (21%):</Text>
              <Text style={styles.totalValue}>{formatearMoneda(data.totales.iva)}</Text>
            </View>
            <View style={styles.finalTotalRow}>
              <Text style={styles.finalTotalLabel}>TOTAL:</Text>
              <Text style={styles.finalTotalValue}>{formatearMoneda(data.totales.total)}</Text>
            </View>
          </View>
        </View>

        {/* CONDICIONES COMERCIALES MEJORADAS - SALTO DE PÁGINA GARANTIZADO */}
        <View break>
          <View style={styles.conditionsSection} wrap={false}>
            <Text style={styles.sectionTitle}>Condiciones Comerciales</Text>
            
            <Text style={styles.conditionsTitle}>Condiciones de Pago:</Text>
            <Text style={styles.conditionsText}>{data.condiciones.condicionesPago}</Text>
            
            <Text style={styles.conditionsTitle}>Condiciones de Entrega:</Text>
            <Text style={styles.conditionsText}>{data.condiciones.condicionesEntrega}</Text>
            
            <Text style={styles.conditionsTitle}>Validez:</Text>
            <Text style={styles.conditionsText}>{data.condiciones.validez}</Text>
          </View>
        </View>
        </View>

        {/* FOOTER PROFESIONAL */}
        <View style={styles.footer}>
          <View style={styles.footerSection}>
            <Text style={styles.footerText}>+54 9 11 5053-5746</Text>
          </View>
          <View style={styles.footerSection}>
            <Text style={styles.footerText}>ventas@marketpaper.com.ar</Text>
          </View>
          <View style={styles.footerSection}>
            <Text style={styles.footerText}>www.marketpaper.com.ar</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}