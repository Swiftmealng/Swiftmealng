# Comprehensive Test Suite Documentation

## Overview

This document provides comprehensive documentation for the test suite covering all changed files in the current branch compared to main.

## Test Infrastructure

### Server Tests (Jest + TypeScript)
- **Framework**: Jest with ts-jest
- **Location**: `server/src/__tests__/`
- **Configuration**: `server/jest.config.js`
- **Setup**: `server/src/__tests__/setup.ts`

### Client Tests (Vitest + React Testing Library)
- **Framework**: Vitest with @testing-library/react
- **Location**: `client/src/__tests__/`
- **Configuration**: `client/vitest.config.js`
- **Setup**: `client/src/__tests__/setup.js`

## Running Tests

### Server Tests
```bash
cd server

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- auth.service.test.ts
```

### Client Tests
```bash
cd client

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- useToast.test.js
```

## Test Coverage Summary

### Server Tests (148+ test cases)

#### 1. **auth.service.test.ts** (60+ tests)
**Purpose**: Comprehensive testing of authentication service functions

**Coverage**:
- ✅ `generateVerificationCode()` - 6-digit code generation
- ✅ `generateRefreshToken()` - Unique 128-char hex tokens
- ✅ `loginUser()` - User authentication with email/password
  - Valid credentials
  - Invalid credentials
  - Unverified email
  - RememberMe functionality
  - Token generation and storage
- ✅ `registerUser()` - New user registration
  - Successful registration
  - Duplicate email prevention
  - Verification code generation
  - Email sending failure handling
- ✅ `verifyEmail()` - Email verification
  - Valid code verification
  - Expired code handling
  - Invalid code handling
  - Rate limiting (3 attempts per hour)
- ✅ `refreshAccessToken()` - Token refresh mechanism
  - Valid refresh token
  - Expired token handling
  - Invalid token handling
- ✅ `requestPasswordReset()` - Password reset initiation
- ✅ `resetPassword()` - Password reset completion
- ✅ `logoutUser()` - User logout and token cleanup
- ✅ `resendVerificationCode()` - Resend verification code

**Key Test Scenarios**:
- Happy paths for all functions
- Error handling for edge cases
- Rate-limiting enforcement
- Token expiration handling
- Email service failure resilience

#### 2. **sms.service.test.ts** (15+ tests)
**Purpose**: SMS notification service testing

**Coverage**:
- ✅ `sendOrderConfirmationSMS()` - Order confirmation messages
- ✅ `sendStatusUpdateSMS()` - Status update notifications
  - Confirmed, preparing, ready, out_for_delivery, delivered
- ✅ `sendDelayAlertSMS()` - Delay notifications
- ✅ `sendDeliveryConfirmationSMS()` - Delivery confirmation
- ✅ Phone number formatting (E.164 format)
  - Nigerian local format (08012345678)
  - International format (+2348012345678)
  - Without plus prefix (2348012345678)
- ✅ Error handling and notification logging
- ✅ Twilio configuration fallback

#### 3. **public.controller.test.ts** (12+ tests)
**Purpose**: Public API endpoints testing

**Coverage**:
- ✅ `getPublicStats()` - Public statistics endpoint
  - Total customers count
  - Total restaurants count
  - Average rating calculation
  - Total orders count
- ✅ Default values handling
- ✅ Database error handling
- ✅ Rating precision (1 decimal place)

#### 4. **auth.controller.test.ts** (25+ tests)
**Purpose**: Authentication controller endpoints

**Coverage**:
- ✅ `login()` - Login endpoint
  - Successful login
  - Cookie setting (access & refresh tokens)
  - RememberMe functionality
  - Secure cookies in production
- ✅ `register()` - Registration endpoint
  - Customer registration without invite
  - Admin registration with invite token
  - Invite token validation
  - Email/role mismatch detection
  - Expired token handling
  - Operations role protection

#### 5. **payment.controller.test.ts** (20+ tests)
**Purpose**: Payment processing endpoints

