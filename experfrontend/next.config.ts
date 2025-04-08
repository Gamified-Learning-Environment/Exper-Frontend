import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  output: "standalone",
  
  // Prevent static generation
  staticPageGenerationTimeout: 60,
  
  // Specify which pages should be SSR only
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'exper-frontend.vercel.app', '*.railway.app']
    }
  },
  
  // Configure error handling during build
  onDemandEntries: {
    // Keep the not-found page from being generated statically
    maxInactiveAge: 60 * 1000,
  },
  
  webpack: (config) => {
    // Prevent modules from accessing browser APIs during SSR
    if (config.externals) {
      config.externals.push({
        'd3': 'commonjs d3',
        'd3-fetch': 'commonjs d3-fetch',
        'd3-selection': 'commonjs d3-selection'
      });
    }
    
    return config;
  }
  
};

export default nextConfig;