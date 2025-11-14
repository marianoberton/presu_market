// Crea las propiedades de CONTACTOS necesarias para ManyChat
// Lee variables desde .env.local y usa HUBSPOT_ACCESS_TOKEN/HUBSPOT_TOKEN

const fs = require('fs');
const path = require('path');

function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    lines.forEach((line) => {
      const t = line.trim();
      if (t && !t.startsWith('#')) {
        const [key, ...valueParts] = t.split('=');
        if (key && valueParts.length > 0) {
          let value = valueParts.join('=');
          const i = value.indexOf('#');
          if (i !== -1) value = value.substring(0, i);
          process.env[key.trim()] = value.trim();
        }
      }
    });
  }
}

loadEnvLocal();

const TOKEN =
  process.env.HUBSPOT_ACCESS_TOKEN ||
  process.env.HUBSPOT_TOKEN ||
  process.env.HUBSPOT_OAUTH_ACCESS_TOKEN;

const BASE_URL = 'https://api.hubapi.com/crm/v3/properties/contacts';

if (!TOKEN) {
  console.error('❌ Falta token. Configurá HUBSPOT_ACCESS_TOKEN u HUBSPOT_TOKEN en .env.local');
  process.exit(1);
}

const properties = [
  {
    groupName: 'contactinformation',
    name: 'mp_live_chat_url',
    label: 'Link de ManyChat',
    type: 'string',
    fieldType: 'text',
    description: 'URL del chat de ManyChat del contacto',
  },
  {
    groupName: 'contactinformation',
    name: 'mp_manychat_user_id',
    label: 'ManyChat User ID',
    type: 'string',
    fieldType: 'text',
    description: 'ID de usuario de ManyChat derivado del link',
  },
  {
    groupName: 'contactinformation',
    name: 'mp_page_id',
    label: 'ManyChat Page ID',
    type: 'string',
    fieldType: 'text',
    description: 'ID de la página de Facebook (ManyChat) derivado del link',
  },
];

async function createProperty(property) {
  try {
    console.log(`Creando propiedad de contacto: ${property.name}...`);
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(property),
    });

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

async function createAll() {
  console.log('🚀 Iniciando creación de propiedades de CONTACTOS en HubSpot...\n');
  for (const p of properties) {
    try {
      await createProperty(p);
    } catch (err) {
      console.error(`Error procesando ${p.name}:`, err.message);
    }
    console.log('');
  }
  console.log('✨ Proceso completado');
}

createAll().catch(console.error);