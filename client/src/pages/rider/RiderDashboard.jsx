import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI, riderAPI, tokenManager } from '../../services/api';

const RiderDashboard = () => {
  const navigate = useNavigate();
  const [activeOrders, setActiveOrders] = useState([]);
  const [riderStats, setRiderStats] = useState({
    todayDeliveries: 0,
    todayEarnings: 0,
    rating: 0,
    totalDeliveries: 0
  });
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRiderData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRiderData = async () => {
    setIsLoading(true);
    try {
      const user = tokenManager.getUser();
      const riderId = user?._id || user?.id;
      
      if (!riderId) {
        navigate('/login');
        return;
      }
      
      // Fetch active orders for rider
      const ordersResponse = await orderAPI.getAll({ riderId, status: 'active' });
      
      if (ordersResponse.success) {
        setActiveOrders(ordersResponse.data.orders);
      }
      
      // Fetch rider performance stats
      const statsResponse = await riderAPI.getPerformance(riderId);
      
      if (statsResponse.success) {
        setRiderStats({
          todayDeliveries: statsResponse.data.todayDeliveries || 0,
          todayEarnings: statsResponse.data.todayEarnings || 0,
          rating: statsResponse.data.rating || 0,
          totalDeliveries: statsResponse.data.totalDeliveries || 0
        });
      }
      
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error fetching rider data:', error);
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await orderAPI.updateStatus(orderId, newStatus);
      
      if (response.success) {
        fetchRiderData();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update order status');
    }
  };

  const toggleOnlineStatus = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    
    try {
      const user = tokenManager.getUser();
      const riderId = user?._id || user?.id;
      
      await riderAPI.updateProfile(riderId, { isOnline: newStatus });
    } catch (error) {
      console.error('Error updating online status:', error);
      setIsOnline(!newStatus); // Revert on error
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready_for_pickup': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'picked_up': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivering': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ready_for_pickup': return 'Ready for Pickup';
      case 'picked_up': return 'Picked Up';
      case 'delivering': return 'Delivering';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF0000] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header with Online Status */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Rider Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, Rider!</p>
            </div>
            
            {/* Online/Offline Toggle */}
            <button
              onClick={toggleOnlineStatus}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
                isOnline 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}
            >
              <span className={`h-3 w-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              {isOnline ? 'Online' : 'Offline'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
            <p className="text-sm text-gray-600 mb-1">Today's Deliveries</p>
            <p className="text-2xl font-bold text-gray-900">{riderStats.todayDeliveries}</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
            <p className="text-sm text-gray-600 mb-1">Today's Earnings</p>
            <p className="text-2xl font-bold text-[#00A651]">₦{riderStats.todayEarnings.toLocaleString()}</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
            <p className="text-sm text-gray-600 mb-1">Rating</p>
            <div className="flex items-center gap-1">
              <p className="text-2xl font-bold text-gray-900">{riderStats.rating}</p>
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
            <p className="text-sm text-gray-600 mb-1">Total Deliveries</p>
            <p className="text-2xl font-bold text-gray-900">{riderStats.totalDeliveries}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => navigate('/rider/profile')}
            className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">My Profile</p>
                <p className="text-sm text-gray-600">View & edit</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/rider/earnings')}
            className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Earnings</p>
                <p className="text-sm text-gray-600">Track income</p>
              </div>
            </div>
          </button>
        </div>

        {/* Active Orders */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Orders ({activeOrders.length})</h2>
          
          {activeOrders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No active orders</h3>
              <p className="mt-1 text-sm text-gray-500">New orders will appear here when available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Order Header */}
                  <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{order.id}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border mt-1 ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">₦{order.total.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">{order.distance} • {order.estimatedTime}</p>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="p-4">
                    {/* Pickup Address */}
                    <div className="mb-4">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="h-4 w-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Pickup Location</p>
                          <p className="text-sm text-gray-600">{order.pickupAddress}</p>
                          <a href={`tel:${order.restaurantPhone}`} className="text-sm text-[#FF0000] font-medium mt-1 inline-block">
                            {order.restaurantPhone}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="mb-4">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Delivery Location</p>
                          <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                          <p className="text-sm text-gray-900 font-medium mt-1">{order.customerName}</p>
                          <a href={`tel:${order.customerPhone}`} className="text-sm text-[#FF0000] font-medium inline-block">
                            {order.customerPhone}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 mb-2">Order Items</p>
                      {order.items.map((item, index) => (
                        <p key={index} className="text-sm text-gray-600">
                          {item.quantity}x {item.name}
                        </p>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {order.status === 'ready_for_pickup' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'picked_up')}
                            className="flex-1 py-3 px-4 bg-[#FF0000] text-white rounded-full font-semibold hover:bg-[#E00000] transition-colors"
                          >
                            Confirm Pickup
                          </button>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.pickupAddress)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-3 px-4 border border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-colors"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                          </a>
                        </>
                      )}
                      
                      {order.status === 'picked_up' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'delivered')}
                            className="flex-1 py-3 px-4 bg-[#00A651] text-white rounded-full font-semibold hover:bg-[#008A43] transition-colors"
                          >
                            Mark as Delivered
                          </button>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.deliveryAddress)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-3 px-4 border border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-colors"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiderDashboard;
