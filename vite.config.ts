import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
