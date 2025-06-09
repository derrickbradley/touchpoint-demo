// vite.config.ts
// REVERTED TO ORIGINAL STATE

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@nlxai/touchpoint-ui']
  }
})