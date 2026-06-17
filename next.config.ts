import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // cheerio is a server-only dependency; keep it out of any client bundle.
  serverExternalPackages: ['cheerio', 'postgres'],
};

export default nextConfig;
