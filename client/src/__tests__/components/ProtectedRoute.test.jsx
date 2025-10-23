import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import { tokenManager } from '../../services/api';

vi.mock('../../services/api', () => ({
  tokenManager: {
    getUser: vi.fn(),
    getAccessToken: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }) => <div data-testid="navigate">{to}</div>,
  };
});

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state initially', () => {
    tokenManager.getUser.mockReturnValue(null);
    tokenManager.getAccessToken.mockReturnValue(null);

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Verifying access...')).toBeInTheDocument();
  });

  it('should render children when user is authenticated', async () => {
    const mockUser = { id: '123', email: 'test@example.com', role: 'customer' };
    tokenManager.getUser.mockReturnValue(mockUser);
    tokenManager.getAccessToken.mockReturnValue('valid-token');

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('should redirect to login when user is not authenticated', async () => {
    tokenManager.getUser.mockReturnValue(null);
    tokenManager.getAccessToken.mockReturnValue(null);

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('navigate')).toHaveTextContent('/login');
    });
  });

  it('should redirect to login when token is missing', async () => {
    const mockUser = { id: '123', email: 'test@example.com', role: 'customer' };
    tokenManager.getUser.mockReturnValue(mockUser);
    tokenManager.getAccessToken.mockReturnValue(null);

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('navigate')).toHaveTextContent('/login');
    });
  });

  it('should allow admin access when requireAdmin is true and user is admin', async () => {
    const mockUser = { id: '123', email: 'admin@example.com', role: 'admin' };
    tokenManager.getUser.mockReturnValue(mockUser);
    tokenManager.getAccessToken.mockReturnValue('valid-token');

    render(
      <BrowserRouter>
        <ProtectedRoute requireAdmin={true}>
          <div>Admin Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });
  });

  it('should redirect when requireAdmin is true but user is not admin', async () => {
    const mockUser = { id: '123', email: 'user@example.com', role: 'customer' };
    tokenManager.getUser.mockReturnValue(mockUser);
    tokenManager.getAccessToken.mockReturnValue('valid-token');

    render(
      <BrowserRouter>
        <ProtectedRoute requireAdmin={true}>
          <div>Admin Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('navigate')).toHaveTextContent('/login');
    });
  });
});