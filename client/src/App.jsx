import React, { useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import FooterNew from "./components/FooterNew";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { TrackOrder } from "./pages/TrackOrder";
import { OrderDetails } from "./pages/OrderDetails";
import { DeliveryDetails } from "./pages/DeliveryDetails";
import LandingPage from "./pages/LandingPage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import CreateOrderPage from "./pages/CreateOrderPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminInvitePage from "./pages/AdminInvitePage";
import RiderDashboard from "./pages/rider/RiderDashboard";
import RiderProfile from "./pages/rider/RiderProfile";
import PaymentPage from "./pages/PaymentPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import ProfilePage from "./pages/ProfilePage";
import FavoritesPage from "./pages/FavoritesPage";
import RatingsPage from "./pages/RatingsPage";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { AuthProvider } from "./contexts/AuthProvider";
import { SocketProvider } from "./contexts/SocketProvider";
import { setNavigationCallback } from "./services/api";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import { OrderContextProvider } from "./hooks/OrderContext";

export const App = () => {
  console.log('App: Rendering App component');
  const location = useLocation();
  const navigate = useNavigate();
  const authPages = ['/', '/signup', '/login', '/verify-email', '/forgot-password', '/reset-password'];
  const isAuthPage = authPages.includes(location.pathname);

  console.log('App: Current location:', location.pathname, 'isAuthPage:', isAuthPage);

  // Set navigation callback for API interceptors
  useEffect(() => {
    console.log('App: Setting navigation callback');
    setNavigationCallback(navigate);
  }, [navigate]);

  return (
    <AuthProvider>
      <SocketProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1F2937',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid #E5E7EB',
              fontSize: '14px',
              fontWeight: '500',
              maxWidth: '400px',
            },
            success: {
              duration: 3000,
              style: {
                background: '#fff',
                border: '1px solid #00A651',
              },
              iconTheme: {
                primary: '#00A651',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              style: {
                background: '#fff',
                border: '1px solid #FF0000',
              },
              iconTheme: {
                primary: '#FF0000',
                secondary: '#fff',
              },
            },
            loading: {
              style: {
                background: '#fff',
                border: '1px solid #FF6600',
              },
              iconTheme: {
                primary: '#FF6600',
                secondary: '#fff',
              },
            },
          }}
        />
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public route - accessible to all */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/track-order" element={<TrackOrder />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              
              {/* Auth routes - only accessible when NOT logged in */}
              <Route path="/signup" element={<PublicRoute><SignUpPage /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/verify-email" element={<PublicRoute><VerifyEmailPage /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
              <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
              
              {/* Protected routes - require authentication */}
              <Route path="/create-order" element={<ProtectedRoute><CreateOrderPage /></ProtectedRoute>} />
              <Route path="/OrderDetails/:orderNumber" element={<ProtectedRoute><OrderContextProvider><OrderDetails /></OrderContextProvider></ProtectedRoute>} />
              <Route path="/DeliveryDetails/:orderNumber" element={<ProtectedRoute><OrderContextProvider><DeliveryDetails /></OrderContextProvider></ProtectedRoute>} />
              <Route path="/payment/:orderId" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
              <Route path="/orders/history" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
              <Route path="/ratings/:orderId" element={<ProtectedRoute><RatingsPage /></ProtectedRoute>} />
              
              {/* Admin routes - require admin role */}
              <Route path="/admin/dashboard" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/invite" element={<ProtectedRoute requireAdmin={true}><AdminInvitePage /></ProtectedRoute>} />
              
              {/* Rider routes - require authentication */}
              <Route path="/rider/dashboard" element={<ProtectedRoute requireRole="rider"><RiderDashboard /></ProtectedRoute>} />
              <Route path="/rider/profile" element={<ProtectedRoute><RiderProfile /></ProtectedRoute>} />
            </Routes>
          </main>
          {isAuthPage ? <FooterNew /> : <Footer />}
        </div>
      </SocketProvider>
    </AuthProvider>
  );
};