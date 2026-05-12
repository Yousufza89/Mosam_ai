/** @type {import('next') } */

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mosam-ai.vercel.app',
        port: '3000',
        pathname: '/predict',
      },
    ],
  },
}

module.exports = nextConfig
