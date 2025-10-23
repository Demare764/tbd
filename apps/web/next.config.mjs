import withPWA from 'next-pwa'

/**
 * PWA is disabled in development to keep DX snappy.
 * Enable in production builds only.
 */
const isDev = process.env.NODE_ENV !== 'production'

const pwa = withPWA({
  dest: 'public',
  disable: isDev,
  register: true,
  skipWaiting: true,
  buildExcludes: [/middleware-manifest\.json$/]
})

export default pwa({
  reactStrictMode: true,
  experimental: {
    // opt-in flags can go here if needed for Next 15
  }
})
