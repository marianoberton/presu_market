import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración básica para el build
  eslint: {
    // Permitir warnings durante el build
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Permitir warnings durante el build
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
