import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2020',
    sourcemap: true,
    cssCodeSplit: true,
    minify: 'oxc',  // explicit; this is the Vite 8 default
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.match(/[\\/]react(-dom|-router-dom)?[\\/]/) || id.includes('scheduler')) {
              return 'react';
            }
            return 'vendor';
          }
        },
      },
    },
  },
  // Strip console/debugger in production builds
  // oxc reads these from the top-level `oxc` key in Vite 8+
  ...(mode === 'production' && {
    oxc: {
      drop: ['console', 'debugger'],
    },
  }),
}));