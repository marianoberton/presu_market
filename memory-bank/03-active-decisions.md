# Decisiones Activas - Generador de Presupuestos

## Convenciones de Código

### Naming Conventions
- **Componentes**: PascalCase (ej: `FormularioPresupuesto`)
- **Archivos**: kebab-case (ej: `formulario-presupuesto.tsx`)
- **Funciones**: camelCase (ej: `calcularSubtotal`)
- **Variables**: camelCase (ej: `precioUnitario`)
- **Constantes**: UPPER_SNAKE_CASE (ej: `IVA_PERCENTAGE`)
- **Tipos/Interfaces**: PascalCase con sufijo (ej: `PresupuestoData`, `ProductoItem`)

### Estructura de Archivos
- **Componentes**: Un componente por archivo
- **Hooks**: Prefijo `use` (ej: `useCalculations`)
- **Utilidades**: Funciones puras sin estado
- **Tipos**: Centralizados en `src/lib/types.ts`

### Imports
- **Orden**: React → Third-party → Internal → Relative
- **Alias**: Usar `@/` para imports absolutos
- **Named exports**: Preferir sobre default exports para utilidades

## Decisiones Técnicas Vigentes

### [2025-01-10] Framework y Arquitectura Base
**Contexto**: Necesidad de crear aplicación web moderna para generación de presupuestos
**Alternativas consideradas**: 
- A) Next.js con App Router
- B) Create React App + React Router
- C) Vite + React

**Decisión**: Next.js 15+ con App Router
**Rationale**: 
- Optimizaciones automáticas (images, fonts, code splitting)
- SSR capabilities para futuras mejoras
- Mejor DX con hot reload y error handling
- Ecosystem maduro y bien documentado

**Consecuencias**: 
- Mejor performance out-of-the-box
- Curva de aprendizaje mínima para el equipo
- Facilita futuras mejoras (SSR, API routes)

### [2025-01-10] Librería de Generación de PDF
**Contexto**: Necesidad de generar PDFs profesionales desde React
**Alternativas consideradas**:
- A) @react-pdf/renderer
- B) jsPDF + html2canvas
- C) Puppeteer (server-side)

**Decisión**: @react-pdf/renderer
**Rationale**:
- Integración nativa con React components
- Mejor control sobre layout y estilos
- No requiere servidor para generación
- Mejor performance que html2canvas

**Consecuencias**:
- PDFs más consistentes y profesionales
- Código más mantenible y testeable
- Limitaciones en estilos CSS (subset específico)

### [2025-01-10] Manejo de Estado
**Contexto**: Gestión del estado del formulario y cálculos
**Alternativas consideradas**:
- A) useState local
- B) useReducer
- C) Zustand/Redux

**Decisión**: useState con custom hooks
**Rationale**:
- Aplicación simple sin estado global complejo
- Mejor performance (no re-renders innecesarios)
- Menos boilerplate y complejidad
- Facilita testing de lógica aislada

**Consecuencias**:
- Desarrollo más rápido
- Código más simple y directo
- Posible refactor futuro si crece la complejidad

### [2025-01-10] Librería de Estilos
**Contexto**: Necesidad de UI moderna y responsive
**Alternativas consideradas**:
- A) Tailwind CSS
- B) Styled Components
- C) CSS Modules
- D) Material-UI

**Decisión**: Tailwind CSS
**Rationale**:
- Desarrollo más rápido con utility classes
- Bundle size optimizado (purging automático)
- Consistencia en design system
- Excelente DX con IntelliSense

**Consecuencias**:
- UI más consistente y mantenible
- Curva de aprendizaje inicial
- HTML más verboso pero más explícito

## Reglas de Negocio

### Cálculos Financieros
- **IVA**: Siempre 21% sobre subtotal
- **Precisión**: 2 decimales para montos
- **Redondeo**: Matemático estándar (0.5 hacia arriba)
- **Moneda**: Pesos argentinos (ARS)

### Validaciones de Formulario
- **Campos requeridos**: Descripción, dimensiones, cantidad, precio
- **Valores mínimos**: Dimensiones > 0, Cantidad > 0, Precio >= 0
- **Valores máximos**: Dimensiones < 10000mm, Cantidad < 100000
- **Formato**: Números con hasta 2 decimales

