/** @type {import('next').NextConfig} */
const enableWorkerThreads = process.env.NEXT_ENABLE_WORKER_THREADS === 'true'

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
    ...(enableWorkerThreads ? { workerThreads: true } : {}),
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
