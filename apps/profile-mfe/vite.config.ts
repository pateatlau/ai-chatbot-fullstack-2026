/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { federation } from '@module-federation/vite';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/profile-mfe',
  server: {
    port: 5177,
    host: 'localhost',
    hmr: {
      overlay: true,
    },
  },
  preview: {
    port: 5177,
    host: 'localhost',
  },
  plugins: [
    react(),
    nxViteTsPaths(),
    nxCopyAssetsPlugin(['*.md']),
    federation({
      name: 'profileMfe',
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
    outDir: '../../dist/apps/profile-mfe',
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
