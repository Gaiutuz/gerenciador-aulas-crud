import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Redireciona requisições /api para o backend durante o desenvolvimento
      '/api': {
        target: 'http://backend:5000',
        changeOrigin: true,
      },
    },
  },
})
