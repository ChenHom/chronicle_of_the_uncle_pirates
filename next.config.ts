import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Disable image optimization for better compatibility
  images: {
    unoptimized: true,
  },
  
  // Trailing slash for better compatibility
  trailingSlash: true,
  
  // Use default Next.js build directory
  distDir: '.next',
};

export default nextConfig;
