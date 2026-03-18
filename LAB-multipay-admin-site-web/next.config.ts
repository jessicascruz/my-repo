import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: false,
      },
    ]
  },
  images: {
    domains: [
      process.env.NEXT_PUBLIC_NO_IMAGE_DOMAIN!,
      process.env.NEXT_PUBLIC_IMAGE_DOMAIN!,
    ],
  },
}

export default nextConfig
