import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, 'src'),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@packages/enum': path.resolve(
        __dirname,
        '../../packages/enum/src/index.ts',
      ),
      '@packages/types': path.resolve(
        __dirname,
        '../../packages/types/src/index.ts',
      ),
      '@packages/utils': path.resolve(
        __dirname,
        '../../packages/utils/src/index.ts',
      ),
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import'],
      },
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
});
