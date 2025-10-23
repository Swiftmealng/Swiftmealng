import React, { createContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { orderAPI } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

const OrderContext = createContext(null);

const OrderContextProvider = ({ children }) => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Fetch full order data from tracking API (now returns complete order details)
        const response = await orderAPI.track(orderNumber);
        
        if (response.success && response.data.order) {
          setOrder(response.data.order);
        } else {
          setError("Order not found");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    if (orderNumber) {
      fetchOrder();
    } else {
      setError("No order number provided");
      setLoading(false);
    }
  }, [orderNumber]);

  const formatETA = (isoTime) => {
    const date = new Date(isoTime);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const calculateMinutesRemaining = (isoTime) => {
    const eta = new Date(isoTime);
    const now = new Date();
    const diff = eta.getTime() - now.getTime();
    return Math.max(0, Math.floor(diff / 60000));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-6xl mb-4">😔</p>
            <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-6">
              We couldn't find an order with number: {orderNumber}
            </p>
            <Link
              to="/"
              className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600"
            >
              Try Another Order
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const minutesRemaining = order?.estimatedDeliveryTime 
    ? calculateMinutesRemaining(order.estimatedDeliveryTime)
    : 0;

  const value = {
    minutesRemaining,
    orderNumber: order?.orderNumber || orderNumber,
    order,
    setOrder,
    loading,
    setLoading,
    error,
    setError,
    formatETA,
    orderProgress: order?.status || 'placed',
    driver: order?.riderId || null,
    deliveryAddress: order?.deliveryAddress || {},
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
};

export { OrderContext, OrderContextProvider };
