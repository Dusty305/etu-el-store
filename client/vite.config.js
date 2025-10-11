import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000, // Клиент работает на 3000 порту
    proxy: {
      // Проксирование API запросов на бэкенд-сервер
      '/api': {
        target: 'http://localhost:5000', // Ваш Express сервер
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: '../server/public' // Для продакшена билд в папку сервера
  }
})