/**
 * Global TypeScript type definitions for test environment
 *
 * This file defines global variables used across test files,
 * particularly for the Express application instance.
 */

import type { Application } from 'express';

declare global {
  /**
   * Global Express application instance
   * Used in integration tests to access the app without importing
   */
  var app: Application;
}

// This export is required to make this file a module
export {};
