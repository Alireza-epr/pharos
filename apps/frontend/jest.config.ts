import type { Config } from 'jest';

const config: Config = {
  roots: ['<rootDir>/tests'],
  // Playwright e2e specs live under tests/e2e and are run via `npm run e2e`.
  // They use Playwright-only APIs (import.meta.url, etc.) that Jest's CommonJS
  // transform can't parse, so keep them out of the Jest run.
  testPathIgnorePatterns: ['<rootDir>/tests/e2e/'],
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};

export default config;
