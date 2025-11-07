// Test setup file
// IMPORTANT: Load environment variables FIRST before importing any modules
require('dotenv').config({ path: '.env.local' });

// Register ts-node to handle TypeScript imports at runtime
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
  },
});

// Verify critical environment variables are loaded
if (!process.env.RATE_LIMIT_WINDOW_MS) {
  console.warn('[Test Setup] RATE_LIMIT_WINDOW_MS not found in environment, using default');
  process.env.RATE_LIMIT_WINDOW_MS = '900000';
  process.env.RATE_LIMIT_MAX_REQUESTS = '100';
}

// Import app for testing AFTER environment is configured
const app = require('../src/app');

// Make app available globally for all tests
global.app = app;

// Global test timeout
jest.setTimeout(30000);

// Suppress console logs during tests (optional)
if (process.env.SUPPRESS_TEST_LOGS === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  };
}
