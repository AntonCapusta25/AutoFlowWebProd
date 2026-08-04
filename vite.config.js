import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // ── Vendor splits ──────────────────────────────────────────
          // Framer Motion is large (~150KB) — isolate it
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-framer'
          }
          // React core
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react'
          }
          // Router
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router'
          }
          // Supabase
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase'
          }
          // Everything else in node_modules
          if (id.includes('node_modules')) {
            return 'vendor-misc'
          }
          // ── App splits ─────────────────────────────────────────────
          // Admin pages — never loaded by public visitors
          if (id.includes('/pages/Admin/')) {
            return 'chunk-admin'
          }
          // Blog content (already lazy but keep in its own chunk)
          if (id.includes('/pages/Blog') || id.includes('/data/blogPosts')) {
            return 'chunk-blog'
          }
          // i18n translations (large)
          if (id.includes('/i18n/')) {
            return 'chunk-i18n'
          }
        },
      },
    },
  },
})
