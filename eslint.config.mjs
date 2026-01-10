/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimasi untuk development
  experimental: {
    optimizeCss: true,
  },
  
  // Webpack config untuk mengatasi masalah compiling
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Optimasi untuk development
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }
    return config;
  },

  // Optimasi untuk TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint config
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;