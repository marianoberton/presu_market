const token = process.env.HUBSPOT_TOKEN;

async function checkProperties() {
  try {
    console.log('🔍 Verificando propiedades personalizadas en HubSpot...\n');
    
    const response = await fetch('https://api.hubapi.com/crm/v3/properties/deals', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    const mpProperties = data.results.filter(prop => prop.name.startsWith('mp_'));
    
    console.log('=== PROPIEDADES PERSONALIZADAS ENCONTRADAS ===');
    console.log(`Total propiedades mp_: ${mpProperties.length}\n`);
    
    if (mpProperties.length > 0) {
      mpProperties.forEach(prop => {
        console.log(`✅ ${prop.name}: ${prop.label} (Tipo: ${prop.type})`);
      });
    } else {
      console.log('❌ No se encontraron propiedades mp_.');
      console.log('   Ejecuta: node scripts/create-hubspot-properties.js');
    }
    
    console.log('\n=== PROPIEDADES ESPERADAS ===');
    const expectedProperties = [
      'mp_cliente_nombre',
      'mp_cliente_empresa', 
      'mp_cliente_email',
      'mp_cliente_telefono',
      'mp_condiciones_entrega',
      'mp_condiciones_validez',
      'mp_condiciones_pago',
      'mp_total_subtotal',
      'mp_total_iva',
      'mp_total_final',
      'mp_items_json',
      'mp_tiene_items_a_cotizar',
      'mp_pdf_presupuesto_url'
    ];
    
    const foundPropertyNames = mpProperties.map(p => p.name);
    const missingProperties = expectedProperties.filter(prop => !foundPropertyNames.includes(prop));
    
    if (missingProperties.length === 0) {
      console.log('✅ Todas las propiedades esperadas están presentes');
    } else {
      console.log('❌ Propiedades faltantes:');
      missingProperties.forEach(prop => {
        console.log(`   - ${prop}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkProperties();