import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import packageJson from './package.json'

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, 'src'),
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version)
  }
});
