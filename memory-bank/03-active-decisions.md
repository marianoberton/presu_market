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