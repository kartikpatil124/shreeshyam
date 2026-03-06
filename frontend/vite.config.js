import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/admin': 'http://localhost:5000',
      '/orders': 'http://localhost:5000',
      '/suggestions': 'http://localhost:5000',
      '/assets': 'http://localhost:5000',
    }
  }
})
