import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  devIndicators: false,
  allowedDevOrigins: ["192.168.1.6", "192.168.43.68", "localhost"],
};

export default nextConfig;
