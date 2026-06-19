import { defineConfig } from 'playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  reporter: 'list',

  use: {
    baseURL: 'http://localhost:4173',
    headless: true,
    // Pin the locale so the UI renders the English strings the smoke test
    // asserts on (the app derives its language from navigator.language).
    locale: 'en-US',
    trace: 'on-first-retry',
  },

  webServer: {
    command: 'npm run build && npm run preview',
    //command: 'npm run ui:dev',
    url: 'http://localhost:4173/',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
});
