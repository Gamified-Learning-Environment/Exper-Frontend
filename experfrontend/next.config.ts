import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Disable static generation of internal pages
  skipTrailingSlashRedirect: true,

  webpack: (config) => {
    // Skip tree-shaking for problematic modules
    config.optimization.usedExports = false;
    return config;
  }
  
};

export default nextConfig;