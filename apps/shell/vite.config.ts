/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { federation } from '@module-federation/vite';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/shell',
  server: {
    port: 5173,
    host: 'localhost',
    hmr: {
      host: 'localhost',
      port: 5173,
      protocol: 'http',
      overlay: true,
    },
  },
  preview: {
    port: 5173,
    host: 'localhost',
  },
  plugins: [
    react(),
    nxViteTsPaths(),
    nxCopyAssetsPlugin(['*.md']),
    federation({
      name: 'shell',
      remotes: {
        authMfe: {
          type: 'module',
          name: 'authMfe',
          entry: 'http://localhost:5174/remoteEntry.js',
          entryGlobalName: 'authMfe',
          shareScope: 'default',
        },
        chatbotMfe: {
          type: 'module',
          name: 'chatbotMfe',
          entry: 'http://localhost:5175/remoteEntry.js',
          entryGlobalName: 'chatbotMfe',
          shareScope: 'default',
        },
        adminMfe: {
          type: 'module',
          name: 'adminMfe',
          entry: 'http://localhost:5176/remoteEntry.js',
          entryGlobalName: 'adminMfe',
          shareScope: 'default',
        },
        profileMfe: {
          type: 'module',
          name: 'profileMfe',
          entry: 'http://localhost:5177/remoteEntry.js',
          entryGlobalName: 'profileMfe',
          shareScope: 'default',
        },
      },
      dev: {
        enableDynamicRemoteImport: true,
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
    outDir: '../../dist/apps/shell',
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
