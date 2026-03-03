import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    outDir: path.resolve(__dirname, 'dist/pipeline'),
    lib: {
      entry: path.resolve(__dirname, 'src/pipeline/sample.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      external: ['fs', 'path', 'os', 'util', 'stream', 'parquetjs-lite'],
    },
    target: 'esnext',
  },
});
