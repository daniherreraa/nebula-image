import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  // Optimize for production
  poweredByHeader: false,
  compress: true,

  // Image optimization
  images: {
    domains: ['lh3.googleusercontent.com'], // Google OAuth images
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
