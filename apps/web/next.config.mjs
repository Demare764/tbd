import withPWA from 'next-pwa'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const coreDist = path.resolve(__dirname, '../..', 'packages/core/dist')

const isDev = process.env.NODE_ENV !== 'production'

const withPwa = withPWA({
  dest: 'public',
  disable: isDev,
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: ({ request }) => request.destination === 'document',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'ff-page-shell',
        expiration: { maxEntries: 16, maxAgeSeconds: 3600 },
        networkTimeoutSeconds: 3
      }
    }
  ],
  buildExcludes: [/middleware-manifest\.json$/]
})

const config = {
  reactStrictMode: true,
  output: 'export',
  images: { unoptimized: true },
  transpilePackages: ['@focus-fade/core'],
  eslint: { ignoreDuringBuilds: true },
  webpack: (config) => {
    if (!config.resolve) config.resolve = {}
    if (!config.resolve.alias) config.resolve.alias = {}
    config.resolve.alias['@focus-fade/core'] = coreDist
    return config
  }
}

export default withPwa(config)
