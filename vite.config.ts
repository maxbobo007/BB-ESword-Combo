import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Web 版：react-native → react-native-web，与移动端共用 App.tsx 和 src/
// Web build: alias react-native to react-native-web and share App.tsx + src/ with mobile.
export default defineConfig({
  root: path.resolve(__dirname, 'web'),
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.jsx', '.js', '.json'],
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    global: 'globalThis',
  },
  optimizeDeps: {
    esbuildOptions: { resolveExtensions: ['.web.js', '.js', '.ts', '.tsx'] },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist-web'),
    emptyOutDir: true,
  },
  server: { host: true, port: 5173 },
});
