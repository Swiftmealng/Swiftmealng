import React from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Route, Routes } from "react-router-dom";
import { TrackOrder } from "./pages/TrackOrder";
import { OrderDetails } from "./pages/OrderDetails";
import { DeliveryDetails } from "./pages/DeliveryDetails";

export const App = () => {
  return (
    <div className="overflow-x-hidden">
      <Navbar />
      <Routes>
        <Route path="/" element={<TrackOrder />} />
        <Route path="/OrderDetails/:orderID" element={<OrderDetails />} />
        <Route path="/DeliveryDetails/:orderID" element={<DeliveryDetails />} />
      </Routes>
      <Footer />
    </div>
  );
};
