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
    ],
  },

  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },

  webpack: (config) => {
    // Suppress Leaflet's "window is not defined" warning during SSR
    config.resolve.fallback = { fs: false };
    return config;
  },
};

export default nextConfig;
