/**
 * Manual Mock for Winston Logger
 * Jest automatically uses this when '../utils/logger' is mocked
 */

const mockLogger = {
  info: jest.fn(() => undefined),
  warn: jest.fn(() => undefined),
  error: jest.fn(() => undefined),
  debug: jest.fn(() => undefined),
  stream: {
    write: jest.fn(() => undefined)
  }
};

module.exports = mockLogger;
