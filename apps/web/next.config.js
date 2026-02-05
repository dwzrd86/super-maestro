/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Enable experimental features if needed
  experimental: {
    // typedRoutes: true,
  },

  // Transpile shared package
  transpilePackages: ['@agentforge/shared'],

  // Image optimization domains (add as needed)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },

  // Environment variables to expose to the browser
  env: {
    NEXT_PUBLIC_APP_NAME: 'AgentForge',
  },
};

module.exports = nextConfig;
