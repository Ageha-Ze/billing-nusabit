/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimasi untuk development
  experimental: {
    optimizeCss: true,
  },

  // Optimasi untuk TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // Turbopack disabled due to memory issues
  // turbopack: {},
};

module.exports = nextConfig;
