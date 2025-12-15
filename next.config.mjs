/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  // Turbopack configuration
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
        },
      },
      resolveAlias: {
        // Fallback for wallet SDKs
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      },
      resolveExtensions: [
        '.js',
        '.jsx',
        '.ts',
        '.tsx',
        '.json',
        '.mjs',
      ],
    },
  },
  // Webpack fallback for non-Turbopack mode
  webpack: (config, { isServer }) => {
    // Fix for Webpack issues with wallet SDKs
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }
    return config
  },
}

export default nextConfig
