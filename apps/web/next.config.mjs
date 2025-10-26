import withPWA from 'next-pwa'

const isDev = process.env.NODE_ENV !== 'production'

const pwa = withPWA({
  dest: 'public',
  disable: isDev,
  register: true,
  skipWaiting: true,
  // Limit runtime caching to the page shell (documents) only
  runtimeCaching: [
    {
      urlPattern: ({ request }) => request.destination === 'document',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'ff-page-shell',
        expiration: { maxEntries: 16, maxAgeSeconds: 3600 },
        networkTimeoutSeconds: 3,
      },
    },
  ],
  buildExcludes: [/middleware-manifest\.json$/],
})

/**
 * Wrap the Next config so webpack alias is guaranteed to be inside the export.
 */
const withAlias = (nextConfig = {}) => ({
  ...nextConfig,
  webpack(config, ctx) {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@focus-fade/core': coreDist,
    }
    // Preserve user-provided webpack if present
    if (typeof nextConfig.webpack === 'function') {
      return nextConfig.webpack(config, ctx)
    }
    return config
  },
})

export default pwa({
  reactStrictMode: true,
  output: 'export',
  images: { unoptimized: true },
  transpilePackages: ['@focus-fade/core'],
    eslint: { ignoreDuringBuilds: true }, 
 })
)
