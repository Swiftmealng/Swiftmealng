# Client Test Suite

This directory contains comprehensive unit and integration tests for the React client application.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Test Structure

- `hooks/` - Tests for custom React hooks
- `components/` - Tests for React components
- `contexts/` - Tests for React contexts and providers
- `setup.js` - Test environment configuration

## Writing Tests

Tests use Vitest and React Testing Library. Follow these patterns:

```javascript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Component', () => {
  it('should do something', () => {
    render(<Component />);
    expect(screen.getByText('...')).toBeInTheDocument();
  });
});
```