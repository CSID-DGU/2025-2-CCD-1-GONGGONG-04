// Test setup file
require('dotenv').config({ path: '.env.local' });

// Import app for testing
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
    warn: jest.fn()
  };
}
