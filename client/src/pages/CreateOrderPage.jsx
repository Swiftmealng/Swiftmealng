import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI, tokenManager } from '../services/api';
import toast from 'react-hot-toast';

const CreateOrderPage = () => {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState({
    items: [{ name: '', quantity: 1, price: 0 }],
    deliveryAddress: {
      street: '',
      area: '',
      city: 'Lagos',
      coordinates: { lat: '', lng: '' }
    },
    customerName: '',
    customerPhone: '',
    customerEmail: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Get user's GPS location
  const getCoordinates = () => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            console.warn('Geolocation error:', error);
            // Default to Lagos coordinates if user denies or error occurs
            resolve({ lat: 6.5244, lng: 3.3792 });
          }
        );
      } else {
        // Browser doesn't support geolocation, use default Lagos coordinates
        resolve({ lat: 6.5244, lng: 3.3792 });
      }
    });
  };  const handleItemChange = (index, field, value) => {
    const newItems = [...orderData.items];
    
    // For price and quantity, handle empty string and convert to number
    if (field === 'quantity' || field === 'price') {
      // Allow empty string while typing, or convert to number
      newItems[index][field] = value === '' ? '' : Number(value);
    } else {
      newItems[index][field] = value;
    }
    
    setOrderData({ ...orderData, items: newItems });
    
    if (errors.items) {
      setErrors({ ...errors, items: '' });
    }
  };

  const addItem = () => {
    setOrderData({
      ...orderData,
      items: [...orderData.items, { name: '', quantity: 1, price: 0 }]
    });
  };

  const removeItem = (index) => {
    if (orderData.items.length > 1) {
      const newItems = orderData.items.filter((_, i) => i !== index);
      setOrderData({ ...orderData, items: newItems });
    }
  };

  const handleAddressChange = (field, value) => {
    setOrderData({
      ...orderData,
      deliveryAddress: {
        ...orderData.deliveryAddress,
        [field]: value
      }
    });
    
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleChange = (field, value) => {
    setOrderData({ ...orderData, [field]: value });
    
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const calculateTotal = () => {
    return orderData.items.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + (quantity * price);
    }, 0);
  };

  const validate = () => {
    const newErrors = {};

    // Validate items
    if (orderData.items.length === 0) {
      newErrors.items = 'At least one item is required';
    } else {
      const invalidItem = orderData.items.find(item => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;
        return !item.name.trim() || quantity <= 0 || price <= 0;
      });
      if (invalidItem) {
        newErrors.items = 'All items must have name, quantity, and price';
      }
    }

    // Validate customer info
    if (!orderData.customerName.trim()) {
      newErrors.customerName = 'Name is required';
    }
    if (!orderData.customerPhone.trim()) {
      newErrors.customerPhone = 'Phone number is required';
    } else if (!/^[0-9]{10,15}$/.test(orderData.customerPhone.replace(/\D/g, ''))) {
      newErrors.customerPhone = 'Invalid phone number';
    }
    if (orderData.customerEmail && !/\S+@\S+\.\S+/.test(orderData.customerEmail)) {
      newErrors.customerEmail = 'Invalid email address';
    }

    // Validate address
    if (!orderData.deliveryAddress.street.trim()) {
      newErrors.street = 'Street address is required';
    }
    if (!orderData.deliveryAddress.area.trim()) {
      newErrors.area = 'Area is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Get user if logged in
      const user = tokenManager.getUser();
      
      // Get GPS coordinates (will use default Lagos coordinates if permission denied)
      const coordinates = await getCoordinates();
      
      const response = await orderAPI.create({
        customerId: user?.id, // Include user ID if logged in
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerEmail: orderData.customerEmail || undefined,
        items: orderData.items,
        deliveryAddress: {
          ...orderData.deliveryAddress,
          coordinates // Add actual coordinates
        }
      });

      if (response.success) {
        setIsLoading(false);
        // Show success message
        toast.success('Order placed successfully! Redirecting to payment...');
        // Navigate to payment page with order ID
        const orderId = response.data.order._id;
        navigate(`/payment/${orderId}`);
      }

    } catch (err) {
      setIsLoading(false);
      // Error toast is shown by interceptor, just set form error
      setErrors({ submit: err.message || 'Failed to create order. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Place Your Order
          </h1>
          <p className="text-gray-600">
            Fill in the details below to place your order
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Customer Information */}
          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Customer Information
            </h2>
            
            <div className="space-y-5">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  id="customerName"
                  type="text"
                  value={orderData.customerName}
                  onChange={(e) => handleChange('customerName', e.target.value)}
                  className={`block w-full px-4 py-3 border ${
                    errors.customerName ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent transition-all`}
                  placeholder="Enter your full name"
                />
                {errors.customerName && (
                  <p className="mt-2 text-sm text-red-600">{errors.customerName}</p>
                )}
              </div>

              <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  id="customerPhone"
                  type="tel"
                  value={orderData.customerPhone}
                  onChange={(e) => handleChange('customerPhone', e.target.value)}
                  className={`block w-full px-4 py-3 border ${
                    errors.customerPhone ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent transition-all`}
                  placeholder="08012345678"
                />
                {errors.customerPhone && (
                  <p className="mt-2 text-sm text-red-600">{errors.customerPhone}</p>
                )}
              </div>

              <div>
                <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <input
                  id="customerEmail"
                  type="email"
                  value={orderData.customerEmail}
                  onChange={(e) => handleChange('customerEmail', e.target.value)}
                  className={`block w-full px-4 py-3 border ${
                    errors.customerEmail ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent transition-all`}
                  placeholder="yourname@example.com"
                />
                {errors.customerEmail && (
                  <p className="mt-2 text-sm text-red-600">{errors.customerEmail}</p>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Order Items
              </h2>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center px-4 py-2 bg-[#FF0000] text-white text-sm font-medium rounded-lg hover:bg-[#E00000] transition-colors"
              >
                <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {orderData.items.map((item, index) => (
                <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Item Name *
                      </label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent"
                        placeholder="e.g., Jollof Rice"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price (₦) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0"
                          value={item.price === 0 ? '' : item.price}
                          onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                          className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                  {orderData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="mt-8 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {errors.items && (
              <p className="mt-4 text-sm text-red-600">{errors.items}</p>
            )}

            {/* Total */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                <span className="text-2xl font-bold text-[#FF0000]">₦{calculateTotal().toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Delivery Address
            </h2>
            
            <div className="space-y-5">
              <div>
                <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  id="street"
                  type="text"
                  value={orderData.deliveryAddress.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  className={`block w-full px-4 py-3 border ${
                    errors.street ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent transition-all`}
                  placeholder="15 Herbert Macaulay Way"
                />
                {errors.street && (
                  <p className="mt-2 text-sm text-red-600">{errors.street}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
                    Area *
                  </label>
                  <input
                    id="area"
                    type="text"
                    value={orderData.deliveryAddress.area}
                    onChange={(e) => handleAddressChange('area', e.target.value)}
                    className={`block w-full px-4 py-3 border ${
                      errors.area ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent transition-all`}
                    placeholder="Yaba"
                  />
                  {errors.area && (
                    <p className="mt-2 text-sm text-red-600">{errors.area}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={orderData.deliveryAddress.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent transition-all"
                    placeholder="Lagos"
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>📍 Location:</strong> When you submit, we'll request your GPS coordinates for accurate delivery. If unavailable, we'll use default Lagos coordinates.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-600 text-center">{errors.submit}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-full text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex justify-center items-center py-3 px-4 bg-[#FF0000] text-white font-semibold rounded-full hover:bg-[#E00000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF0000] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Placing order...
                </>
              ) : (
                'Place Order'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrderPage;