**Coverage**:
- ✅ `initiatePayment()` - Payment initiation
  - Successful payment initialization
  - Idempotency (existing pending payment)
  - Order verification
  - User authorization
  - Amount validation (positive number)
  - Duplicate payment prevention
  - Unique reference generation (SWM-prefix)
  - Paystack API error handling

#### 6. **seedSuperAdmin.test.ts** (10+ tests)
**Purpose**: Super admin seeding utility

**Coverage**:
- ✅ Environment variable validation
- ✅ Default values for optional fields
- ✅ Existing admin check
- ✅ Admin creation with correct properties
- ✅ Email verification bypass for super admin

### Client Tests (120+ test cases)

#### 1. **useToast.test.js** (25+ tests)
**Purpose**: Toast notification hook testing

**Coverage**:
- ✅ Initial state (empty toasts array)
- ✅ `showToast()` - Add toast notification
- ✅ Auto-removal after duration
- ✅ Persistent toasts (duration = 0)
- ✅ Manual removal by ID
- ✅ Type-specific methods:
  - `success()`, `error()`, `warning()`, `info()`
- ✅ Multiple toasts handling
- ✅ Unique ID generation
- ✅ Default values (type, duration)
- ✅ Custom duration support

**Key Test Scenarios**:
- Timer-based auto-removal
- Concurrent multiple toasts
- Toast queue management

#### 2. **StarRating.test.jsx** (20+ tests)
**Purpose**: Star rating component testing

**Coverage**:
- ✅ 5-star buttons rendering
- ✅ Optional label rendering
- ✅ Click interaction (`onRate`)
- ✅ Hover interaction (`onHover`, `onLeave`)
- ✅ Visual feedback:
  - Stars highlighting up to rating
  - Hover state priority over rating
  - Yellow fill for active stars
  - Gray for inactive stars
- ✅ Edge cases:
  - Rating 0 (no stars highlighted)
  - Rating 5 (all stars highlighted)
- ✅ Button type prevention (form submission)
- ✅ Keyboard interaction support
- ✅ Hover scale animation

#### 3. **ProtectedRoute.test.jsx** (15+ tests)
**Purpose**: Route protection component testing

**Coverage**:
- ✅ Loading state display
- ✅ Authenticated user access (render children)
- ✅ Unauthenticated redirect to login
- ✅ Missing token redirect
- ✅ Admin-only routes (`requireAdmin` prop)
- ✅ Role-based access control:
  - Admin access to admin routes
  - Non-admin denial to admin routes
  - Rider/customer access to general routes
- ✅ Loading spinner display
- ✅ Authentication state checking

#### 4. **PublicRoute.test.jsx** (15+ tests)
**Purpose**: Public route (auth pages) component testing

**Coverage**:
- ✅ Loading state while checking authentication
- ✅ Unauthenticated user access (render children)
- ✅ Authenticated user redirects:
  - Admin → `/admin/dashboard`
  - Rider → `/rider/dashboard`
  - Customer → `/create-order`
  - Unknown role → `/create-order` (default)
- ✅ Children not shown during loading
- ✅ Children not shown when authenticated
- ✅ Loading spinner display

#### 5. **AuthProvider.test.jsx** (20+ tests)
**Purpose**: Authentication context provider testing

**Coverage**:
- ✅ Initial state (no user)
- ✅ Initial state (with user)
- ✅ `login()` function:
  - Token storage
  - User data storage
  - State updates
  - RememberMe support
- ✅ `logout()` function:
  - Token clearing
  - User clearing
  - State reset
- ✅ `updateUser()` function:
  - User data updates
  - Storage updates
- ✅ Error handling (storage errors)
- ✅ Authentication state logging

#### 6. **tokenManager.test.js** (25+ tests)
**Purpose**: Token and user storage management testing

**Coverage**:
- ✅ `setTokens()` and `getAccessToken()`:
  - localStorage when rememberMe = true
  - sessionStorage when rememberMe = false
  - Token retrieval from correct storage
