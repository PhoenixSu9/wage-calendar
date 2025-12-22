import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0', // 监听所有网络地址
    port: 5173,      // 可选：指定端口
  },
  plugins: [react()]
});
