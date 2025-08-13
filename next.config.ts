import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static exports for GitHub Pages
  output: 'export',
  
  // Specify output directory
  distDir: 'out',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Set base path if deploying to a subdirectory (uncomment and modify if needed)
  // basePath: '/chronicle_of_the_uncle_pirates',
  
  // Trailing slash for better GitHub Pages compatibility
  trailingSlash: true,
};

export default nextConfig;
