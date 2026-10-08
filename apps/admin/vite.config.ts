import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api/v1/local-commerce': { target: process.env.PRODUCT_SURFACES_API_URL || 'http://localhost:5003', changeOrigin: true }, '/api/v1/admin/dev/product-surfaces': { target: process.env.PRODUCT_SURFACES_API_URL || 'http://localhost:5003', changeOrigin: true } } },
})