- ✅ `getRefreshToken()`:
  - Refresh token retrieval
- ✅ `clearTokens()`:
  - Clear from both storages
- ✅ `setUser()` and `getUser()`:
  - User storage (localStorage/sessionStorage)
  - User retrieval and JSON parsing
  - Null return when no user
- ✅ `clearUser()`:
  - Clear from both storages
- ✅ Storage switching:
  - Session → Local when rememberMe changes

## Test Best Practices Followed

### 1. **Comprehensive Coverage**
- Happy paths tested
- Edge cases covered
- Error scenarios handled
- Boundary conditions validated

### 2. **Isolation**
- Mocked external dependencies
- No database connections
- Independent test execution
- No side effects between tests

### 3. **Clear Test Structure**
- Descriptive test names
- Arrange-Act-Assert pattern
- Focused single assertions
- Logical grouping with describe blocks

### 4. **Maintainability**
- Setup and teardown hooks
- Shared mock data
- Helper functions for common operations
- Clear documentation

### 5. **Real-World Scenarios**
- Authentication flows
- Payment processing
- SMS notifications
- Token management
- Role-based access control

## Mock Strategies

### Server Tests
- **Database Models**: Mocked with jest.mock()
- **External APIs**: Axios mocked for Paystack
- **Email Service**: Async email sending mocked
- **SMS Service**: Twilio client mocked
- **JWT**: Token generation and verification mocked

### Client Tests
- **API Calls**: api module mocked
- **Router**: Navigate component mocked
- **Storage**: localStorage/sessionStorage mocked
- **Timers**: Fake timers for toast auto-removal
- **Context**: AuthContext mocked for route tests

## CI/CD Integration

### Running Tests in CI Pipeline

```yaml
# Example GitHub Actions workflow
name: Test Suite

on: [push, pull_request]

jobs:
  test-server:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install server dependencies
        run: cd server && npm ci
      - name: Run server tests
        run: cd server && npm test -- --coverage
      
  test-client:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install client dependencies
        run: cd client && npm ci
      - name: Run client tests
        run: cd client && npm test -- --coverage
```

## Coverage Targets

### Server
- **Lines**: >80%
- **Functions**: >80%
- **Branches**: >75%
- **Statements**: >80%

### Client
- **Components**: >80%
- **Hooks**: >90%
- **Services**: >85%
- **Utilities**: >90%

## Common Testing Patterns

### 1. Testing Async Functions
```typescript
it('should handle async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

### 2. Testing Errors
```typescript
it('should throw error for invalid input', async () => {
  await expect(function()).rejects.toThrow('Error message');
});
```

### 3. Testing React Hooks
```javascript
const { result } = renderHook(() => useCustomHook());
act(() => {
  result.current.someFunction();
});
expect(result.current.value).toBe(expected);
```

### 4. Testing Components
```javascript
render(<Component prop={value} />);
expect(screen.getByText('Expected Text')).toBeInTheDocument();
```

## Troubleshooting

### Common Issues

1. **Module not found errors**
   - Ensure all dependencies installed: `npm install`
   - Check import paths in test files

2. **Timeout errors**
   - Increase test timeout in jest.config.js
   - Check for unresolved promises

3. **Mock not working**
   - Verify mock path matches import path
   - Clear mocks between tests with `jest.clearAllMocks()`

4. **React Testing Library issues**
   - Use `waitFor` for async updates
   - Use `screen.debug()` to see rendered output

## Future Test Additions

### Recommended Areas for Expansion
1. Integration tests for complete user flows
2. E2E tests with Playwright/Cypress
3. Performance tests for heavy operations
4. Accessibility tests with jest-axe
5. Visual regression tests
6. API contract tests

## Contributing

When adding new tests:
1. Follow existing naming conventions
2. Add tests in appropriate `__tests__` directory
3. Include both happy path and error scenarios
4. Update this documentation
5. Ensure tests are independent and isolated

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)