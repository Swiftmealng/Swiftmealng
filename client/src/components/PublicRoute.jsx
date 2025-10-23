import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * PublicRoute component - Prevents authenticated users from accessing auth pages
 * Redirects logged-in users to appropriate dashboard/page
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF0000] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is already logged in, redirect them away from auth pages
  if (isAuthenticated) {
    // Redirect based on user role
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === 'rider') {
      return <Navigate to="/rider/dashboard" replace />;
    } else {
      // Default redirect for customers
      return <Navigate to="/create-order" replace />;
    }
  }

  // User is not authenticated, allow access to auth pages
  return children;
};

export default PublicRoute;