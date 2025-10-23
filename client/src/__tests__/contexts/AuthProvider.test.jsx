import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider } from '../../contexts/AuthProvider';
import { useAuth } from '../../hooks/useAuth';
import * as api from '../../services/api';

// Mock the api module
vi.mock('../../services/api', () => ({
  tokenManager: {
    getUser: vi.fn(),
    getAccessToken: vi.fn(),
    setTokens: vi.fn(),
    setUser: vi.fn(),
    clearTokens: vi.fn(),
    clearUser: vi.fn(),
  },
}));

// Test component that uses useAuth
function TestComponent() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="user">{user ? user.email : 'No User'}</div>
      <button onClick={() => login({ email: 'test@example.com' }, 'token', 'refresh', false)}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with no user when no stored credentials', async () => {
    api.tokenManager.getUser.mockReturnValue(null);
    api.tokenManager.getAccessToken.mockReturnValue(null);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('No User');
  });

  it('should initialize with user when credentials are stored', async () => {
    const mockUser = { email: 'test@example.com', id: '123' };
    api.tokenManager.getUser.mockReturnValue(mockUser);
    api.tokenManager.getAccessToken.mockReturnValue('valid-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
  });

  it('should handle login', async () => {
    api.tokenManager.getUser.mockReturnValue(null);
    api.tokenManager.getAccessToken.mockReturnValue(null);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });

    const loginButton = screen.getByText('Login');
    loginButton.click();

    await waitFor(() => {
      expect(api.tokenManager.setTokens).toHaveBeenCalledWith('token', 'refresh', false);
      expect(api.tokenManager.setUser).toHaveBeenCalled();
    });
  });

  it('should handle logout', async () => {
    const mockUser = { email: 'test@example.com' };
    api.tokenManager.getUser.mockReturnValue(mockUser);
    api.tokenManager.getAccessToken.mockReturnValue('token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
    });

    const logoutButton = screen.getByText('Logout');
    logoutButton.click();

    await waitFor(() => {
      expect(api.tokenManager.clearTokens).toHaveBeenCalled();
      expect(api.tokenManager.clearUser).toHaveBeenCalled();
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    });
  });
});