/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { federation } from '@module-federation/vite';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/admin-mfe',
  server: {
    port: 5176,
    host: 'localhost',
    hmr: {
      host: 'localhost',
      port: 5176,
      protocol: 'http',
      overlay: true,
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  preview: {
    port: 5176,
    host: 'localhost',
  },
  plugins: [
    react(),
    nxViteTsPaths(),
    nxCopyAssetsPlugin(['*.md']),
    federation({
      name: 'adminMfe',
      filename: 'remoteEntry.js',
      manifest: true,
      exposes: {
        './Module': './src/app/app.tsx',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
        'react-router-dom': { singleton: true },
        zustand: {},
        '@tanstack/react-query': {},
        zod: {},
      },
    }),
  ],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  build: {
    outDir: '../../dist/apps/admin-mfe',
    emptyOutDir: true,
    reportCompressedSize: true,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));
