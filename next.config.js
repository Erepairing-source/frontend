const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  },
  transpilePackages: ['lucide-react'],
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@lib': path.join(__dirname, 'lib'),
    }
    // Fix for lucide-react barrel exports in Next.js
    if (!isServer) {
      // Ensure proper handling of ESM modules
      config.resolve.extensionAlias = {
        '.js': ['.js', '.ts', '.tsx'],
      }
    }
    return config
  },
}

module.exports = nextConfig




