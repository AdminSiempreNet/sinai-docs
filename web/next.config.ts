import path from 'node:path';
import { createMDX } from 'fumadocs-mdx/next';
import type { NextConfig } from 'next';
import docenteRedirects from './lib/docente-redirects.json';
import estudianteRedirects from './lib/estudiante-redirects.json';

const nextConfig: NextConfig = {
  experimental: {
    // Next 16.2 usa procesos de Node separados para cada evaluación de
    // PostCSS. En este proyecto pueden acumularse cientos de procesos y
    // agotar la memoria del equipo. Los worker threads comparten el proceso
    // de Next y evitan esa multiplicación en desarrollo.
    turbopackPluginRuntimeStrategy: 'workerThreads',
  },
  // La carpeta padre también tiene un lockfile. Sin esta raíz, Turbopack
  // toma sinai-docs/ en lugar de esta aplicación.
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'thumbnails.odycdn.com' },
    ],
  },
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
