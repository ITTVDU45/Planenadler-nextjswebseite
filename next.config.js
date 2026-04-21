const withSerwist = require('@serwist/next').default

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next.js 16: Turbopack ist Standard; leere Config vermeidet Konflikt mit Webpack-Plugin (Serwist).
  turbopack: { root: __dirname },
  async headers() {
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    ]
    if (process.env.NODE_ENV === 'production') {
      securityHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      })
    }
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0, must-revalidate' }],
      },
      {
        source: '/_next/static/webpack/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      // Browser fragen oft /favicon.ico an; statisches ICO entfernt – gleiche Grafik wie Markenlogo
      { source: '/favicon.ico', destination: '/Planenadlerlogo.png' },
    ]
  },
  async redirects() {
    return [
      { source: '/warenkorb', destination: '/cart', permanent: true },
      { source: '/handlekurv', destination: '/cart', permanent: true },
      { source: '/logg-inn', destination: '/anmelden', permanent: true },
      { source: '/min-konto', destination: '/mein-konto', permanent: true },
      { source: '/produkt/:slug', destination: '/product/:slug', permanent: true },
      { source: '/produkter', destination: '/shop', permanent: true },
      { source: '/kategorier', destination: '/shop', permanent: true },
      // Kategorieseiten nicht anzeigen – direkt auf Produktseite weiterleiten
      { source: '/shop/:slug', destination: '/product/:slug', permanent: true },
      { source: '/ThankYou', destination: '/thank-you', permanent: false },
      { source: '/thankyou', destination: '/thank-you', permanent: false },
    ]
  },
  images: {
    // Erlaubt Bilder von localhost/127.0.0.1 (z. B. lokales WordPress :8080)
    dangerouslyAllowLocalIP: true,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    // quality 90 wird in Hero/Placeholder genutzt
    qualities: [75, 90],
    remotePatterns: [
      // Lokales WordPress (Docker) – localhost und 127.0.0.1
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8080',
        pathname: '/**',
      },
      // Produktion / Remote WordPress (Blog-Featured-Images, WooCommerce)
      {
        protocol: 'https',
        hostname: 'shop.planenadler.de',
        pathname: '/**',
      },
      // WordPress Backend (wp.planenadler.de)
      {
        protocol: 'https',
        hostname: 'wp.planenadler.de',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'swewoocommerce.dfweb.no',
        pathname: '/**',
      },
      // Cloudinary (Placeholder etc.)
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      // Placeholder Fallback
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      // Unsplash (Blog-Mock-Bilder)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      // Pravatar (Blog-Mock-Avatare)
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        pathname: '/**',
      },
    ],
  },
}

const serwistOptions = {
  swSrc: 'src/sw.ts',
  swDest: 'public/sw.js',
  additionalPrecacheEntries: [{ url: '/~offline', revision: null }],
  // PWA in Development deaktivieren – @serwist/next unterstützt Turbopack nicht.
  disable: process.env.NODE_ENV !== 'production',
  /**
   * Gehashte Chunks/CSS/Fonts ändern sich bei jedem Build. Im Precache führt ein Deploy zu
   * 404 („bad-precaching-response“), wenn noch ein alter SW aktiv ist. Diese Assets werden
   * über Runtime-Caching in src/sw.ts (StaleWhileRevalidate) geladen.
   */
  exclude: [
    ({ asset }) => {
      const n = String(asset.name).replace(/\\/g, '/')
      return (
        n.includes('static/chunks/') ||
        n.includes('static/css/') ||
        n.includes('static/media/')
      )
    },
  ],
}

module.exports = withSerwist(serwistOptions)(nextConfig)
