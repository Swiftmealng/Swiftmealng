import React from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import FooterNew from "./components/FooterNew";
import { Route, Routes, useLocation } from "react-router-dom";
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
import RiderDashboard from "./pages/rider/RiderDashboard";
import RiderProfile from "./pages/rider/RiderProfile";
import PaymentPage from "./pages/PaymentPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import ProfilePage from "./pages/ProfilePage";
import FavoritesPage from "./pages/FavoritesPage";
import RatingsPage from "./pages/RatingsPage";

export const App = () => {
  const location = useLocation();
  const authPages = ['/', '/signup', '/login', '/verify-email', '/forgot-password', '/reset-password'];
  const isAuthPage = authPages.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/create-order" element={<CreateOrderPage />} />
          <Route path="/OrderDetails/:orderID" element={<OrderDetails />} />
          <Route path="/DeliveryDetails/:orderID" element={<DeliveryDetails />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/rider/dashboard" element={<RiderDashboard />} />
          <Route path="/rider/profile" element={<RiderProfile />} />
          <Route path="/payment/:orderId" element={<PaymentPage />} />
          <Route path="/orders/history" element={<OrderHistoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/ratings/:orderId" element={<RatingsPage />} />
        </Routes>
      </main>
      {isAuthPage ? <FooterNew /> : <Footer />}
    </div>
  );
};
