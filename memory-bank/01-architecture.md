# Arquitectura - Generador de Presupuestos

## Visión General
Aplicación web de página única (SPA) construida con Next.js que sigue una arquitectura por capas limpia y modular.

## Módulos Principales

### 1. Presentación (UI Layer)
- **Ubicación**: `src/app/` y `src/components/`
- **Responsabilidad**: Interfaz de usuario, formularios, navegación
- **Tecnologías**: React, Next.js App Router, Tailwind CSS

### 2. Lógica de Negocio (Business Layer)
- **Ubicación**: `src/lib/` y `src/hooks/`
- **Responsabilidad**: Cálculos, validaciones, reglas de negocio
- **Tecnologías**: TypeScript, React Hooks

### 3. Generación de Documentos (Document Layer)
- **Ubicación**: `src/pdf/`
- **Responsabilidad**: Creación y renderizado de PDFs
- **Tecnologías**: @react-pdf/renderer

### 4. Utilidades (Utils Layer)
- **Ubicación**: `src/utils/`
- **Responsabilidad**: Funciones auxiliares, formateo, validaciones
- **Tecnologías**: TypeScript

## Estructura de Directorios

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Página principal
│   ├── layout.tsx         # Layout global
│   └── globals.css        # Estilos globales
├── components/            # Componentes React reutilizables
│   ├── ui/               # Componentes base (botones, inputs)
│   ├── forms/            # Componentes de formularios
│   └── layout/           # Componentes de layout
├── lib/                  # Lógica de negocio
│   ├── types.ts          # Definiciones de tipos
│   ├── calculations.ts   # Lógica de cálculos
│   └── validations.ts    # Validaciones
├── pdf/                  # Generación de PDF
│   ├── components/       # Componentes PDF
│   └── templates/        # Plantillas PDF
├── hooks/                # Custom React Hooks
└── utils/                # Utilidades generales
```

## Flujo de Datos

```
Usuario Input → Formulario → Estado Local → Cálculos → PDF Generator → Descarga
```

1. **Captura**: Usuario ingresa datos en formulario
2. **Validación**: Validación en tiempo real de campos
3. **Cálculo**: Actualización automática de totales
4. **Generación**: Creación del PDF con datos validados
5. **Descarga**: Entrega del archivo al usuario

## Contratos entre Capas

### Interface: PresupuestoData
```typescript
interface PresupuestoData {
  cliente: ClienteData;
  productos: ProductoData[];
  condiciones: CondicionesData;
  totales: TotalesData;
}
```

### Interface: ProductoData
```typescript
interface ProductoData {
  descripcion: string;
  largo: number;
  ancho: number;
  alto: number;
  calidad: string;
  color: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}
```

## Decisiones Arquitectónicas (ADRs)

### ADR-001: Next.js App Router
- **Contexto**: Necesidad de framework React moderno
- **Decisión**: Usar Next.js 14+ con App Router
- **Rationale**: SSR, optimizaciones automáticas, estructura clara
- **Consecuencias**: Mejor performance, SEO mejorado

### ADR-002: @react-pdf/renderer
- **Contexto**: Generación de PDFs desde React
- **Decisión**: Usar @react-pdf/renderer sobre jsPDF
- **Rationale**: Integración nativa con React, mejor control de layout
- **Consecuencias**: PDFs más consistentes, código más mantenible

### ADR-003: Estado Local con useState
- **Contexto**: Manejo de estado del formulario
- **Decisión**: Usar useState en lugar de Redux/Zustand
- **Rationale**: Aplicación simple, estado no compartido
- **Consecuencias**: Menos complejidad, desarrollo más rápido

## Patrones de Diseño

### 1. Compound Components
Para formularios complejos con múltiples secciones relacionadas.

### 2. Custom Hooks
Para lógica reutilizable de cálculos y validaciones.

### 3. Render Props
Para componentes PDF que necesitan datos dinámicos.

## Consideraciones de Performance

- **Code Splitting**: Carga lazy de componentes PDF
- **Memoización**: React.memo para componentes pesados
- **Debouncing**: En cálculos automáticos para evitar re-renders excesivos

## Consideraciones de Seguridad

- **Validación**: Validación tanto en cliente como en tipos TypeScript
- **Sanitización**: Limpieza de inputs antes de generar PDF
- **CSP**: Content Security Policy para prevenir XSS