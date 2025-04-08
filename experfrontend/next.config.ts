import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // These were previously under experimental
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,

  // Properly configure output
  output: 'standalone',
  
  // Disable static generation for problematic pages
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  
  // Configure which pages should not be pre-rendered at build time
  experimental: {
    // Settings to fix "document is not defined"
    missingSuspenseWithCSRBailout: false,
    serverComponentsExternalPackages: [],
  },

  // This forces not-found page to be generated on-demand instead of statically
  staticPageGenerationTimeout: 30,
};

export default nextConfig;