import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main:      resolve(__dirname, 'index.html'),
        materials: resolve(__dirname, 'materials.html'),
        settings:  resolve(__dirname, 'settings.html'),
      },
    },
  },
});