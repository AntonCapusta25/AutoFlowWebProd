import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: false,
    modulePreload: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // ── Vendor splits ──────────────────────────────────────────
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-framer'
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router'
          }
          // Supabase — only used in admin, keep isolated
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase'
          }
          if (id.includes('node_modules')) {
            return 'vendor-misc'
          }
          // ── App splits ─────────────────────────────────────────────
          // Admin pages — never needed by public visitors
          if (id.includes('/pages/Admin/') || id.includes('/components/Admin/')) {
            return 'chunk-admin'
          }
          // Blog + blog content (only on /blog routes)
          if (id.includes('/pages/Blog') || id.includes('/data/blogPosts')) {
            return 'chunk-blog'
          }
          // i18n translations
          if (id.includes('/i18n/')) {
            return 'chunk-i18n'
          }
        },
      },
    },
  },
})

