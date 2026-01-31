import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Allow ngrok and other tunneling services
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'unpromoted-lashay-hyperidealistic.ngrok-free.dev'
    ],
    // Proxy API calls to the backend
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        // Handle WebSocket connections if needed
        ws: true,
        // Don't verify SSL certificates (for development)
        secure: false
      }
    }
  }
});
