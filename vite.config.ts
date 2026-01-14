import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': JSON.stringify(process.env || { API_KEY: '' })
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 3000,
    host: true,
  }
});
