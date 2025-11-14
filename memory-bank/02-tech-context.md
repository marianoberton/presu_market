# Contexto Técnico - Generador de Presupuestos

## Stack Tecnológico

### Frontend Framework
- **Next.js**: 15.5.4 (App Router)
- **React**: 18.x
- **TypeScript**: 5.x

### Estilos y UI
- **Tailwind CSS**: 3.x
- **Lucide React**: Para iconografía
- **class-variance-authority**: Para variantes de componentes
- **clsx + tailwind-merge**: Para manejo de clases CSS

### Generación de PDF
- **@react-pdf/renderer**: 4.x

### Herramientas de Desarrollo
- **ESLint**: Linting de código
- **TypeScript**: Tipado estático
- **PostCSS**: Procesamiento de CSS

## Versiones y Dependencias

### Dependencias de Producción
```json
{
  "@react-pdf/renderer": "^4.0.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "lucide-react": "^0.468.0",
  "next": "15.5.4",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "tailwind-merge": "^2.5.5"
}
```

### Dependencias de Desarrollo
```json
{
  "@eslint/eslintrc": "^3.2.0",
  "@tailwindcss/postcss": "^4.0.0",
  "@types/node": "^22.10.2",
  "@types/react": "^18.3.17",
  "@types/react-dom": "^18.3.5",
  "eslint": "^9.17.0",
  "eslint-config-next": "15.5.4",
  "tailwindcss": "^3.4.17",
  "typescript": "^5.7.2"
}
```

## Scripts de Desarrollo

### Comandos Principales
```bash
# Desarrollo local
npm run dev

# Build de producción
npm run build

# Iniciar servidor de producción
npm run start

# Linting
npm run lint

# Verificación de tipos
npx tsc --noEmit
```

### Comandos de Utilidad
```bash
# Instalar dependencias
npm install

# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json && npm install

# Verificar vulnerabilidades
npm audit

# Actualizar dependencias
npm update
```

### HubSpot – Utilitarios (Contactos)
```bash
# Verificar propiedades mp_* de CONTACTOS (ManyChat)
node scripts/check-hubspot-contact-properties.js

# Crear propiedades mp_* de CONTACTOS si faltan
node scripts/create-hubspot-contact-properties.js
```

Requiere configurar en `.env.local` una de:
```bash
HUBSPOT_ACCESS_TOKEN="<token OAuth/API>"
# o
HUBSPOT_TOKEN="<token>"
```

## Configuración de Entorno

### Variables de Entorno (.env.local)
```bash
# Configuración de desarrollo
NODE_ENV=development

# URLs y configuración
NEXT_PUBLIC_APP_NAME="Generador de Presupuestos Market Paper"
NEXT_PUBLIC_COMPANY_NAME="Market Paper"
```

### Archivo .env.example
```bash
# Copiar a .env.local y configurar valores
NODE_ENV=development
NEXT_PUBLIC_APP_NAME="Generador de Presupuestos Market Paper"
NEXT_PUBLIC_COMPANY_NAME="Market Paper"
```

## Configuración de Tailwind CSS

### tailwind.config.js
```javascript
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colores corporativos Market Paper
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          500: '#6b7280',
          900: '#111827',
        }
      }
    },
  },
  plugins: [],
}
```

## Configuración de TypeScript

### tsconfig.json (configuración actual)
- Strict mode habilitado
- Path mapping con alias `@/*`
- Target ES2017
- Module resolution Node

## Estructura de Desarrollo

### Puertos y URLs
- **Desarrollo**: http://localhost:3000
- **Build**: Puerto configurable (default 3000)

### Navegadores Soportados
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Comandos de Deployment

### Build Local
```bash
npm run build
npm run start
```

### Verificación Pre-Deploy
```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Herramientas de Debugging

### React Developer Tools
- Extensión de navegador recomendada
- Útil para inspeccionar estado de componentes

### Next.js DevTools
- Análisis de performance
- Inspección de rutas y componentes

## Consideraciones de Performance

### Optimizaciones Automáticas de Next.js
- Image optimization
- Font optimization
- Code splitting automático
- Static generation cuando sea posible

### Métricas a Monitorear
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Time to Interactive (TTI)