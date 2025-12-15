import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración básica para el build
  typescript: {
    // Permitir warnings durante el build
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
