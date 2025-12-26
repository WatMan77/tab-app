import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    babel: {
      plugins: ['babel-plugin-react-compiler']
    }
  })],
  server: {
    proxy: {
      '/api': {
        target: process.env["DOCKER"] ? "http://backend:3000" : "http://localhost:3000",
        changeOrigin: true,
      }
    }
  },
  define: {
    'process.env': process.env
  }
})
