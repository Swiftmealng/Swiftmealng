import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { orderAPI } from "../services/api";

export const TrackOrder = () => {
  const [orderID, setOrderID] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateOrderNumber = (value) => {
    // Format: ORD-XXXXX
    const regex = /^ORD-\d{3,}$/;
    return regex.test(value);
  };

  const handleTrack = async () => {
    setError('');
    
    if (!orderID.trim()) {
      setError('Please enter an order number');
      return;
    }

    if (!validateOrderNumber(orderID)) {
      setError('Invalid format. Use: ORD-12345');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await orderAPI.track(orderID);
      if (response.success) {
        setIsLoading(false);
        navigate(`/OrderDetails/${orderID}`, { state: { order: response.data.order } });
      }
    } catch (error) {
      setIsLoading(false);
      setError(error.message || 'Order not found. Please check your order number.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto h-16 w-16 bg-[#FF0000] rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Track Your Order
          </h1>
          <p className="text-gray-600 mb-4">
            Enter your order number to see real-time updates
          </p>

          {/* Live Tracking Badge */}
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium border border-green-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live Tracking Available
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm rounded-2xl sm:px-10">
          <div className="space-y-6">
            {/* Order Number Input */}
            <div>
              <label htmlFor="orderID" className="block text-sm font-medium text-gray-700 mb-2">
                Order Number
              </label>
              <div className="relative">
                <input
                  id="orderID"
                  type="text"
                  value={orderID}
                  onChange={(e) => {
                    setOrderID(e.target.value.toUpperCase());
                    setError("");
                  }}
                  onKeyPress={(e) => e.key === "Enter" && handleTrack()}
                  className={`block w-full px-4 py-3 border ${
                    error ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent transition-all`}
                  placeholder="ORD-12345"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                Format: ORD-12345 (ORD followed by numbers)
              </p>
            </div>

            {/* Track Button */}
            <button
              onClick={handleTrack}
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-semibold text-white bg-[#FF0000] hover:bg-[#E00000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF0000] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Tracking...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Track Order
                </>
              )}
            </button>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex">
                <svg className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Where is my order number?</p>
                  <p className="text-blue-700">Your order number was sent to you via SMS and email after placing your order.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an order yet?{' '}
            <button
              onClick={() => navigate('/create-order')}
              className="font-medium text-[#FF0000] hover:text-[#CC0000]"
            >
              Place an order
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
