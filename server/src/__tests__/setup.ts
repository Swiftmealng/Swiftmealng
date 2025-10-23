// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes';
process.env.NODE_ENV = 'test';
process.env.ACCESS_TOKEN_EXPIRES_IN = '15m';
process.env.REFRESH_TOKEN_EXPIRES_IN = '7d';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.TWILIO_ACCOUNT_SID = 'test-account-sid';
process.env.TWILIO_AUTH_TOKEN = 'test-auth-token';
process.env.TWILIO_PHONE_NUMBER = '+1234567890';
process.env.PAYSTACK_SECRET_KEY = 'test-paystack-key';

// Increase timeout for all tests
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};