import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    quasar({
      sassVariables: fileURLToPath(
        new URL('./src/quasar-variables.sass', import.meta.url)
      )
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8005',
        changeOrigin: true
      },
      '/auth': {
        target: 'http://localhost:8005',
        changeOrigin: true
      }
    }
  }
})