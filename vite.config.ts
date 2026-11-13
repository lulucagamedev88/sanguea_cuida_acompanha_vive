
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    base: '/',

    plugins: [
      react(),
      tailwindcss(),

      VitePWA({
        registerType: 'autoUpdate',

        includeAssets: [
          'favicon.ico',
          'apple-touch-icon.png',
          'icon.svg',
        ],

        manifest: {
          id: '/',
          name: 'Sanguea — Cuida. Acompanha. Vive.',
          short_name: 'Sanguea',
          description:
            'Apoio ao acompanhamento de pessoas com doença falciforme.',

          theme_color: '#991b1b',
          background_color: '#fafaf9',

          display: 'standalone',
          orientation: 'portrait-primary',

          start_url: '/',
          scope: '/',

          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },

        workbox: {
          globPatterns: [
            '**/*.{js,css,html,ico,png,svg,woff,woff2,jpg,jpeg,webp,mp3}',
          ],
        },

        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],

    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },

    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
      allowedHosts: true as const,
      // Preserve the existing AI Studio HMR configuration.
      hmr: process.env.DISABLE_HMR !== 'true',

      watch:
        process.env.DISABLE_HMR === 'true'
          ? null
          : {},
    },
  };
});
