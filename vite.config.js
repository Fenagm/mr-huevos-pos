import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    cors: true,
    // Permite que netlify dev (en :8888) haga proxy a Vite (:3000)
    // Vite 5 bloquea requests cuyo Host no coincide — esto lo deshabilita en dev
    allowedHosts: 'all',
  },
  build: {
    outDir: 'dist',
  },
})
