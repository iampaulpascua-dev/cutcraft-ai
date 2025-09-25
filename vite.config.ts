import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/lib/utils": path.resolve(__dirname, "./src/components/ui/utils.ts")
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true
  },
  preview: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true
  }
})