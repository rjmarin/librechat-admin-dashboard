/**
 * Jest setup file
 */

// Set test environment variables
process.env.MONGODB_URI = "mongodb://localhost:27017/test-db";

// Extend Jest matchers if needed
expect.extend({});

// Global test timeout
jest.setTimeout(10000);
