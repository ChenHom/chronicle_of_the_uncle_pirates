import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static exports for GitHub Pages
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Set base path if deploying to a subdirectory (uncomment if repo is not at root domain)
  basePath: process.env.NODE_ENV === 'production' ? '/chronicle_of_the_uncle_pirates' : '',
  
  // Trailing slash for better GitHub Pages compatibility
  trailingSlash: true,
};

export default nextConfig;
