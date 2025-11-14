import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración básica para el build
  eslint: {
    // Ignorar errores de ESLint durante el build (se corrigen en PR aparte)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Permitir warnings durante el build
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
