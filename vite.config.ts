import { copyFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { imagetools } from 'vite-imagetools'

// Keep in sync with PAGES in src/App.tsx
const PAGE_ROUTES = ['about', 'words', 'gallery', 'projects']

// GitHub Pages only serves files that exist, so give each page its own
// index.html for direct links like /gallery to load the app instead of a 404
const pageRoutes = (): Plugin => {
  let outDir = 'dist'
  return {
    name: 'page-routes',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir
    },
    closeBundle() {
      for (const route of PAGE_ROUTES) {
        mkdirSync(join(outDir, route), { recursive: true })
        copyFileSync(join(outDir, 'index.html'), join(outDir, route, 'index.html'))
      }
    },
  }
}

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    imagetools({
      // Default filter is case-sensitive, which skipped the .JPG photos
      include: /^[^?]+\.(avif|gif|heif|jpeg|jpg|png|tiff|webp)(\?.*)?$/i,
    }),
    pageRoutes(),
  ],
})
