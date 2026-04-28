import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API_TARGET = process.env.VITE_PROXY_API ?? 'http://127.0.0.1:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/audits': { target: API_TARGET, changeOrigin: true },
      '/governance': { target: API_TARGET, changeOrigin: true },
      '/audit-proof': { target: API_TARGET, changeOrigin: true },
      '/audit-logs': { target: API_TARGET, changeOrigin: true },
      '/threads': { target: API_TARGET, changeOrigin: true },
    },
  },
})
