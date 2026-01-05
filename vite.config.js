import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  preview: {
    port: process.env.PORT || 3000,
    host: true,
    allowedHosts: [
      'wbts-shadows-over-blackthorn-manor-production.up.railway.app',
      '.up.railway.app', // Allow all Railway subdomains
      '.railway.app' // Allow all Railway domains
    ]
  }
});


