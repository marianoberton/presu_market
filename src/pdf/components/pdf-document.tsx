import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { PresupuestoData } from '@/lib/types';
import { formatearMoneda } from '@/lib/calculations';

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 0,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.4,
  },
  header: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    marginBottom: 30,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 50,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  companyDetails: {
    fontSize: 10,
    color: '#E5E7EB',
    textAlign: 'right',
    marginBottom: 2,
  },
  content: {
    padding: 30,
    paddingTop: 0,
  },
  clientSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  clientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  clientField: {
    flexDirection: 'row',
    marginBottom: 4,
    minWidth: '45%',
  },
  fieldLabel: {
    fontWeight: 'bold',
    color: '#4B5563',
    width: 80,
  },
  fieldValue: {
    color: '#1F2937',
    flex: 1,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#D1D5DB',
  },
  tableRowAlt: {
    backgroundColor: '#F9FAFB',
  },
  col1: { width: '4%', textAlign: 'center' },
  col2: { width: '25%' },
  col3: { width: '8%', textAlign: 'center' },
  col4: { width: '8%', textAlign: 'center' },
  col5: { width: '8%', textAlign: 'center' },
  col6: { width: '12%', textAlign: 'center' },
  col7: { width: '10%', textAlign: 'center' },
  col8: { width: '7%', textAlign: 'center' },
  col9: { width: '18%', textAlign: 'right' },
  headerText: {
    fontWeight: 'bold',
    fontSize: 9,
    color: '#374151',
  },
  cellText: {
    fontSize: 8,
    color: '#1F2937',
  },
  totalsContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  totalsBox: {
    width: 220,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 10,
    color: '#4B5563',
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  finalTotal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3B82F6',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 4,
  },
  conditionsSection: {
    marginBottom: 20,
  },
  conditionsText: {
    fontSize: 9,
    color: '#4B5563',
    lineHeight: 1.5,
    marginBottom: 8,
  },
  conditionsTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 2,
    borderTopColor: '#3B82F6',
  },
  footerSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerIcon: {
    width: 12,
    height: 12,
    marginRight: 5,
  },
  footerText: {
    fontSize: 9,
    color: '#374151',
    fontWeight: 'bold',
  },
  footerLabel: {
    fontSize: 8,
    color: '#6B7280',
    marginBottom: 2,
  },
});

interface PDFDocumentProps {
  data: PresupuestoData;
}

export function PDFDocument({ data }: PDFDocumentProps) {
  // Calcular precio sin IVA
  const precioSinIVA = data.totales.subtotal;
  const ivaAmount = data.totales.iva;
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image style={styles.logo} src="/MARKET-PAPER-LOGO-CURVAS_Mesa-de-trabajo-1-3-e1726845431314-1400x571 (1).png" />
            <Text style={styles.headerTitle}>PRESUPUESTO</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.companyDetails}>Soluciones en Packaging</Text>
            <Text style={styles.companyDetails}>Tel: +54 9 11 5053-5746</Text>
            <Text style={styles.companyDetails}>ventas@marketpaper.com.ar</Text>
            <Text style={styles.companyDetails}>www.marketpaper.com.ar</Text>
          </View>
        </View>

        <View style={styles.content}>

        {/* Información del Cliente */}
        <View style={styles.clientSection}>
          <Text style={styles.sectionTitle}>Datos del Cliente</Text>
          <View style={styles.clientGrid}>
            <View style={styles.clientField}>
              <Text style={styles.fieldLabel}>Cliente:</Text>
              <Text style={styles.fieldValue}>{data.cliente.nombre}</Text>
            </View>
            <View style={styles.clientField}>
              <Text style={styles.fieldLabel}>Email:</Text>
              <Text style={styles.fieldValue}>{data.cliente.email}</Text>
            </View>
            <View style={styles.clientField}>
              <Text style={styles.fieldLabel}>Teléfono:</Text>
              <Text style={styles.fieldValue}>{data.cliente.telefono}</Text>
            </View>
            <View style={styles.clientField}>
              <Text style={styles.fieldLabel}>Dirección:</Text>
              <Text style={styles.fieldValue}>{data.cliente.direccion}</Text>
            </View>
          </View>
        </View>

        {/* Tabla de Productos */}
        <View style={styles.table}>
          <Text style={styles.sectionTitle}>Detalle de Productos</Text>
          
          {/* Header de la tabla */}
          <View style={styles.tableHeader}>
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
                  index % 2 === 1 ? styles.tableRowAlt : {}
                ]}
              >
                <Text style={[styles.cellText, styles.col1]}>{index + 1}</Text>
                <Text style={[styles.cellText, styles.col2]}>{producto.descripcion}</Text>
                <Text style={[styles.cellText, styles.col3]}>{producto.largo || '-'}</Text>
                <Text style={[styles.cellText, styles.col4]}>{producto.ancho || '-'}</Text>
                <Text style={[styles.cellText, styles.col5]}>{producto.alto || '-'}</Text>
                <Text style={[styles.cellText, styles.col6]}>{producto.calidad || '-'}</Text>
                <Text style={[styles.cellText, styles.col7]}>{producto.color || '-'}</Text>
                <Text style={[styles.cellText, styles.col8]}>{producto.cantidad}</Text>
                <Text style={[styles.cellText, styles.col9]}>{formatearMoneda(producto.subtotal)}</Text>
              </View>
            );
          })}
        </View>

        {/* Totales */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Precio sin IVA:</Text>
              <Text style={styles.totalValue}>{formatearMoneda(precioSinIVA)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>{formatearMoneda(data.totales.subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>IVA (21%):</Text>
              <Text style={styles.totalValue}>{formatearMoneda(data.totales.iva)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, styles.finalTotal]}>TOTAL:</Text>
              <Text style={[styles.totalValue, styles.finalTotal]}>{formatearMoneda(data.totales.total)}</Text>
            </View>
          </View>
        </View>

        {/* Condiciones Comerciales */}
        <View style={styles.conditionsSection}>
          <Text style={styles.sectionTitle}>Condiciones Comerciales</Text>
          
          <Text style={styles.conditionsTitle}>Condiciones de Pago:</Text>
          <Text style={styles.conditionsText}>{data.condiciones.condicionesPago}</Text>
          
          <Text style={styles.conditionsTitle}>Condiciones de Entrega:</Text>
          <Text style={styles.conditionsText}>{data.condiciones.condicionesEntrega}</Text>
          
          <Text style={styles.conditionsTitle}>Validez:</Text>
          <Text style={styles.conditionsText}>{data.condiciones.validez}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerSection}>
            <Text style={styles.footerText}>📱 +54 9 11 5053-5746</Text>
          </View>
          <View style={styles.footerSection}>
            <Text style={styles.footerText}>✉️ ventas@marketpaper.com.ar</Text>
          </View>
          <View style={styles.footerSection}>
            <Text style={styles.footerText}>🌐 www.marketpaper.com.ar</Text>
          </View>
        </View>
        </View>
      </Page>
    </Document>
  );
}