### Estructura del PDF
- **Logo**: Siempre en header superior izquierdo
- **Datos empresa**: Footer con teléfono, email, web
- **Numeración**: Sin numeración automática (presupuesto único)
- **Formato**: A4, márgenes estándar

## Convenciones de UI/UX

### Colores Corporativos
- **Primario**: Azul (#3b82f6)
- **Secundario**: Gris (#6b7280)
- **Éxito**: Verde (#10b981)
- **Error**: Rojo (#ef4444)
- **Advertencia**: Amarillo (#f59e0b)

### Tipografía
- **Familia**: System fonts (Inter como fallback)
- **Tamaños**: Scale modular (12, 14, 16, 18, 20, 24, 32px)
- **Pesos**: Regular (400), Medium (500), Semibold (600), Bold (700)

### Espaciado
- **Base**: 4px (0.25rem)
- **Escala**: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px
- **Contenedores**: Max-width 1200px, padding lateral 16px

### Componentes
- **Botones**: Altura mínima 40px, padding horizontal 16px
- **Inputs**: Altura 40px, border radius 6px
- **Cards**: Border radius 8px, sombra sutil
- **Tablas**: Zebra striping, hover states

## Do's and Don'ts

### ✅ DO
- Usar TypeScript para todo el código nuevo
- Validar inputs tanto en cliente como en tipos
- Mantener componentes pequeños y enfocados
- Usar custom hooks para lógica reutilizable
- Documentar decisiones importantes en este archivo
- Testear cálculos críticos
- Usar semantic HTML
- Mantener accesibilidad básica (labels, roles)

### ❌ DON'T
- No usar `any` en TypeScript
- No hardcodear strings de UI (usar constantes)
- No hacer fetch de datos externos (app offline)
- No usar inline styles (usar Tailwind classes)
- No crear componentes gigantes (max 200 líneas)
- No ignorar warnings de ESLint
- No commitear console.logs
- No usar dependencias no aprobadas sin discusión

## Métricas y KPIs

### Performance
- **Tiempo de carga inicial**: < 2 segundos
- **Tiempo de generación PDF**: < 3 segundos
- **Bundle size**: < 500KB gzipped

### Calidad de Código
- **TypeScript coverage**: 100%
- **ESLint warnings**: 0
- **Componentes reutilizables**: > 80%

### UX
- **Tiempo para completar presupuesto**: < 2 minutos
- **Errores de validación**: Feedback inmediato
- **Responsive**: Funcional en tablets (768px+)

### [2025-11-07] Nuevo tipo: "dos planchas una caja"
**Contexto**: Algunas cajas requieren dos planchas por unidad, especialmente cuando el largo de plancha supera ~2550mm. Se necesita calcular superficie en base a la plancha y multiplicar por 2.
**Alternativas consideradas**:
- A) Reutilizar fórmula de caja estándar sin multiplicar
- B) Detectar automáticamente por largo y aplicar ×2
- C) Nuevo tipo explícito para operar con ×2

**Decisión**: Se incorpora el tipo de producto `dos-planchas-una-caja` con fórmula específica: `largo de plancha = largo + ancho + 40`, `ancho de plancha = ancho + alto` y `m² por unidad = (largo_plancha × ancho_plancha / 1e6) × 2`.
**Rationale**:
- Claridad operativa: el vendedor selecciona el tipo consciente de que implica dos planchas
- Evita suposiciones automáticas y posibles errores por umbral
- Se integra de forma limpia con el resto de fórmulas y cálculos existentes

**Consecuencias**:
- Cambios en `src/lib/types.ts`: se agrega el valor `dos-planchas-una-caja` a `ProductoData.tipo` y a `TIPO_PRODUCTO_OPTIONS`
- Cambios en `src/lib/calculations.ts`: nueva rama en `calcularMedidasProduccion` y labels en `generarLabelsCalculos`
- Cambios en `src/components/forms/medidas-produccion.tsx`: se muestra explícitamente `× 2 planchas` en la descripción de superficie
- Se mantiene el flujo de precio unitario: `superficie × precio × remarcación`
### [2025-11-06] Manejo de decimales en inputs numéricos
**Contexto**: Usuarios ingresan valores con punto o coma (precio por m² y remarcación). Se requiere precisión en cálculos y buena UX sin que se borre el separador al tipear.
**Alternativas consideradas**: 
- A) Aceptar solo punto como separador decimal
- B) Aceptar punto y coma con normalización y estado local
- C) Inputs `type=number` nativos

