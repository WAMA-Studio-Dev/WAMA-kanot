import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite abrir el servidor de desarrollo desde el móvil en la misma red Wi-Fi.
  allowedDevOrigins: ["192.168.*.*"],
  images: {
    qualities: [75, 90, 95, 100],
  },
};

export default nextConfig;
