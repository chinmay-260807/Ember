
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets are loaded correctly regardless of deployment subpath
  define: {
    // Provide a fallback for process.env to prevent ReferenceErrors in the browser
    'process.env': JSON.stringify(process.env || { API_KEY: '' })
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
  },
  server: {
    port: 3000,
    host: true,
  }
});