**Decisión**: Aceptar punto y coma; normalizar a punto para cálculos y usar estado local por producto para preservar el valor tipeado.
**Rationale**:
- Mejora la UX en teclado latino y evita “saltos” del input
- Mantiene consistencia en cálculos (usa `parseFloat` sobre valor normalizado)
- Evita problemas de `type=number` (variaciones entre navegadores)

**Consecuencias**:
- Cambios en `src/components/forms/productos-form.tsx` para `Precio $/m²` y `Remarcación`

### [2025-11-07] m² manual por ítem "otros-items" y uso en HubSpot
**Contexto**: Los ítems libres "otros-items" no tienen dimensiones físicas para calcular m². Se necesita capturar manualmente el m² que aportan al total.
**Alternativas consideradas**:
- A) Excluir completamente "otros-items" del cómputo de m²
- B) Campo global de m² manual (no ligado a ítems)
- C) Campo manual por ítem "otros-items" y sumarlo al total

**Decisión**: Implementar un campo obligatorio "Total m² del ítem" dentro de cada producto de tipo `otros-items`. El cálculo de m² totales suma los m² calculados automáticamente de los ítems con dimensiones + los m² manuales de cada `otros-items`. Este total se envía a HubSpot en `mp_metros_cuadrados_totales`.
**Rationale**:
- Mantiene el origen del dato de m² asociado al ítem correspondiente
- Evita dependencias de un campo global que puede ser ambiguo
- Preserva el flujo existente para tipos con fórmulas de superficie

**Consecuencias**:
- Cambios en `src/components/forms/productos-form.tsx`: nuevo input decimal por ítem `otros-items`
- Cambios en `src/lib/types.ts`: propiedad `metrosCuadradosManual` en `ProductoData`
- Cambios en `src/lib/calculations.ts`: sumar `metrosCuadradosManual` de `otros-items` al total
- Recalculos automáticos se mantienen (precio unitario y subtotal)
- Sin impacto en PDF y HubSpot (números siguen en punto)

### [2025-11-07] Tipo de producto "otros items"
**Contexto**: Necesitamos registrar ítems libres que no dependen de medidas ni calidad.
**Alternativas consideradas**: Extender tipos existentes / crear tipo libre sin dimensiones / usar texto libre sin precio.
**Decisión**: Se agrega el tipo de producto `otros-items` con precio manual y sin dimensiones, sin calidad/color ni remarcación.
**Rationale**: Mejora UX para ítems varios (fletes, servicios, accesorios) evitando campos irrelevantes.
**Consecuencias**:
- No participa del cálculo de m² totales.
- Subtotal se calcula como `precio × cantidad`.
- Se puede marcar como "A COTIZAR" como los demás.
## [2025-11-14] Variación de cantidad en Condiciones

