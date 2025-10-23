import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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
    clearUser: vi.fn()
  }
}));

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset console mocks
    console.log = vi.fn();
    console.error = vi.fn();
  });

  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

  it('should initialize with no user when not authenticated', async () => {
    api.tokenManager.getUser.mockReturnValue(null);
    api.tokenManager.getAccessToken.mockReturnValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should initialize with user when authenticated', async () => {
    const mockUser = { id: '123', email: 'test@example.com', role: 'customer' };
    api.tokenManager.getUser.mockReturnValue(mockUser);
    api.tokenManager.getAccessToken.mockReturnValue('valid-token');

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle login correctly', async () => {
    api.tokenManager.getUser.mockReturnValue(null);
    api.tokenManager.getAccessToken.mockReturnValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const mockUser = { id: '123', email: 'test@example.com', role: 'customer' };
    const accessToken = 'access-token';
    const refreshToken = 'refresh-token';

    act(() => {
      result.current.login(mockUser, accessToken, refreshToken, false);
    });

    expect(api.tokenManager.setTokens).toHaveBeenCalledWith(accessToken, refreshToken, false);
    expect(api.tokenManager.setUser).toHaveBeenCalledWith(mockUser);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle login with rememberMe', async () => {
    api.tokenManager.getUser.mockReturnValue(null);
    api.tokenManager.getAccessToken.mockReturnValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const mockUser = { id: '123', email: 'test@example.com', role: 'customer' };

    act(() => {
      result.current.login(mockUser, 'token', 'refresh', true);
    });

    expect(api.tokenManager.setTokens).toHaveBeenCalledWith('token', 'refresh', true);
  });

  it('should handle logout correctly', async () => {
    const mockUser = { id: '123', email: 'test@example.com', role: 'customer' };
    api.tokenManager.getUser.mockReturnValue(mockUser);
    api.tokenManager.getAccessToken.mockReturnValue('valid-token');

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    act(() => {
      result.current.logout();
    });

    expect(api.tokenManager.clearTokens).toHaveBeenCalled();
    expect(api.tokenManager.clearUser).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should update user data', async () => {
    const mockUser = { id: '123', email: 'test@example.com', role: 'customer' };
    api.tokenManager.getUser.mockReturnValue(mockUser);
    api.tokenManager.getAccessToken.mockReturnValue('valid-token');

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    const updatedUser = { ...mockUser, name: 'Updated Name' };

    act(() => {
      result.current.updateUser(updatedUser);
    });

    expect(api.tokenManager.setUser).toHaveBeenCalledWith(updatedUser);
    expect(result.current.user).toEqual(updatedUser);
  });

  it('should handle authentication check errors gracefully', async () => {
    api.tokenManager.getUser.mockImplementation(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });

  it('should log authentication state changes', async () => {
    api.tokenManager.getUser.mockReturnValue(null);
    api.tokenManager.getAccessToken.mockReturnValue(null);

    renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('AuthProvider'));
    });
  });
});