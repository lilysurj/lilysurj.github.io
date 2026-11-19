import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { imagetools } from 'vite-imagetools'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    imagetools({
      // Default filter is case-sensitive, which skipped the .JPG photos
      include: /^[^?]+\.(avif|gif|heif|jpeg|jpg|png|tiff|webp)(\?.*)?$/i,
    }),
  ],
})