## [2025-11-14] Estrategia de asociaciones HubSpot (Contacto y Empresa)
**Contexto**: La UI mostraba "Empresa asociada" basada en `mp_cliente_empresa` (dirección del formulario) y no en asociaciones reales de HubSpot. Se requieren modales para crear contacto/empresa cuando falten y asociarlos correctamente.
**Alternativas consideradas**:
- A) Asociar empresa solo al deal
- B) Asociar empresa solo al contacto (primaria)
- C) Asociar empresa a ambos: contacto (primaria) y deal
**Decisión**: Asociar empresa a ambos: contacto (como primaria) y al deal. Al crear contacto, asociarlo al deal. Al crear empresa, asociarla al deal y, si existe contacto asociado, también al contacto como primaria.
**Rationale**:
- Refleja la relación natural Contacto ↔ Empresa en CRM y soporta reporting por empresa
- Evita inconsistencias: el deal queda vinculado a la empresa para KPIs y pipelines
- Minimiza ambigüedad en UI y datos (`mp_cliente_empresa` deja de confundirse con asociaciones reales)
**Consecuencias**:
- Nuevos endpoints: `/api/hubspot/contacts/create`, `/api/hubspot/companies/create`, `/api/hubspot/associations/create`
- UI: `DealSelector` muestra conteos reales (Contactos/Empresas) y ofrece modales para crear/ asociar
- Observación: si no se puede resolver el ID del contacto, la empresa se asocia solo al deal (fallback)
Contexto: Necesitamos reflejar que la cantidad final de cajas a medida e impresas puede variar (5% o 10%), y controlar ese valor desde el presupuestador para que se vea en el PDF dentro de “Aclaraciones Técnicas”.
Alternativas consideradas: Texto libre en condiciones / Slider de porcentaje / Dropdown con valores fijos (5% y 10%).
Decisión: Agregar un nuevo campo en Condiciones llamado “Variación Cantidad” con un dropdown que permita seleccionar 5% o 10%. Por defecto se selecciona 5%. El texto de “Aclaraciones Técnicas” se genera dinámicamente usando el porcentaje elegido.
Rationale: Mantiene consistencia con Condiciones de Pago/Entrega (control por dropdown), evita ambigüedad de texto libre, y simplifica DX y QA. 5% es el caso más frecuente; 10% se usa ocasionalmente.
Consecuencias: El PDF refleja el porcentaje elegido; se agrega `variacionCantidad` al tipo `CondicionesData`, opciones `VARIACION_CANTIDAD_OPTIONS`, y la UI de Condiciones incorpora el nuevo control. No se introducen dependencias nuevas.
## [2025-11-14] Verificación de empresa asociada en selección de Deal
Contexto: Al seleccionar un deal en el presupuestador, necesitamos saber si existe una empresa asociada (desde el deal o desde el contacto vinculado) para completar y mostrar la empresa en la UI.
Alternativas consideradas: Consultar solo contactos / Consultar solo empresas / Consultar ambas asociaciones y completar `mp_cliente_empresa`.
Decisión: Enriquecer la carga de deals (`/api/hubspot/deals`) consultando asociaciones de contactos y empresas (API CRM v4), y completar `mp_cliente_empresa` con el nombre de la empresa asociada si está disponible. En el selector se muestra “Empresa asociada: <nombre>” o “Sin empresa asociada”.
Rationale: Reduce ambigüedad y pasos manuales, mantiene consistencia con autocompletado de datos del contacto, mejora DX al evitar llamados extra al seleccionar.
Consecuencias: Aumenta la carga de la petición inicial de deals pero evita otra llamada por selección. No se agregan dependencias nuevas.
### [2025-11-14] HubSpot: propiedades al crear Empresa
**Contexto**: Simplificar los datos enviados al crear una empresa y alinear la UI con información útil para el equipo.
**Alternativas consideradas**: 
- A) Payload estándar HubSpot (name, domain, website, phone)
- B) Payload reducido con propiedades relevantes para la operación
**Decisión**: Usar únicamente las propiedades: `name`, `province`, `city`, `address` al crear una empresa.
**Rationale**: Menos ruido, foco en datos operativos, coherencia con el flujo del presupuestador.
**Consecuencias**: 
- API `/api/hubspot/companies/create` acepta cuerpo `{ properties: { name, province?, city?, address? } }` o plano.
- DealSelector muestra modal con esos campos exclusivos.
- Si `province` no existe en HubSpot, usar `state` o crear la propiedad personalizada.
- UI simplificada de asociaciones: se muestra un único conteo por tipo (sin "visibles / asociados").

### [2025-11-14] HubSpot: Fallback de asociaciones (v4 → v3)
**Contexto**: En algunos portales, el endpoint de labels para asociaciones (`crm/v4/associations/{from}/{to}/labels`) no devuelve tipos `HUBSPOT_DEFINED` para ciertos pares (ej. `deals→companies`), impidiendo crear asociaciones vía v4.
**Alternativas consideradas**:
- A) Requerir siempre labels v4 y abortar si faltan
- B) Fallback a v3 con tipos por defecto (`deal_to_company`, `contact_to_company`, etc.)
**Decisión**: Usar v4 cuando haya `HUBSPOT_DEFINED` disponible; si no, hacer fallback a v3 con el `associationType` por defecto según el par.
**Rationale**: Asegura que la asociación se complete en escenarios reales, independientemente de configuraciones del portal.
**Consecuencias**:
- Endpoint `/api/hubspot/associations/create` intenta v4 y cae a v3 si no hay `associationTypeId`.
- Mapeos soportados: `deals→contacts`, `deals→companies`, `contacts→companies`, `companies→contacts`, `companies→deals`, `contacts→deals`.