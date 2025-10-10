import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    devSourcemap: true,
  },
  esbuild: {
    sourcemap: true,
  },
  server: {
    sourcemapIgnoreList: () => false,
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Split the heaviest libraries into their own chunks so they
        // don't inflate the main bundle. CSS-only packages like bootstrap-icons
        // shouldn't be listed here because they lack a JS entry point.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router-dom')) return 'react-router-dom'
            if (id.includes('react-dom') || id.includes('react/jsx-runtime')) return 'react-dom'
            if (id.includes('reactflow')) return 'reactflow'
            if (id.includes('bootstrap')) return 'bootstrap'
            if (id.includes('react')) return 'react'
          }
        },
      },
    },
  },
})
