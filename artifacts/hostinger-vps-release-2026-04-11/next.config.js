/** @type {import(''next'').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/cms',
        permanent: false,
      },
    ]
  },
  experimental: {
    workerThreads: true,
    webpackBuildWorker: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/aida-public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

module.exports = nextConfig
