import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'

// Destino de la API en desarrollo; las peticiones a /api se reenvían allí (evita CORS).
const apiTarget = process.env.API_TARGET ?? 'http://localhost:8080'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    proxy: { '/api': apiTarget },
  },
  preview: {
    proxy: { '/api': apiTarget },
  },
})
