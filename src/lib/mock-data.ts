import { PresupuestoData } from './types';

export const mockPresupuestoData: PresupuestoData = {
  cliente: {
    nombre: "DISTRIBUIDORA CENTRAL S.A.",
    email: "compras@distribuidoracentral.com.ar",
    telefono: "+54 11 4567-8901",
    direccion: "Av. Corrientes 1234, CABA, Buenos Aires"
  },
  productos: [
    {
      id: "1",
      descripcion: "Cajas de cartón corrugado. Aleta simple onda C.",
      tipo: "caja-aleta-simple",
      largo: 300,
      ancho: 200,
      alto: 150,
      calidad: "4 mm 130 lbs",
      color: "kraft",
      cantidad: 500,
      precio: 1200,
      remarcacion: 1.3,
      precioUnitario: 1560,
      subtotal: 780000
    },
    {
      id: "2", 
      descripcion: "Cajas de cartón corrugado. Aleta cruzada inferior. Onda C.",
      tipo: "caja-aleta-cruzada-x1",
      largo: 400,
      ancho: 300,
      alto: 200,
      calidad: "4 mm 150 lbs",
      color: "blanco",
      cantidad: 250,
      precio: 1800,
      remarcacion: 1.4,
      precioUnitario: 2520,
      subtotal: 630000
    },
    {
      id: "3",
      descripcion: "Plancha cartón corrugado trazada.",
      tipo: "plancha",
      largo: 700,
      ancho: 500,
      alto: 0,
      calidad: "7 mm dt",
      color: "kraft",
      cantidad: 100,
      precio: 2500,
      remarcacion: 1.2,
      precioUnitario: 3000,
      subtotal: 300000
    },
    {
      id: "4",
      descripcion: "POLÍMERO 2 COLORES (ENVIAR ARCHIVO DE DISEÑO).",
      tipo: "polimero",
      largo: 0,
      ancho: 0,
      alto: 0,
      calidad: "x unidad",
      color: "negro",
      cantidad: 1000,
      precio: 0,
      remarcacion: 1,
      precioUnitario: 0,
      subtotal: 0,
      colores: 2,
      aCotizar: true
    },
    {
      id: "5",
      descripcion: "Bandejas de cartón corrugado.",
      tipo: "bandeja",
      largo: 350,
      ancho: 250,
      alto: 80,
      calidad: "4 mm 110 lbs",
      color: "marron",
      cantidad: 300,
      precio: 950,
      remarcacion: 1.25,
      precioUnitario: 1187.5,
      subtotal: 356250
    }
  ],
  condiciones: {
    condicionesPago: "50% anticipo por transferencia bancaria. Una vez acreditado el importe se toma el pedido. Enviar OC.\nEl resto del pago, 48 hs previo a la entrega. Una vez acreditado se coordina entrega.",
    condicionesEntrega: "Demora producción 15 días aprox.\nPresupuesto contempla una entrega CABA, por el total del presupuesto.\nLa mercadería se entrega palletizada.\nEnvíos al interior: Entregamos en el transporte que ustedes trabajen dentro del radio de CABA.",
    validez: "El presente presupuesto tiene una validez de 48 hs desde su emisión, vencido ese plazo se vuelve a cotizar.",
    tipoPago: "anticipo_50",
    tipoEntrega: "produccion_15"
  },
  totales: {
    subtotal: 2066250,
    iva: 433912.5,
    total: 2500162.5
  },
  fecha: new Date().toLocaleDateString('es-AR')
};