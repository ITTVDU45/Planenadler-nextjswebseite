const withSerwist = require('@serwist/next').default

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next.js 16: Turbopack ist Standard; leere Config vermeidet Konflikt mit Webpack-Plugin (Serwist).
  turbopack: { root: __dirname },
  async headers() {
    return [
      {
        source: '/_next/static/webpack/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ]
  },
  async redirects() {
    return [
      { source: '/warenkorb', destination: '/cart', permanent: true },
      { source: '/handlekurv', destination: '/cart', permanent: true },
      { source: '/min-konto', destination: '/mein-konto', permanent: true },
      // Kategorieseiten nicht anzeigen – direkt auf Produktseite weiterleiten
      { source: '/shop/:slug', destination: '/product/:slug', permanent: true },
    ]
  },
  images: {
    // Erlaubt Bilder von localhost/127.0.0.1 (z. B. lokales WordPress :8080)
    dangerouslyAllowLocalIP: true,
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
      {
        protocol: 'https',
        hostname: 'swewoocommerce.dfweb.no',
        pathname: '**',
      },
      // Cloudinary (Placeholder etc.)
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '**',
      },
      // Placeholder Fallback
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '**',
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
}

module.exports = withSerwist(serwistOptions)(nextConfig)
