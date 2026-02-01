/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false, // set true when NOT demoing PWA
})

const nextConfig = {
  reactStrictMode: true,

  // Ignore build issues (as you already had)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Image configuration (SAFE & COMPLETE)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'c.saavncdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.jiosaavn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.saavncdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pli.saavncdn.com',
        pathname: '/**',
      },
    ],
    domains: [
      'c.saavncdn.com',
      'www.jiosaavn.com',
      'static.saavncdn.com',
      'placehold.co',
      'pli.saavncdn.com',
    ],
  },
}

module.exports = withPWA(nextConfig)
