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
        expiration: { maxEntries: 16, maxAgeSeconds: 60 * 60 },
        networkTimeoutSeconds: 3,
      },
    },
  ],
  buildExcludes: [/middleware-manifest\.json$/],
})

export default pwa({
  reactStrictMode: true,
  output: 'export',
  images: { unoptimized: true },
})
