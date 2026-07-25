import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy API calls to the Flask backend so the frontend can use same-origin
    // relative paths like fetch('/api/items') in dev — no CORS, no hardcoded host.
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
