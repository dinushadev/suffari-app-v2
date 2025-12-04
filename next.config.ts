import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raahi-pub-dev.s3.us-east-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'raahi-pub-dev.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
