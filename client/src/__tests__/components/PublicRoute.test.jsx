import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PublicRoute from '../../components/PublicRoute';
import { AuthContext } from '../../contexts/AuthContext';

// Mock Navigate component
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }) => <div data-testid="navigate">Redirecting to {to}</div>
  };
});

describe('PublicRoute Component', () => {
  const renderWithAuth = (isAuthenticated, isLoading, user = null) => {
    const authValue = {
      isAuthenticated,
      isLoading,
      user,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn()
    };

    return render(
      <MemoryRouter>
        <AuthContext.Provider value={authValue}>
          <PublicRoute>
            <div>Login Page</div>
          </PublicRoute>
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  it('should show loading state while checking authentication', () => {
    renderWithAuth(false, true);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should render children when user is not authenticated', () => {
    renderWithAuth(false, false);
    
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('should redirect admin users to admin dashboard', () => {
    const adminUser = { id: '123', email: 'admin@example.com', role: 'admin' };
    renderWithAuth(true, false, adminUser);
    
    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByText(/Redirecting to \/admin\/dashboard/)).toBeInTheDocument();
  });

  it('should redirect rider users to rider dashboard', () => {
    const riderUser = { id: '123', email: 'rider@example.com', role: 'rider' };
    renderWithAuth(true, false, riderUser);
    
    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByText(/Redirecting to \/rider\/dashboard/)).toBeInTheDocument();
  });

  it('should redirect customer users to create order page', () => {
    const customerUser = { id: '123', email: 'customer@example.com', role: 'customer' };
    renderWithAuth(true, false, customerUser);
    
    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByText(/Redirecting to \/create-order/)).toBeInTheDocument();
  });

  it('should redirect users with no role to create order page', () => {
    const user = { id: '123', email: 'user@example.com' };
    renderWithAuth(true, false, user);
    
    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByText(/Redirecting to \/create-order/)).toBeInTheDocument();
  });

  it('should not show children during loading', () => {
    renderWithAuth(false, true);
    
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('should not show children when authenticated', () => {
    const user = { id: '123', email: 'user@example.com', role: 'customer' };
    renderWithAuth(true, false, user);
    
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });
});