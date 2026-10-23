const nextConfig = {
  output: 'standalone',
  // Deliver Tailwind styles with the HTML to remove the initial CSS request chain.
  experimental: { inlineCss: true },
  images: {
    loader: 'custom',
    loaderFile: './lib/imageLoader.ts',
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 480, 640, 768, 1080, 1440],
    imageSizes: [32, 64, 96, 128, 256, 384],
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
      },
      {
        protocol: 'https',
        hostname: 'api.heywomaniyaa.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(categoryImage|bags|images|products|models)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/:path*.(woff|woff2|eot|ttf|otf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*.(png|jpg|jpeg|gif|webp|avif|svg|ico|mp4|webm)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};

export default nextConfig;