import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    // Proxy: redireciona /api para o backend Fastify em dev
    proxy: {
      '/api': {
        target:    'http://localhost:3001',
        changeOrigin: true,
        ws:        true  // suporte a WebSocket (SSE funciona via HTTP)
      }
    }
  },
  build: {
    outDir:    'dist',
    sourcemap: true
  },
  define: {
    // Garante que import.meta.env.VITE_API_URL funciona
    __APP_VERSION__: JSON.stringify('1.0.0')
  }
})
