/**
 * Jest Setup File
 * Runs before any tests
 */

// Set NODE_ENV to test BEFORE any modules are loaded
process.env.NODE_ENV = 'test';

// Set OPENAI_API_KEY for mocking
process.env.OPENAI_API_KEY = 'sk-test-key-for-mocking';
