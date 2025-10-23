import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import * as api from '../../services/api';

// Mock the api module
vi.mock('../../services/api', () => ({
  tokenManager: {
    getUser: vi.fn(),
    getAccessToken: vi.fn()
  }
}));

// Mock Navigate component
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }) => <div data-testid="navigate">Redirecting to {to}</div>
  };
});

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state initially', () => {
    api.tokenManager.getUser.mockReturnValue(null);
    api.tokenManager.getAccessToken.mockReturnValue(null);

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Verifying access...')).toBeInTheDocument();
  });

  it('should render children when user is authenticated', async () => {
    const mockUser = { id: '123', email: 'test@example.com', role: 'customer' };
    api.tokenManager.getUser.mockReturnValue(mockUser);
    api.tokenManager.getAccessToken.mockReturnValue('valid-token');

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('should redirect to login when no user is found', async () => {
    api.tokenManager.getUser.mockReturnValue(null);
    api.tokenManager.getAccessToken.mockReturnValue(null);

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('navigate')).toBeInTheDocument();
      expect(screen.getByText(/Redirecting to \/login/)).toBeInTheDocument();
    });
  });

  it('should redirect to login when no token is found', async () => {
    const mockUser = { id: '123', email: 'test@example.com', role: 'customer' };
    api.tokenManager.getUser.mockReturnValue(mockUser);
    api.tokenManager.getAccessToken.mockReturnValue(null);

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('navigate')).toBeInTheDocument();
    });
  });

  it('should allow admin users when requireAdmin is true', async () => {
    const mockAdminUser = { id: '123', email: 'admin@example.com', role: 'admin' };
    api.tokenManager.getUser.mockReturnValue(mockAdminUser);
    api.tokenManager.getAccessToken.mockReturnValue('valid-token');

    render(
      <MemoryRouter>
        <ProtectedRoute requireAdmin={true}>
          <div>Admin Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });
  });

  it('should redirect non-admin users when requireAdmin is true', async () => {
    const mockUser = { id: '123', email: 'user@example.com', role: 'customer' };
    api.tokenManager.getUser.mockReturnValue(mockUser);
    api.tokenManager.getAccessToken.mockReturnValue('valid-token');

    render(
      <MemoryRouter>
        <ProtectedRoute requireAdmin={true}>
          <div>Admin Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('navigate')).toBeInTheDocument();
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });
  });

  it('should allow riders when requireAdmin is false', async () => {
    const mockRiderUser = { id: '123', email: 'rider@example.com', role: 'rider' };
    api.tokenManager.getUser.mockReturnValue(mockRiderUser);
    api.tokenManager.getAccessToken.mockReturnValue('valid-token');

    render(
      <MemoryRouter>
        <ProtectedRoute requireAdmin={false}>
          <div>Rider Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Rider Content')).toBeInTheDocument();
    });
  });

  it('should display loading spinner', () => {
    api.tokenManager.getUser.mockReturnValue(null);
    api.tokenManager.getAccessToken.mockReturnValue(null);

    const { container } = render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
});