import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './src',
  testMatch: ['**/*.test.ts'],

  // Runs once — creates test.db schema
  globalSetup: '<rootDir>/../jest.global-setup.ts',

  // Runs in every worker — sets DATABASE_URL before any import
  setupFiles: ['<rootDir>/../jest.env-setup.ts'],

  // Runs once — deletes test.db
  globalTeardown: '<rootDir>/../jest.global-teardown.ts',

  // SQLite shared test DB — run suites sequentially to prevent cross-suite data races
  maxWorkers: 1,

  collectCoverageFrom: [
    '**/*.ts',
    '!**/node_modules/**',
    '!**/*.d.ts',
    '!**/server.ts',
  ],
  coverageReporters: ['text', 'lcov'],
  clearMocks: true,
}

export default config