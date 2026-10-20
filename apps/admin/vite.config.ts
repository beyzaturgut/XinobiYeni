import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// Only the isolated QA launcher protects the received catalog from Admin writes.
const qaCatalogGuard: Plugin = {
  name: 'xinobi-qa-catalog-read-only',
  configureServer(server) {
    server.middlewares.use((request, response, next) => {
      if (request.url?.startsWith('/api/v1/local-commerce') && !['GET', 'HEAD'].includes(request.method || '')) {
        response.statusCode = 405
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ message: 'QA katalog verileri salt okunurdur.' }))
        return
      }
      next()
    })
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), ...(process.env.XINOBI_QA_MODE === 'true' ? [qaCatalogGuard] : [])],
  server: { proxy: { '/api/v1/local-commerce': { target: process.env.PRODUCT_SURFACES_CATALOG_API_URL || process.env.PRODUCT_SURFACES_API_URL || 'http://localhost:5003', changeOrigin: true } } },
})
