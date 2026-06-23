/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable Strict Mode to prevent Leaflet "Map container already initialized"
  // error caused by React's intentional double-mount in development
  reactStrictMode: false,

  transpilePackages: ['react-leaflet', '@changey/react-leaflet-markercluster'],

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.ndtv.com' },
      { protocol: 'https', hostname: '**.thehindu.com' },
      { protocol: 'https', hostname: '**.hindustantimes.com' },
      { protocol: 'https', hostname: '**.indiatoday.in' },
      { protocol: 'https', hostname: '**.timesofindia.com' },
      { protocol: 'https', hostname: 'images.news18.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
  },

  // ── Security Headers ──────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'X-Frame-Options',            value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection',           value: '1; mode=block' },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',         value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // Cache static assets aggressively
        source: '/(_next/static|favicon.ico|.*\\.png|.*\\.svg|.*\\.geojson)(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  webpack: (config) => {
    // Suppress Leaflet's "window is not defined" warning during SSR
    config.resolve.fallback = { fs: false };
    return config;
  },
};

export default nextConfig;
