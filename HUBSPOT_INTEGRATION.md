# Integración con HubSpot - Actualización de Propiedades

Esta documentación describe la integración básica del generador de presupuestos con HubSpot para **actualizar propiedades de deals**.

## 🔧 Configuración

### 1. Variables de Entorno

Configura estas variables en tu archivo `.env.local`:

```bash
# HubSpot Integration - Basic API Access
HUBSPOT_TOKEN=pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  # Private App Token
HUBSPOT_PIPELINE=default                           # ID del pipeline donde crear deals
HUBSPOT_STAGE_INICIAL=appointmentscheduled         # Stage inicial (primer stage del pipeline)
HUBSPOT_STAGE_ENVIADO=1181803151                   # Stage "Presupuesto enviado" (segundo stage del pipeline)
```

### 2. Propiedades Personalizadas en HubSpot

El sistema utiliza estas propiedades personalizadas que deben existir en tu cuenta de HubSpot:

**Propiedades del Presupuesto:**
- `mp_pdf_presupuesto_url` - URL del PDF generado
- `mp_items_json` - JSON con los items del presupuesto
- `mp_total_subtotal` - Subtotal del presupuesto
- `mp_total_iva` - IVA del presupuesto
- `mp_total_final` - Total final del presupuesto

**Propiedades del Cliente:**
- `mp_cliente_nombre` - Nombre del cliente
- `mp_cliente_empresa` - Empresa del cliente
- `mp_cliente_email` - Email del cliente
- `mp_cliente_telefono` - Teléfono del cliente

**Propiedades de Condiciones:**
- `mp_condiciones_pago` - Condiciones de pago
- `mp_validez_oferta` - Validez de la oferta
- `mp_tiempo_entrega` - Tiempo de entrega
- `mp_observaciones` - Observaciones adicionales

### 3. Crear Propiedades Automáticamente

Puedes usar el script incluido para crear todas las propiedades automáticamente:

```bash
node scripts/create-hubspot-properties.js
```

## 🚀 Funcionalidad

### Actualización Automática de Deals

Cuando se genera un presupuesto, el sistema:

1. **Actualiza el deal existente** con toda la información del presupuesto
2. **Sincroniza datos del cliente** en las propiedades personalizadas
3. **Guarda la URL del PDF** generado
4. **Actualiza el valor total** del deal
5. **Cambia el stage** a "Presupuesto enviado"

### Flujo de Integración

```
Generar Presupuesto → Actualizar Deal en HubSpot → Cambiar Stage → Notificación
```

## 🔍 Verificación

### Comprobar Propiedades Existentes

```bash
node scripts/check-hubspot-properties.js
```

### Verificar Configuración

1. **Token válido**: El token debe tener permisos `crm.objects.deals.read`, `crm.objects.deals.write` y `files`
2. **Pipeline correcto**: Verifica que el ID del pipeline sea correcto
3. **Stages válidos**: Los IDs de stages deben existir en el pipeline configurado

## 📋 Funcionalidades de la Custom Card

### Información Mostrada
- **PDF del presupuesto** (iframe embebido)
- **Datos del cliente** (nombre, empresa, email, teléfono)
- **Totales** (subtotal, IVA, total final)
- **Items del presupuesto** (tabla con productos/servicios)

### Acciones Disponibles
- **Abrir PDF** - Abre el presupuesto en nueva ventana
- **Duplicar Deal** - Crea una copia del deal actual
- **Enviar por ManyChat** - Envía el presupuesto por WhatsApp (si está configurado)

## 🔧 Configuración Avanzada

### Propiedades Personalizadas de HubSpot

El sistema utiliza estas propiedades personalizadas en los deals:

```javascript
// Propiedades del presupuesto
mp_pdf_presupuesto_url      // URL del PDF generado
mp_items_json               // JSON con los items del presupuesto
mp_total_subtotal           // Subtotal sin IVA
mp_total_iva                // Monto del IVA
mp_total_final              // Total final

// Propiedades del cliente
mp_cliente_nombre           // Nombre del cliente
mp_cliente_empresa          // Empresa del cliente
mp_cliente_email            // Email del cliente
mp_cliente_telefono         // Teléfono del cliente

// Propiedades adicionales
mp_condiciones_pago         // Condiciones de pago
mp_validez_oferta          // Validez de la oferta
mp_tiempo_entrega          // Tiempo de entrega
mp_observaciones           // Observaciones adicionales
```

### Scripts de Configuración

Para crear automáticamente las propiedades personalizadas:

```bash
# Verificar propiedades existentes
node scripts/check-hubspot-properties.js

# Crear propiedades faltantes
node scripts/create-hubspot-properties.js
```

## 🚨 Troubleshooting

### Error 401 - Unauthorized
- Verifica que `HUBSPOT_TOKEN` esté configurado correctamente
- Asegúrate de que el token tenga los scopes necesarios

### Error 404 - Deal not found
- Verifica que el `objectId` sea un ID de deal válido
- Confirma que el deal existe en tu cuenta de HubSpot

### Error 401 - Invalid secret
- Verifica que `CARD_SECRET` coincida en `.env.local` y en la URL de la card

### La Card no aparece en HubSpot
- Confirma que la Private App esté activada
- Verifica que la URL de la card sea correcta
- Asegúrate de que el objeto type sea `deals`

## 📚 Documentación Adicional

### APIs Utilizadas
- **HubSpot CRM API v3** - Para obtener datos de deals
- **HubSpot Files API v3** - Para subir PDFs
- **HubSpot Custom Cards** - Para mostrar la interfaz

### Arquitectura
```
HubSpot Deal → Custom Card → Next.js API → HubSpot API → Respuesta JSON
```

### Flujo de Datos
1. Usuario abre un deal en HubSpot
2. HubSpot llama a `/api/hubspot/card?objectId=X&secret=Y`
3. El endpoint obtiene datos del deal desde HubSpot API
4. Se formatea la respuesta según el formato de Custom Cards
5. HubSpot muestra la card con la información del presupuesto

## 🔐 Seguridad

### Validaciones Implementadas
- **Secret validation** - Valida el parámetro `secret` en cada request
- **Token validation** - Verifica que el token de HubSpot sea válido
- **Input sanitization** - Sanitiza todos los inputs antes de procesarlos

### Recomendaciones
- Usa HTTPS en producción
- Mantén el `CARD_SECRET` seguro y único
- Rota el token de HubSpot periódicamente
- Monitorea los logs para detectar accesos no autorizados

## 📈 Métricas y Monitoreo

### Logs Importantes
- Requests a la Custom Card
- Errores de autenticación
- Fallos en la API de HubSpot
- Tiempo de respuesta del endpoint

### Métricas Recomendadas
- Número de cards mostradas por día
- Tiempo promedio de respuesta
- Tasa de errores por tipo
- Deals procesados exitosamente