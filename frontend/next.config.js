/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  // Load environment variables from root .env file
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  },
  
  images: {
    domains: ['localhost', 'lh3.googleusercontent.com'],
  },
  
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
}

module.exports = nextConfig