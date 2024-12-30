import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['@hcaptcha/react-hcaptcha'],
      output: {
        globals: {
          '@hcaptcha/react-hcaptcha': 'hcaptcha'
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react']
  }
});