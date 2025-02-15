import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  webpack: (config) => {
    // Exclude marketing-site from webpack compilation
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        ...(Array.isArray(config.watchOptions?.ignored)
          ? config.watchOptions.ignored
          : []),
        "**/marketing-site/**",
      ],
    };
    return config;
  },
};

export default nextConfig;
