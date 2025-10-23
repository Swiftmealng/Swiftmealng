import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { tokenManager } from '../services/api';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const user = tokenManager.getUser();
      const token = tokenManager.getAccessToken();

      if (!user || !token) {
        setIsAuthorized(false);
        setIsChecking(false);
        return;
      }

      // Check admin role if required
      if (requireAdmin && user.role !== 'admin') {
        setIsAuthorized(false);
        setIsChecking(false);
        return;
      }

      setIsAuthorized(true);
      setIsChecking(false);
    };

    checkAuth();
  }, [requireAdmin]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF0000] mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
