import { createMDX } from 'fumadocs-mdx/next';
import type { NextConfig } from 'next';
import docenteRedirects from './lib/docente-redirects.json';

const nextConfig: NextConfig = {
  async redirects() {
    return docenteRedirects;
  },
  async rewrites() {
    return [
      {
        source: '/docs/:path*.md',
        destination: '/llms.mdx/docs/:path*',
      },
    ];
  },
};

const withMDX = createMDX();

export default withMDX(nextConfig);
