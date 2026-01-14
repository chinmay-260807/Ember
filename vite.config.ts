
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  define: {
    'process.env': JSON.stringify(process.env || { API_KEY: '' })
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      // These modules are provided by the browser via the importmap in index.html
      external: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        '@google/genai',
        'react-markdown'
      ],
    },
    sourcemap: false,
    minify: 'esbuild',
  },
  server: {
    port: 3000,
    host: true,
  }
});
