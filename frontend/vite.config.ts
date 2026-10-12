import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // The React Compiler runs through oxc; plugin-react v6 dropped its Babel integration.
  // Needs the optional `oxc-transform-react` package installed.
  plugins: [react({ compiler: true })],
  server: {
    proxy: {
      '/api': {
        target: process.env["DOCKER"] ? "http://backend:3000" : "http://localhost:3000",
        changeOrigin: true,
      }
    }
  },
  // The env files live in the repo root, shared with the backend, Docker Compose and the scripts.
  // Only VITE_-prefixed names are exposed to the client, so the database credentials sitting in
  // the same file stay server-side.
  envDir: '..'
})
