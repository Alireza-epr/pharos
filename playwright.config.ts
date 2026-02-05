import { defineConfig } from 'playwright/test';

export default defineConfig({
  testDir: './e2e',

  use: {
    baseURL: 'http://localhost:4173',
    headless: true,
  },

  webServer: {
    command: 'npm run ui:build && npm run ui:preview',
    //command: 'npm run ui:dev',
    url: 'http://localhost:4173/',
    timeout: 60 * 1000,
    reuseExistingServer: !process.env.CI,
  },
});
