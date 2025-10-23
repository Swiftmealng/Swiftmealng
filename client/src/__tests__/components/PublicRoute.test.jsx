import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import PublicRoute from '../../components/PublicRoute';
import { AuthContext } from '../../contexts/AuthContext';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }) => <div data-testid="navigate">{to}</div>,
  };
});

describe('PublicRoute Component', () => {
  it('should show loading state when auth is loading', () => {
    const mockContextValue = {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    };

    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockContextValue}>
          <PublicRoute>
            <div>Public Content</div>
          </PublicRoute>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render children when user is not authenticated', async () => {
    const mockContextValue = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    };

    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockContextValue}>
          <PublicRoute>
            <div>Public Content</div>
          </PublicRoute>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Public Content')).toBeInTheDocument();
    });
  });

  it('should redirect admin to dashboard when authenticated', async () => {
    const mockContextValue = {
      user: { id: '123', email: 'admin@example.com', role: 'admin' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    };

    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockContextValue}>
          <PublicRoute>
            <div>Public Content</div>
          </PublicRoute>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('navigate')).toHaveTextContent('/admin/dashboard');
    });
  });

  it('should redirect rider to dashboard when authenticated', async () => {
    const mockContextValue = {
      user: { id: '123', email: 'rider@example.com', role: 'rider' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    };

    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockContextValue}>
          <PublicRoute>
            <div>Public Content</div>
          </PublicRoute>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('navigate')).toHaveTextContent('/rider/dashboard');
    });
  });

  it('should redirect customer to create-order when authenticated', async () => {
    const mockContextValue = {
      user: { id: '123', email: 'customer@example.com', role: 'customer' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
    };

    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockContextValue}>
          <PublicRoute>
            <div>Public Content</div>
          </PublicRoute>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('navigate')).toHaveTextContent('/create-order');
    });
  });
});