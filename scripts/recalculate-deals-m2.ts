import fs from 'fs';
import path from 'path';
import { calcularTotales } from '../src/lib/calculations';
import { ProductoData } from '../src/lib/types';

// Configuración
const BATCH_SIZE = 50; // Aumentado para mejor rendimiento
const DELAY_MS = 200;

// Archivo de reporte
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const REPORT_FILE = path.resolve(process.cwd(), `reporte_migracion_${timestamp}.txt`);

// Logger que escribe a consola y al archivo
function log(message: string, toFile: boolean = true) {
  console.log(message);
  if (toFile) {
    fs.appendFileSync(REPORT_FILE, message + '\n');
  }
}

// Cargar variables de entorno
const loadEnv = () => {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      log('Cargando .env.local...', false);
      const envConfig = fs.readFileSync(envPath, 'utf8');
      envConfig.split('\n').forEach((line) => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^"(.*)"$/, '$1');
          process.env[key] = value;
        }
      });
    } else {
        log('ADVERTENCIA: No se encontró archivo .env.local', false);
    }
  } catch (e) {
    log(`ERROR cargando .env.local: ${e}`, false);
  }
};

loadEnv();

const HUBSPOT_TOKEN = process.env.HUBSPOT_TOKEN;

if (!HUBSPOT_TOKEN) {
  log('ERROR CRÍTICO: HUBSPOT_TOKEN no encontrado en variables de entorno.');
  process.exit(1);
}

// Interfaces
interface HubSpotDealResult {
  id: string;
  properties: {
    dealname: string;
    mp_items_json?: string;
    mp_metros_cuadrados_totales?: string;
  };
}

interface HubSpotSearchResponse {
  results: HubSpotDealResult[];
  paging?: {
    next?: {
      after: string;
    };
  };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  log('================================================');
  log(`INICIANDO RECALCULO DE M2 - ${new Date().toLocaleString()}`);
  log('================================================');
  log(`Reporte guardado en: ${REPORT_FILE}`);
  
  let after: string | undefined = undefined;
  let hasMore = true;
  
  // Estadísticas
  const stats = {
    totalProcesados: 0,
    actualizados: 0,
    correctos: 0,
    sinJson: 0,
    jsonInvalido: 0,
    erroresApi: 0
  };

  const detalles: string[] = []; // Para el reporte final de errores/cambios

  while (hasMore) {
    try {
      log(`Consultando lote de deals (Cursor: ${after || 'Inicio'})...`, false);
      
      const url = new URL('https://api.hubapi.com/crm/v3/objects/deals');
      url.searchParams.set('limit', BATCH_SIZE.toString());
      url.searchParams.set('properties', 'dealname,mp_items_json,mp_metros_cuadrados_totales');
      if (after) {
        url.searchParams.set('after', after);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          log('Rate limit alcanzado. Esperando 5 segundos...');
          await sleep(5000);
          continue;
        }
        throw new Error(`Error HubSpot API: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as HubSpotSearchResponse;
      const deals = data.results;
      
      if (deals.length === 0) {
        log('No se encontraron más deals en este lote.');
        hasMore = false;
        break;
      }

      log(`Procesando ${deals.length} deals...`, false);

      for (const deal of deals) {
        stats.totalProcesados++;
        const { mp_items_json, mp_metros_cuadrados_totales, dealname } = deal.properties;
        const dealInfo = `[ID: ${deal.id}] ${dealname || 'Sin Nombre'}`;

        // Caso 1: Sin JSON
        if (!mp_items_json) {
            stats.sinJson++;
            detalles.push(`${dealInfo} -> SALTADO (Sin mp_items_json)`);
            continue;
        }

        try {
          // Caso 2: JSON Inválido o Vacío
          const items: ProductoData[] = JSON.parse(mp_items_json);
          if (!Array.isArray(items) || items.length === 0) {
             stats.jsonInvalido++;
             detalles.push(`${dealInfo} -> SALTADO (JSON vacío o no es array)`);
             continue;
          }

          // Cálculo
          const totalesCalculados = calcularTotales(items);
          const m2Real = totalesCalculados.metrosCuadradosTotales;
          const m2Actual = mp_metros_cuadrados_totales ? parseFloat(mp_metros_cuadrados_totales) : null;

          // Comparación
          const diferencia = m2Actual === null ? m2Real : Math.abs(m2Actual - m2Real);
          const necesitaActualizacion = m2Actual === null || diferencia > 0.001;

          if (necesitaActualizacion) {
             // Caso 3: Actualización necesaria
             log(`ACTUALIZANDO: ${dealInfo} | Antes: ${m2Actual ?? 'N/A'} | Ahora: ${m2Real}`);
             detalles.push(`${dealInfo} -> ACTUALIZADO (${m2Actual ?? 'N/A'} -> ${m2Real})`);
             
             await updateDealM2(deal.id, m2Real);
             stats.actualizados++;
             await sleep(100); 
          } else {
             // Caso 4: Ya está correcto
             stats.correctos++;
             // No logueamos cada correcto para no saturar, solo en stats
          }

        } catch (jsonError) {
          stats.jsonInvalido++;
          detalles.push(`${dealInfo} -> ERROR JSON (${jsonError})`);
          log(`Error parseando JSON en ${dealInfo}`);
        }
      }

      // Paginación
      if (data.paging?.next?.after) {
        after = data.paging.next.after;
      } else {
        hasMore = false;
      }

    } catch (error) {
      log(`ERROR FATAL en lote: ${error}`);
      stats.erroresApi++;
      // Intentar continuar con siguiente página si es posible, o romper si es crítico
      // En este caso, si falla el fetch, mejor parar o reintentar. Rompemos por seguridad.
      break;
    }
  }

  // Resumen Final
  const resumen = `
================================================
RESUMEN FINAL DE EJECUCIÓN
================================================
Total Deals Procesados: ${stats.totalProcesados}
------------------------------------------------
✅ Actualizados correctamente: ${stats.actualizados}
✅ Ya estaban correctos:       ${stats.correctos}
⚠️ Sin items (JSON vacío/null): ${stats.sinJson}
⚠️ JSON Inválido:              ${stats.jsonInvalido}
❌ Errores de API:             ${stats.erroresApi}
================================================
`;

  log(resumen);
  
  // Escribir detalles al final del archivo
  fs.appendFileSync(REPORT_FILE, '\n\n--- DETALLE DE ACCIONES ---\n');
  fs.appendFileSync(REPORT_FILE, detalles.join('\n'));
  
  log(`Reporte completo generado en: ${REPORT_FILE}`);
}

async function updateDealM2(dealId: string, m2: number) {
  const url = `https://api.hubapi.com/crm/v3/objects/deals/${dealId}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        mp_metros_cuadrados_totales: m2.toString()
      }
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Error actualizando deal ${dealId}: ${response.status} - ${body}`);
  }
}

main().catch((e) => log(`ERROR NO CONTROLADO: ${e}`));
