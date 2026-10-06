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
  css: {
    preprocessorOptions: {
      scss: {
        // Vite 5 defaults to Sass's legacy JS API, which Dart Sass 2.0 removes
        api: 'modern-compiler'
      }
    }
  },
  // The env files live in the repo root, shared with the backend, Docker Compose and the scripts.
  // Only VITE_-prefixed names are exposed to the client, so the database credentials sitting in
  // the same file stay server-side.
  envDir: '..'
})
