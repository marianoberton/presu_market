// Verifica que existan las propiedades de contacto mp_* requeridas
// Usa el token de entorno: HUBSPOT_TOKEN (o HUBSPOT_ACCESS_TOKEN)

const token =
  process.env.HUBSPOT_ACCESS_TOKEN ||
  process.env.HUBSPOT_TOKEN ||
  process.env.HUBSPOT_OAUTH_ACCESS_TOKEN;

async function checkContactProperties() {
  try {
    if (!token) {
      console.error('❌ Falta token. Configurá HUBSPOT_ACCESS_TOKEN u HUBSPOT_TOKEN en .env.local');
      process.exit(1);
    }

    console.log('🔍 Verificando propiedades personalizadas de CONTACTOS en HubSpot...\n');

    const response = await fetch('https://api.hubapi.com/crm/v3/properties/contacts', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(`HTTP ${response.status}: ${txt}`);
    }

    const data = await response.json();
    const mpProps = data.results.filter((p) => p.name.startsWith('mp_'));
    const foundNames = mpProps.map((p) => p.name);

    console.log(`Total propiedades mp_ en contactos: ${mpProps.length}`);
    mpProps.forEach((p) => console.log(`✅ ${p.name}: ${p.label} (type=${p.type}, fieldType=${p.fieldType})`));

    const expected = ['mp_live_chat_url', 'mp_manychat_user_id', 'mp_page_id'];
    const missing = expected.filter((n) => !foundNames.includes(n));

    if (missing.length === 0) {
      console.log('\n✅ Todas las propiedades requeridas existen en CONTACTOS');
    } else {
      console.log('\n❌ Propiedades faltantes en CONTACTOS:');
      missing.forEach((n) => console.log(`   - ${n}`));
      console.log('\n➡️ Ejecutá: node scripts/create-hubspot-contact-properties.js');
    }
  } catch (err) {
    console.error('❌ Error:', err.message || String(err));
    process.exit(1);
  }
}

checkContactProperties();