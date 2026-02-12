import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icon-512.png', 'icon-192.png', 'icon-144.png'],
      manifest: {
        name: 'Telefe Stream',
        short_name: 'Telefe TV',
        description: 'Acceso directo a la señal pública de Telefe en vivo',
        start_url: '/watch',
        display: 'standalone',
        orientation: 'any',
        background_color: '#0d0d0d',
        theme_color: '#0d0d0d',
        categories: ['entertainment'],
        lang: 'es',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icon-144.png',
            sizes: '144x144',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.akamaized\.net\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /.*\.m3u8$/i,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /.*\.ts$/i,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/api/tokenize': {
        target: 'https://mitelefe.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tokenize/, '/vidya/tokenize'),
        headers: {
          Referer: 'https://mitelefe.com/vivo',
          Origin: 'https://mitelefe.com',
        },
      },
    },
  },
})
