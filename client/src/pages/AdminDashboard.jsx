import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI, analyticsAPI } from '../services/api';
import toast from 'react-hot-toast'

const AdminDashboard = () => {

  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    activeRiders: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('orders'); 

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const [ordersResponse, ridersResponse] = await Promise.all([
        orderAPI.getAll(params),
        analyticsAPI.getRiderPerformance()
      ]);
      
      if (ordersResponse.success) {
        setOrders(ordersResponse.data.orders);
        
        // Calculate analytics from orders
        const totalOrders = ordersResponse.data.orders.length;
        const activeOrders = ordersResponse.data.orders.filter(o => o.status === 'active').length;
        const completedOrders = ordersResponse.data.orders.filter(o => o.status === 'completed').length;
        const cancelledOrders = ordersResponse.data.orders.filter(o => o.status === 'cancelled').length;
        const totalRevenue = ordersResponse.data.orders
          .filter(o => o.status === 'completed')
          .reduce((sum, o) => sum + (o.total || 0), 0);
        
        // Get active riders count from analytics
        const activeRiders = ridersResponse.success 
          ? ridersResponse.data.riders.filter(r => r.isOnline || r.activeOrders > 0).length 
          : 0;
        
        setAnalytics({
          totalOrders,
          activeOrders,
          completedOrders,
          cancelledOrders,
          totalRevenue,
          activeRiders
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await orderAPI.updateStatus(orderId, newStatus);
      
      if (response.success) {
        toast.success('Order status updated successfully!');
        fetchDashboardData(); // Refresh data
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error('Failed to update order status. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = searchQuery === '' || 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

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
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Remove this entire Toast section */}
      {/*
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
          duration={0}
        />
      ))}
      */}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage orders, users, and view analytics</p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalOrders}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.activeOrders}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">₦{analytics.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.completedOrders}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Riders</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.activeRiders}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cancelled Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.cancelledOrders}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'orders'
                    ? 'border-[#FF0000] text-[#FF0000]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-[#FF0000] text-[#FF0000]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            {/* Filters and Search */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by order ID, name, or phone..."
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF0000] focus:border-transparent"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
                  <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter.</p>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div key={order._id} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{order.orderNumber}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p className="font-medium text-gray-900">{order.customerName}</p>
                          <p>{order.customerPhone}</p>
                          <p className="text-gray-500">{order.deliveryArea}</p>
                          <p className="text-gray-500">
                            {order.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}
                          </p>
                          {order.riderName && (
                            <p className="text-blue-600">Rider: {order.riderName}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end gap-2">
                        <p className="text-xl font-bold text-gray-900">₦{Number(order.total || 0).toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{order.estimatedDelivery}</p>
                        
                        <div className="flex gap-2 mt-2">
                          <Link
                            to={`/OrderDetails/${order.orderNumber}`}
                            className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            View Details
                          </Link>
                          
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleStatusUpdate(order._id, 'active')}
                              className="px-4 py-2 bg-[#FF0000] border border-transparent rounded-full text-sm font-medium text-white hover:bg-[#E00000] transition-colors"
                            >
                              Assign Rider
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Order Status Distribution */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Status Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Pending', value: analytics.totalOrders - analytics.activeOrders - analytics.completedOrders - analytics.cancelledOrders, color: 'bg-yellow-500', lightColor: 'bg-yellow-100' },
                  { label: 'Active', value: analytics.activeOrders, color: 'bg-blue-500', lightColor: 'bg-blue-100' },
                  { label: 'Completed', value: analytics.completedOrders, color: 'bg-green-500', lightColor: 'bg-green-100' },
                  { label: 'Cancelled', value: analytics.cancelledOrders, color: 'bg-red-500', lightColor: 'bg-red-100' }
                ].map((stat) => {
                  const percentage = analytics.totalOrders > 0 ? ((stat.value / analytics.totalOrders) * 100).toFixed(1) : 0;
                  return (
                    <div key={stat.label} className={`${stat.lightColor} rounded-xl p-4`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                        <span className="text-xs font-semibold text-gray-500">{percentage}%</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</div>
                      <div className="w-full bg-white rounded-full h-2">
                        <div className={`${stat.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Revenue & Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Breakdown */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Insights</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">₦{analytics.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-600">Avg. Order Value</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ₦{analytics.completedOrders > 0 ? Math.round(analytics.totalRevenue / analytics.completedOrders).toLocaleString() : 0}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-600">Completion Rate</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analytics.totalOrders > 0 ? ((analytics.completedOrders / analytics.totalOrders) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rider Performance */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Rider Performance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-600">Active Riders</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.activeRiders}</p>
                    </div>
                    <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-600">Orders per Rider</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analytics.activeRiders > 0 ? (analytics.activeOrders / analytics.activeRiders).toFixed(1) : 0}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">Cancellation Rate</p>
                      <span className="text-xs font-semibold text-gray-500">
                        {analytics.totalOrders > 0 ? ((analytics.cancelledOrders / analytics.totalOrders) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-white rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${analytics.totalOrders > 0 ? (analytics.cancelledOrders / analytics.totalOrders) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="bg-gradient-to-r from-[#FF0000] to-[#FF6600] rounded-2xl shadow-lg p-6 text-white">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-white/80 text-sm mb-1">Success Rate</p>
                  <p className="text-3xl font-bold">
                    {analytics.totalOrders > 0 ? (((analytics.completedOrders) / analytics.totalOrders) * 100).toFixed(0) : 0}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-white/80 text-sm mb-1">Active Now</p>
                  <p className="text-3xl font-bold">{analytics.activeOrders}</p>
                </div>
                <div className="text-center">
                  <p className="text-white/80 text-sm mb-1">Total Delivered</p>
                  <p className="text-3xl font-bold">{analytics.completedOrders}</p>
                </div>
                <div className="text-center">
                  <p className="text-white/80 text-sm mb-1">Riders Online</p>
                  <p className="text-3xl font-bold">{analytics.activeRiders}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
