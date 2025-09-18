import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: "/",
  server: {
    host: true,
    allowedHosts: [
      '421fb2b6d90d.ngrok-free.app'
    ]
  }
})
