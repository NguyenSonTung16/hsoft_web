import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/graphql': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'www',   // Capacitor sẽ lấy folder này để tạo app mobile
    emptyOutDir: true, // Xóa folder www cũ trước khi build
  },
})
