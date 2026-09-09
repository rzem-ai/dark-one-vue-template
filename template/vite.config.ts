import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      // import.meta.dirname rather than __dirname: Vite's forthcoming native
      // config loader cannot read the CJS global, and warns about it today.
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
});
