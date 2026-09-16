import { createMDX } from 'fumadocs-mdx/next';
import type { NextConfig } from 'next';
import docenteRedirects from './lib/docente-redirects.json';
import estudianteRedirects from './lib/estudiante-redirects.json';

const nextConfig: NextConfig = {
  async redirects() {
    return [...docenteRedirects, ...estudianteRedirects];
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
