import { defineConfig } from 'vite';
import path from 'path';
import packageJson from './package.json';

export default defineConfig({
  build: {
    outDir: path.resolve(__dirname, 'dist/pipeline'),
    lib: {
      entry: path.resolve(__dirname, 'src/pipeline/sample.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'fs',
        'path',
        'os',
        'util',
        'stream',
        'parquetjs',
        'crypto',
        'child_process',
      ],
    },
    target: 'esnext',
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
});
