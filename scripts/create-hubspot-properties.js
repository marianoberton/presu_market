const fs = require('fs');
const path = require('path');

// Cargar variables de entorno desde .env.local
function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          let value = valueParts.join('=').trim();
          // Remover comentarios inline (todo después de #)
          const commentIndex = value.indexOf('#');
          if (commentIndex !== -1) {
            value = value.substring(0, commentIndex).trim();
          }
          process.env[key.trim()] = value;
        }
      }
    });
  }
}

// Cargar variables de entorno
loadEnvLocal();

// Configuración
const HUBSPOT_API_KEY = process.env.HUBSPOT_TOKEN || process.env.HUBSPOT_API_KEY;
const BASE_URL = 'https://api.hubapi.com/crm/v3/properties/deals';

if (!HUBSPOT_API_KEY) {
  console.error('Error: HUBSPOT_TOKEN o HUBSPOT_API_KEY no está configurada en las variables de entorno');
  process.exit(1);
}

// Propiedades a crear
const properties = [
  // Datos del Cliente
  {
    groupName: 'dealinformation',
    name: 'mp_cliente_nombre',
    label: 'Nombre del Cliente',
    type: 'string',
    fieldType: 'text',
    description: 'Nombre completo del cliente asociado al deal'
  },
  {
    groupName: 'dealinformation',
    name: 'mp_cliente_empresa',
    label: 'Empresa del Cliente',
    type: 'string',
    fieldType: 'text',
    description: 'Empresa o dirección del cliente asociado al deal'
  },
  {
    groupName: 'dealinformation',
    name: 'mp_cliente_email',
    label: 'Email del Cliente',
    type: 'string',
    fieldType: 'text',
    description: 'Email del cliente asociado al deal'
  },
  {
    groupName: 'dealinformation',
    name: 'mp_cliente_telefono',
    label: 'Teléfono del Cliente',
    type: 'string',
    fieldType: 'phonenumber',
    description: 'Teléfono del cliente asociado al deal'
  },
  // Condiciones Comerciales
  {
    groupName: 'dealinformation',
    name: 'mp_condiciones_entrega',
    label: 'Condiciones de Entrega',
    type: 'string',
    fieldType: 'textarea',
    description: 'Condiciones de entrega del presupuesto'
  },
  {
    groupName: 'dealinformation',
    name: 'mp_condiciones_validez',
    label: 'Validez del Presupuesto',
    type: 'string',
    fieldType: 'text',
    description: 'Validez del presupuesto'
  },
  {
    groupName: 'dealinformation',
    name: 'mp_condiciones_pago',
    label: 'Condiciones de Pago',
    type: 'string',
    fieldType: 'textarea',
    description: 'Condiciones de pago del presupuesto'
  },
  // Totales
  {
    groupName: 'dealinformation',
    name: 'mp_total_subtotal',
    label: 'Subtotal',
    type: 'string',
    fieldType: 'text',
    description: 'Subtotal del presupuesto'
  },
  {
    groupName: 'dealinformation',
    name: 'mp_total_iva',
    label: 'IVA',
    type: 'string',
    fieldType: 'text',
    description: 'IVA del presupuesto'
  },
  {
    groupName: 'dealinformation',
    name: 'mp_total_final',
    label: 'Total Final',
    type: 'string',
    fieldType: 'text',
    description: 'Total final del presupuesto'
  },
  {
    groupName: 'dealinformation',
    name: 'mp_metros_cuadrados_totales',
    label: 'Metros Cuadrados Totales',
    type: 'number',
    fieldType: 'number',
    description: 'Total de metros cuadrados del presupuesto (clave para el equipo de ventas)'
  },
  // Items y EstadoDatos Adicionales
  {
    groupName: 'dealinformation',
    name: 'mp_items_json',
    label: 'Items del Presupuesto (JSON)',
    type: 'string',
    fieldType: 'textarea',
    description: 'JSON con todos los productos del presupuesto'
  },
  {
    groupName: 'dealinformation',
    name: 'mp_tiene_items_a_cotizar',
    label: 'Tiene Items a Cotizar',
    type: 'string',
    fieldType: 'text',
    description: 'Indica si el presupuesto tiene items marcados como "A COTIZAR"'
  },
  {
    groupName: 'dealinformation',
    name: 'mp_pdf_presupuesto_url',
    label: 'URL del PDF',
    type: 'string',
    fieldType: 'text',
    description: 'URL del PDF del presupuesto en HubSpot Files'
  }
];

async function createProperty(property) {
  try {
    console.log(`Creando propiedad: ${property.name}...`);
    
    const response = await fetch(
      BASE_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HUBSPOT_API_KEY}`
        },
        body: JSON.stringify(property)
      }
    );
    
    if (response.status === 409) {
      console.log(`⚠️  La propiedad ${property.name} ya existe`);
      return null;
    }
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorData}`);
    }
    
    const data = await response.json();
    console.log(`✅ Propiedad ${property.name} creada exitosamente`);
    return data;
  } catch (error) {
    console.error(`❌ Error creando propiedad ${property.name}:`, error.message);
    throw error;
  }
}

async function createAllProperties() {
  console.log('🚀 Iniciando creación de propiedades personalizadas en HubSpot...\n');
  
  for (const property of properties) {
    try {
      await createProperty(property);
    } catch (error) {
      console.error(`Error procesando propiedad ${property.name}:`, error.message);
    }
    console.log(''); // Línea en blanco para separar
  }
  
  console.log('✨ Proceso completado');
}

// Ejecutar el script
createAllProperties().catch(console.error);