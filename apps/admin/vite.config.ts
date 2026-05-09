import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@amber/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts')
    }
  },
  server: {
    port: 3000
  },
  optimizeDeps: {
    include: []
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'zustand'],
          'ui-icons': ['lucide-react'],
          'editor': ['react-quill-new'],
          'animation': ['framer-motion']
        }
      }
    }
  }
})
