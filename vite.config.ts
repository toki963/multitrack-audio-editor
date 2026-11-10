import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'waveform-entry',
      transformIndexHtml: {
        order: 'post',
        handler() {
          return [{ tag: 'script', attrs: { type: 'module', src: '/src/main.tsx' }, injectTo: 'body' }]
        },
      },
    },
  ],
  test: {
    environment: 'node',
  },
})
