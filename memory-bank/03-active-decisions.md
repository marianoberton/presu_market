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

### [2025-12-15] Color Editable para Productos Específicos
**Contexto**: Necesidad de campo de color libre para Polímero, Bandeja, Sacabocado y Otros Items.
**Decisión**: 
- Usar Input (texto libre) para estos productos.
- Mantener Select (opciones fijas) para el resto.
- En PDF, si el color está vacío para estos productos, no mostrar nada (ni guión).
**Rationale**:
- Flexibilidad para productos que no tienen colores estándar de papel.
- Limpieza en el reporte PDF evitando campos vacíos o guiones innecesarios.
**Consecuencias**:
- Lógica condicional en formulario y generador de PDF.
