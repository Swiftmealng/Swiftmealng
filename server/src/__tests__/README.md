# Server Test Suite

This directory contains comprehensive unit and integration tests for the Express/TypeScript server.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- auth.controller.test.ts

# Generate coverage report
npm test -- --coverage
```

## Test Structure

- `controllers/` - Tests for API controllers
- `services/` - Tests for business logic services
- `middleware/` - Tests for Express middleware
- `utils/` - Tests for utility functions

## Writing Tests

Tests use Jest and follow AAA pattern (Arrange, Act, Assert):

```typescript
describe('Feature', () => {
  it('should behave as expected', async () => {
    // Arrange
    const mockData = { ... };
    
    // Act
    const result = await someFunction(mockData);
    
    // Assert
    expect(result).toBe(expected);
  });
});
```