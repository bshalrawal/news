
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
       {
        protocol: 'https',
        hostname: 'assets-api.kathmandupost.com',
      },
      {
        protocol: 'https',
        hostname: 'assets-cdn.kathmandupost.com',
      },
       {
        protocol: 'https',
        hostname: 'scontent.fktm8-1.fna.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
       {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  productionBrowserSourceMaps: false,
};

export default nextConfig;
