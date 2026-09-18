import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        history: fileURLToPath(new URL('./history.html', import.meta.url)),
        weather: fileURLToPath(new URL('./weather.html', import.meta.url)),
        hotspot: fileURLToPath(new URL('./hotspot.html', import.meta.url)),
        advisory: fileURLToPath(new URL('./advisory.html', import.meta.url)),
        dashboard: fileURLToPath(new URL('./dashboard.html', import.meta.url))
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/predict': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/scans': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/feedback': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/weather-risk': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/dashboard/stats': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
});