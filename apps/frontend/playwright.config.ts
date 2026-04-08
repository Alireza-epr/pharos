import { defineConfig } from 'playwright/test';

export default defineConfig({
  testDir: './tests/e2e',

  use: {
    baseURL: 'http://localhost:4173',
    headless: true,
  },

  webServer: {
    command: 'npm run build && npm run preview',
    //command: 'npm run ui:dev',
    url: 'http://localhost:4173/',
    timeout: 60 * 1000,
    reuseExistingServer: !process.env.CI,
  },
});
