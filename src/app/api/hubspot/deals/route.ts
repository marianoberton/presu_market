import { NextResponse, NextRequest } from 'next/server';
import { HubSpotDealsResponse, ApiResponse } from '@/lib/types/presupuesto';

// Asegurar ejecución en Node.js para acceso estable a process.env y fetch
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const token = process.env.HUBSPOT_TOKEN;
    const pipeline = process.env.HUBSPOT_PIPELINE;
    const searchParams = request.nextUrl.searchParams;
    const stageParam = searchParams.get('stage');
    // Si se pasa 'won', usamos el stage de ganados (configurado en env o 'closedwon')
    // Si no, usamos el stage inicial por defecto
    const stageInicial = stageParam === 'won' 
      ? (process.env.HUBSPOT_STAGE_WON || 'closedwon') 
      : (stageParam || process.env.HUBSPOT_STAGE_INICIAL);

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
        sorts: [
          {
            propertyName: 'hs_lastmodifieddate',
            direction: 'DESCENDING'
          }
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
      // Variables compartidas para usar fallback contacto→empresa más adelante
      const dealToContactsMap = new Map<string, string[]>();
      let dealToCompaniesMap: Map<string, string[]> = new Map();
      const contactsMap = new Map<string, any>();
      const companiesMap = new Map<string, any>();
      const contactToCompaniesMap = new Map<string, string[]>();
      const companiesFromContactsMap = new Map<string, any>();
      let allContactIds: string[] = [];
      
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
          if (associationsData.results) {
            for (const result of associationsData.results) {
              if (result.to && result.to.length > 0) {
                const contactIds = result.to
                  .map((contact: { id?: string; toObjectId?: string }) => String(contact?.toObjectId ?? contact?.id ?? ''))
                  .filter(Boolean);
                dealToContactsMap.set(result.from.id, contactIds);
              }
            }
          }

          // Obtener datos de todos los contactos únicos
          allContactIds = Array.from(new Set(
            Array.from(dealToContactsMap.values()).flat()
          )).filter(Boolean);

          if (allContactIds.length > 0) {
            const contactsResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/batch/read', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                inputs: allContactIds.map(id => ({ id: String(id) })),
                properties: ['firstname', 'lastname', 'email', 'phone', 'mp_live_chat_url']
              })
            });

            if (contactsResponse.ok) {
              const contactsData = await contactsResponse.json();
              // contactsMap definido arriba
              
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
              console.error('Error al obtener datos de contactos:', contactsResponse.status, await contactsResponse.text());
            }
          }
        } else {
          console.error('Error al obtener associations:', associationsResponse.status, await associationsResponse.text());
        }
      } catch (associationsError) {
        console.warn('Error al obtener associations:', associationsError);
        // Continuar sin fallar si hay error con associations
      }

      // Asociaciones de empresas (deals -> companies)
      try {
        const associationsCompaniesResponse = await fetch('https://api.hubapi.com/crm/v4/associations/deals/companies/batch/read', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ inputs: dealIds })
        });

        if (associationsCompaniesResponse.ok) {
          const associationsCompaniesData = await associationsCompaniesResponse.json();
          console.log('Associations de empresas obtenidas:', JSON.stringify(associationsCompaniesData, null, 2));

          dealToCompaniesMap = new Map<string, string[]>();
          if (associationsCompaniesData.results) {
            for (const result of associationsCompaniesData.results) {
              if (result.to && result.to.length > 0) {
                const companyIds = result.to
                  .map((company: { id?: string; toObjectId?: string }) => String(company?.toObjectId ?? company?.id ?? ''))
                  .filter(Boolean);
                dealToCompaniesMap.set(result.from.id, companyIds);
              }
            }
          }

          const allCompanyIds = Array.from(new Set(
            Array.from(dealToCompaniesMap.values()).flat()
          )).filter(Boolean);

          if (allCompanyIds.length > 0) {
            const companiesResponse = await fetch('https://api.hubapi.com/crm/v3/objects/companies/batch/read', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                inputs: allCompanyIds.map(id => ({ id: String(id) })),
                properties: ['name', 'domain', 'website', 'phone']
              })
            });

            if (companiesResponse.ok) {
              const companiesData = await companiesResponse.json();
              // companiesMap definido arriba
              if (companiesData.results) {
                for (const company of companiesData.results) {
                  companiesMap.set(company.id, company.properties);
                }
              }

              // Auto-completar empresa del cliente si no está definida
              for (const deal of filteredDeals) {
                const companyIds = dealToCompaniesMap.get(deal.id);
                if (companyIds && companyIds.length > 0) {
                  const companyProps = companiesMap.get(companyIds[0]);
                  if (companyProps && companyProps.name) {
                    if (!deal.properties.mp_cliente_empresa) {
                      deal.properties.mp_cliente_empresa = companyProps.name;
                      console.log(`Deal ${deal.id}: Empresa asociada detectada -> ${companyProps.name}`);
                    } else {
                      console.log(`Deal ${deal.id}: Empresa ya definida -> ${deal.properties.mp_cliente_empresa}`);
                    }
                  }
                } else {
                  console.log(`Deal ${deal.id}: sin empresas asociadas`);
                }
              }
            } else {
              console.error('Error al obtener datos de empresas:', companiesResponse.status, await companiesResponse.text());
            }
          }
        } else {
          console.error('Error al obtener associations de empresas:', associationsCompaniesResponse.status, await associationsCompaniesResponse.text());
        }
      } catch (associationsCompaniesError) {
        console.warn('Error al obtener associations de empresas:', associationsCompaniesError);
      }

      // Fallback: intentar obtener empresa desde asociaciones del contacto (contacts -> companies) si el deal no tiene empresa
      try {
        if (allContactIds.length > 0) {
          const contactCompaniesAssocResp = await fetch('https://api.hubapi.com/crm/v4/associations/contacts/companies/batch/read', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputs: allContactIds.map(id => ({ id: String(id) })) })
          });

          if (contactCompaniesAssocResp.ok) {
            const contactCompaniesAssocData = await contactCompaniesAssocResp.json();
            // usar mapa predefinido contactToCompaniesMap

            if (contactCompaniesAssocData.results) {
              for (const result of contactCompaniesAssocData.results) {
                if (result.to && result.to.length > 0) {
                  const companyIds = result.to
                    .map((company: { id?: string; toObjectId?: string }) => String(company?.toObjectId ?? company?.id ?? ''))
                    .filter(Boolean);
                  contactToCompaniesMap.set(result.from.id, companyIds);
                }
              }
            }

            const allCompanyIdsFromContacts = Array.from(new Set(
              Array.from(contactToCompaniesMap.values()).flat()
            )).filter(Boolean);

            if (allCompanyIdsFromContacts.length > 0) {
              const companiesFromContactsResp = await fetch('https://api.hubapi.com/crm/v3/objects/companies/batch/read', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  inputs: allCompanyIdsFromContacts.map(id => ({ id: String(id) })),
                  properties: ['name', 'domain', 'website', 'phone']
                })
              });

              if (companiesFromContactsResp.ok) {
                const companiesFromContactsData = await companiesFromContactsResp.json();
                // companiesFromContactsMap definido arriba
                if (companiesFromContactsData.results) {
                  for (const company of companiesFromContactsData.results) {
                    companiesFromContactsMap.set(company.id, company.properties);
                  }
                }

                // Completar empresa del cliente si sigue sin estar definida, usando empresa asociada al contacto
                for (const deal of filteredDeals) {
                  if (!deal.properties.mp_cliente_empresa) {
                    const contactIds = dealToContactsMap.get(deal.id) || [];
                    const firstContactId = contactIds[0];
                    const companyIdsForContact = firstContactId ? contactToCompaniesMap.get(firstContactId) : undefined;
                    if (companyIdsForContact && companyIdsForContact.length > 0) {
                      const companyProps = companiesFromContactsMap.get(companyIdsForContact[0]);
                      if (companyProps && companyProps.name) {
                        deal.properties.mp_cliente_empresa = companyProps.name;
                        console.log(`Deal ${deal.id}: Fallback empresa desde contacto -> ${companyProps.name}`);
                      }
                    } else {
                      console.log(`Deal ${deal.id}: sin empresas asociadas via contacto`);
                    }
                  }
                }
              } else {
                console.error('Error al obtener empresas desde contactos:', companiesFromContactsResp.status, await companiesFromContactsResp.text());
              }
            }
          } else {
            console.error('Error al obtener associations contacts->companies:', contactCompaniesAssocResp.status, await contactCompaniesAssocResp.text());
          }
        }
      } catch (contactCompaniesError) {
        console.warn('Error en fallback contacto→empresa:', contactCompaniesError);
      }

      // Adjuntar meta de asociaciones (__assoc) a cada deal para consumo del cliente
      for (const deal of filteredDeals) {
        const contactIds = dealToContactsMap.get(deal.id) || [];
        const companiesFromDeal = dealToCompaniesMap.get(deal.id) || [];
        const companiesFromContacts = contactIds
          .map(cid => contactToCompaniesMap.get(cid) || [])
          .flat();
        const unionCompanyIds = Array.from(new Set([
          ...companiesFromDeal,
          ...companiesFromContacts,
        ])).filter(Boolean);
        // Excluir empresas con `name` vacío o no definido
        const uniqueCompanyIds = unionCompanyIds.filter((id) => {
          const props = companiesMap.get(String(id)) || companiesFromContactsMap.get(String(id)) || {};
          const name = props?.name;
          return typeof name === 'string' ? name.trim().length > 0 : Boolean(name);
        });

        // Detectar contacto con mp_live_chat_url faltante (primer contacto faltante)
        let missingManyChat: { id: string; properties: Record<string, any> } | null = null;
        for (const cid of contactIds) {
          const props = contactsMap.get(cid) || {};
          if (!props?.mp_live_chat_url) {
            missingManyChat = { id: String(cid), properties: props };
            break;
          }
        }

        // Adjuntar meta sin tocar propiedades originales de HubSpot
        (deal as any).__assoc = {
          contactIds,
          companyIdsFromDeal: companiesFromDeal,
          companyIdsFromContacts: companiesFromContacts,
          contactsCount: contactIds.length,
          companiesUniqueCount: uniqueCompanyIds.length,
          missingManyChatContact: missingManyChat,
        };
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