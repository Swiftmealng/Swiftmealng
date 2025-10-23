import React, { useState, useEffect } from 'react';
import { tokenManager } from '../services/api';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log('AuthProvider: Initializing authentication check');
    const checkAuth = () => {
      try {
        const storedUser = tokenManager.getUser();
        const token = tokenManager.getAccessToken();

        console.log('AuthProvider: Retrieved user and token', { hasUser: !!storedUser, hasToken: !!token });

        if (storedUser && token) {
          setUser(storedUser);
          setIsAuthenticated(true);
          console.log('AuthProvider: User authenticated');
        } else {
          setUser(null);
          setIsAuthenticated(false);
          console.log('AuthProvider: User not authenticated');
        }
      } catch (error) {
        console.error('AuthProvider: Error checking authentication:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
        console.log('AuthProvider: Authentication check complete');
      }
    };

    checkAuth();
  }, []);

  const login = (userData, accessToken, refreshToken, rememberMe) => {
    console.log('AuthProvider: Logging in user:', userData.email);
    tokenManager.setTokens(accessToken, refreshToken, rememberMe);
    tokenManager.setUser(userData);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    console.log('AuthProvider: Logging out user');
    tokenManager.clearTokens();
    tokenManager.clearUser();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData) => {
    console.log('AuthProvider: Updating user data');
    tokenManager.setUser(userData);
    setUser(userData);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};