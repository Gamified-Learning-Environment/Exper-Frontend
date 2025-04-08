import type { NextConfig } from "next";

webpack: (config) => {
  // Skip tree-shaking for problematic modules
  config.optimization.usedExports = false;
  return config;
}

const nextConfig: NextConfig = {
  /* config options here */
  
};

export default nextConfig;