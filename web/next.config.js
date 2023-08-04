/** @type {import('next').NextConfig} */

// const withTM = require('next-transpile-modules')([
//   '@babel/preset-react',
// ]);

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH,
  trailingSlash: true,
  images: {
    domains: [
      'images.unsplash.com',
      'i.ibb.co',
      'scontent.fotp8-1.fna.fbcdn.net',
      'stripe.com',
      'js.stripe.com',
      'r.stripe.com'
    ],
    // Make ENV
    unoptimized: true,
  },
};

module.exports = nextConfig;
