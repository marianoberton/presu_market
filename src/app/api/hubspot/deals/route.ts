import { NextResponse } from 'next/server';
import { HubSpotDealsResponse, ApiResponse } from '@/lib/types/presupuesto';

export async function GET() {
  try {
    const token = process.env.HUBSPOT_TOKEN;
    const pipeline = process.env.HUBSPOT_PIPELINE;
    const stageInicial = process.env.HUBSPOT_STAGE_INICIAL;

    if (!token) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Token de HubSpot no configurado',
        status: 500
      }, { status: 500 });
    }

    if (!pipeline || !stageInicial) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Pipeline o etapa inicial no configurados',
        status: 500
      }, { status: 500 });
    }

    // Usar el endpoint de búsqueda con associations usando pseudo-properties
    const url = 'https://api.hubapi.com/crm/v3/objects/deals/search';
    
    // Filtrar por pipeline y etapa
    const filterGroup = {
      filters: [
        {
          propertyName: 'pipeline',
          operator: 'EQ',
          value: pipeline
        },
        {
          propertyName: 'dealstage',
          operator: 'EQ',
          value: stageInicial
        }
      ]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filterGroups: [filterGroup],
        properties: [
          'dealname', 
          'dealstage', 
          'amount', 
          'closedate', 
          'pipeline', 
          'mp_cliente_nombre', 
          'mp_cliente_empresa', 
          'mp_cliente_email', 
          'mp_cliente_telefono',
          'associations.contact' // Pseudo-property para obtener associations
        ],
        limit: 100
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error de HubSpot API:', errorText);
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Error de HubSpot API: ${response.status} - ${errorText}`,
        status: response.status
      }, { status: response.status });
    }

    const data: HubSpotDealsResponse = await response.json();
    
    console.log('Datos recibidos de HubSpot:', JSON.stringify(data, null, 2));

    // Los deals ya están filtrados por el endpoint de búsqueda
    const filteredDeals = data.results || [];
    console.log(`Total deals filtrados obtenidos: ${filteredDeals.length}`);
    
    // Log detallado de las propiedades de cada deal
    filteredDeals.forEach((deal, index) => {
      console.log(`Deal ${index + 1} (ID: ${deal.id}):`);
      console.log(`  - dealname: ${deal.properties.dealname}`);
      console.log(`  - mp_cliente_nombre: ${deal.properties.mp_cliente_nombre || 'NO DEFINIDO'}`);
      console.log(`  - mp_cliente_email: ${deal.properties.mp_cliente_email || 'NO DEFINIDO'}`);
      console.log(`  - mp_cliente_telefono: ${deal.properties.mp_cliente_telefono || 'NO DEFINIDO'}`);
      console.log(`  - Todas las propiedades:`, Object.keys(deal.properties));
    });

    // Enriquecer deals con datos de contactos asociados usando la API v4 de associations
    if (filteredDeals.length > 0) {
      // Obtener todas las associations de una vez usando la API v4
      const dealIds = filteredDeals.map(deal => ({ id: deal.id }));
      
      try {
        const associationsResponse = await fetch('https://api.hubapi.com/crm/v4/associations/deals/contacts/batch/read', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: dealIds
          })
        });

        if (associationsResponse.ok) {
          const associationsData = await associationsResponse.json();
          console.log('Associations obtenidas:', JSON.stringify(associationsData, null, 2));

          // Crear un mapa de deal ID a contact IDs
          const dealToContactsMap = new Map();
          if (associationsData.results) {
            for (const result of associationsData.results) {
              if (result.to && result.to.length > 0) {
                dealToContactsMap.set(result.from.id, result.to.map((contact: { id: string }) => contact.id));
              }
            }
          }

          // Obtener datos de todos los contactos únicos
          const allContactIds = Array.from(new Set(
            Array.from(dealToContactsMap.values()).flat()
          ));

          if (allContactIds.length > 0) {
            const contactsResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/batch/read', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                inputs: allContactIds.map(id => ({ id })),
                properties: ['firstname', 'lastname', 'email', 'phone']
              })
            });

            if (contactsResponse.ok) {
              const contactsData = await contactsResponse.json();
              const contactsMap = new Map();
              
              if (contactsData.results) {
                for (const contact of contactsData.results) {
                  contactsMap.set(contact.id, contact.properties);
                }
              }

              // Auto-completar propiedades de los deals
              for (const deal of filteredDeals) {
                const contactIds = dealToContactsMap.get(deal.id);
                if (contactIds && contactIds.length > 0) {
                  const contactProps = contactsMap.get(contactIds[0]); // Usar el primer contacto
                  
                  if (contactProps) {
                    console.log(`Procesando deal ${deal.id} con contacto:`, contactProps);

                    // Auto-completar propiedades del deal con datos del contacto si no están definidas
                    if (!deal.properties.mp_cliente_nombre && (contactProps.firstname || contactProps.lastname)) {
                      const fullName = [contactProps.firstname, contactProps.lastname].filter(Boolean).join(' ');
                      deal.properties.mp_cliente_nombre = fullName;
                      console.log(`Auto-completado nombre: ${fullName}`);
                    }

                    if (!deal.properties.mp_cliente_email && contactProps.email) {
                      deal.properties.mp_cliente_email = contactProps.email;
                      console.log(`Auto-completado email: ${contactProps.email}`);
                    }

                    if (!deal.properties.mp_cliente_telefono && contactProps.phone) {
                      deal.properties.mp_cliente_telefono = contactProps.phone;
                      console.log(`Auto-completado teléfono: ${contactProps.phone}`);
                    }
                  }
                } else {
                  console.log(`Deal ${deal.id} no tiene contactos asociados`);
                }
              }
            } else {
              console.error('Error al obtener datos de contactos:', associationsResponse.status, await contactsResponse.text());
            }
          }
        } else {
          console.error('Error al obtener associations:', associationsResponse.status, await associationsResponse.text());
        }
      } catch (associationsError) {
        console.warn('Error al obtener associations:', associationsError);
        // Continuar sin fallar si hay error con associations
      }
    }

    // Actualizar la respuesta con los deals filtrados
    const filteredData = {
      ...data,
      results: filteredDeals,
      total: filteredDeals.length
    };

    return NextResponse.json<ApiResponse<HubSpotDealsResponse>>({
      success: true,
      data: filteredData
    });

  } catch (error) {
    console.error('Error al obtener deals:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
      status: 500
    }, { status: 500 });
  }
}