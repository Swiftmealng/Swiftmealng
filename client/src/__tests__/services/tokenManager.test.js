import { describe, it, expect, beforeEach, vi } from 'vitest';
import { tokenManager } from '../../services/api';

describe('Token Manager', () => {
  beforeEach(() => {
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  describe('setTokens and getAccessToken', () => {
    it('should store tokens in localStorage when rememberMe is true', () => {
      tokenManager.setTokens('access-token', 'refresh-token', true);

      expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'access-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'refresh-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('rememberMe', 'true');
    });

    it('should store tokens in sessionStorage when rememberMe is false', () => {
      tokenManager.setTokens('access-token', 'refresh-token', false);

      expect(sessionStorage.setItem).toHaveBeenCalledWith('accessToken', 'access-token');
      expect(sessionStorage.setItem).toHaveBeenCalledWith('refreshToken', 'refresh-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('rememberMe', 'false');
    });

    it('should retrieve access token from localStorage when rememberMe is true', () => {
      localStorage.setItem('rememberMe', 'true');
      localStorage.setItem('accessToken', 'stored-access-token');

      localStorage.getItem.mockImplementation((key) => {
        if (key === 'rememberMe') return 'true';
        if (key === 'accessToken') return 'stored-access-token';
        return null;
      });

      const token = tokenManager.getAccessToken();
      expect(token).toBe('stored-access-token');
    });

    it('should retrieve access token from sessionStorage when rememberMe is false', () => {
      localStorage.setItem('rememberMe', 'false');
      sessionStorage.setItem('accessToken', 'session-access-token');

      localStorage.getItem.mockReturnValue('false');
      sessionStorage.getItem.mockReturnValue('session-access-token');

      const token = tokenManager.getAccessToken();
      expect(token).toBe('session-access-token');
    });
  });

  describe('getRefreshToken', () => {
    it('should retrieve refresh token from correct storage', () => {
      localStorage.setItem('rememberMe', 'true');
      localStorage.setItem('refreshToken', 'stored-refresh-token');

      localStorage.getItem.mockImplementation((key) => {
        if (key === 'rememberMe') return 'true';
        if (key === 'refreshToken') return 'stored-refresh-token';
        return null;
      });

      const token = tokenManager.getRefreshToken();
      expect(token).toBe('stored-refresh-token');
    });
  });

  describe('clearTokens', () => {
    it('should clear tokens from both localStorage and sessionStorage', () => {
      tokenManager.clearTokens();

      expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('rememberMe');
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    });
  });

  describe('setUser and getUser', () => {
    it('should store user in localStorage when rememberMe is true', () => {
      localStorage.setItem('rememberMe', 'true');
      localStorage.getItem.mockReturnValue('true');

      const user = { id: '123', email: 'test@example.com', role: 'customer' };
      tokenManager.setUser(user);

      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(user));
    });

    it('should store user in sessionStorage when rememberMe is false', () => {
      localStorage.setItem('rememberMe', 'false');
      localStorage.getItem.mockReturnValue('false');

      const user = { id: '123', email: 'test@example.com', role: 'customer' };
      tokenManager.setUser(user);

      expect(sessionStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(user));
    });

    it('should retrieve and parse user from localStorage', () => {
      const user = { id: '123', email: 'test@example.com', role: 'customer' };
      localStorage.setItem('rememberMe', 'true');
      localStorage.setItem('user', JSON.stringify(user));

      localStorage.getItem.mockImplementation((key) => {
        if (key === 'rememberMe') return 'true';
        if (key === 'user') return JSON.stringify(user);
        return null;
      });

      const retrievedUser = tokenManager.getUser();
      expect(retrievedUser).toEqual(user);
    });

    it('should return null when no user is stored', () => {
      localStorage.getItem.mockReturnValue(null);
      sessionStorage.getItem.mockReturnValue(null);

      const user = tokenManager.getUser();
      expect(user).toBeNull();
    });
  });

  describe('clearUser', () => {
    it('should clear user from both storages', () => {
      tokenManager.clearUser();

      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('Storage switching', () => {
    it('should switch from sessionStorage to localStorage when rememberMe changes', () => {
      // First store in session
      localStorage.getItem.mockReturnValue('false');
      tokenManager.setTokens('token1', 'refresh1', false);
      expect(sessionStorage.setItem).toHaveBeenCalledWith('accessToken', 'token1');

      // Then store in local
      localStorage.getItem.mockReturnValue('true');
      tokenManager.setTokens('token2', 'refresh2', true);
      expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'token2');
    });
  });
});