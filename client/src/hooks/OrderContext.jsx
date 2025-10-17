import React, { Children, createContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";

const OrderContext = createContext(null);

const OrderContextProvider = ({ children }) => {
  const { orderID } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Mock data for Week 1 (will connect to API in Week 2)
    const fetchOrder = () => {
      setTimeout(() => {
        // Simulate API call
        const mockApi = {
          orderNumber: orderID || "ORD-12345",
          status: "out_for_delivery",
          estimatedDeliveryTime: "2025-10-03T14:30:00Z",
          isDelayed: false,
          rider: {
            name: "Adebayo Johnson",
            phone: "+234 801 234 5678",
            photo: undefined,
          },
          items: [
            { name: "Jollof Rice with Chicken", quantity: 2, price: 2500 },
            { name: "Plantain", quantity: 1, price: 500 },
          ],
          deliveryAddress: {
            street: "123 Allen Avenue",
            area: "Ikeja",
            city: "Lagos",
            coordinates: [3.3792, 6.5244],
          },
        };

        setOrder(mockApi);
        setLoading(false);
      }, 1000);
    };

    fetchOrder();
  }, [orderID]);

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
              We couldn't find an order with number: {orderID}
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

  const minutesRemaining = calculateMinutesRemaining(
    order.estimatedDeliveryTime
  );

  const value = {
    minutesRemaining,
    orderID,
    order,
    setOrder,
    loading,
    setLoading,
    error,
    setError,
    formatETA,
    orderProgress: order.status,
    driver: order.rider,
    deliveryAddress: order.deliveryAddress,
    orderNumber: order.orderNumber,
  };

  return (
    <OrderContext.Provider value={value}> {children} </OrderContext.Provider>
  );
};

export { OrderContext, OrderContextProvider };
