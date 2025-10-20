// import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

// // Create axios instance with default config
// const api: AxiosInstance = axios.create({
//   baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1',
//   timeout: 10000,
//   withCredentials: true, // For httpOnly cookies
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Request interceptor (for adding auth tokens, logging, etc.)
// api.interceptors.request.use(
//   (config) => {
//     // Log requests in development
//     if (process.env.NODE_ENV === 'development') {
//       console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
//     }
//     return config;
//   },
//   (error: AxiosError) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor (for handling errors globally)
// api.interceptors.response.use(
//   (response: AxiosResponse) => {
//     // Log successful responses in development
//     if (process.env.NODE_ENV === 'development') {
//       console.log(`✅ ${response.config.url} - ${response.status}`);
//     }
//     return response;
//   },
//   (error: AxiosError) => {
//     // Log errors
//     if (process.env.NODE_ENV === 'development') {
//       console.error(`❌ ${error.config?.url} - ${error.response?.status}`);
//     }

//     // Handle specific error cases
//     if (error.response?.status === 401) {
//       // Unauthorized - redirect to login
//       window.location.href = '/login';
//     }

//     if (error.response?.status === 404) {
//       console.error('Resource not found');
//     }

//     if (error.response?.status === 500) {
//       console.error('Server error');
//     }

//     return Promise.reject(error);
//   }
// );

// // API Response type
// interface ApiResponse<T> {
//   success: boolean;
//   data: T;
//   error?: string;
// }

// // Tracking API
// export const trackingAPI = {
//   getOrderByNumber: async (orderNumber: string): Promise<ApiResponse<any>> => {
//     const response = await api.get(`/track/${orderNumber}`);
//     return response.data;
//   },
// };

// // Orders API
// export const ordersAPI = {
//   getAllOrders: async (filters?: {
//     status?: string;
//     area?: string;
//     isDelayed?: boolean;
//     page?: number;
//     limit?: number;
//   }): Promise<ApiResponse<any>> => {
//     const response = await api.get('/orders', { params: filters });
//     return response.data;
//   },

//   getOrderById: async (orderId: string): Promise<ApiResponse<any>> => {
//     const response = await api.get(`/orders/${orderId}`);
//     return response.data;
//   },

//   updateOrderStatus: async (
//     orderId: string,
//     status: string,
//     location?: { lat: number; lng: number }
//   ): Promise<ApiResponse<any>> => {
//     const response = await api.patch(`/orders/${orderId}/status`, {
//       status,
//       location,
//     });
//     return response.data;
//   },
// };

// // Riders API
// export const ridersAPI = {
//   getRiderById: async (riderId: string): Promise<ApiResponse<any>> => {
//     const response = await api.get(`/riders/${riderId}`);
//     return response.data;
//   },

//   updateRiderLocation: async (
//     riderId: string,
//     location: { lat: number; lng: number },
//     orderId: string
//   ): Promise<ApiResponse<any>> => {
//     const response = await api.post('/riders/location', {
//       riderId,
//       location,
//       orderId,
//     });
//     return response.data;
//   },

//   getRiderPerformance: async (riderId: string): Promise<ApiResponse<any>> => {
//     const response = await api.get(`/riders/${riderId}/performance`);
//     return response.data;
//   },
// };

// // Analytics API
// export const analyticsAPI = {
//   getDelayHeatmap: async (params?: {
//     startDate?: string;
//     endDate?: string;
//     area?: string;
//   }): Promise<ApiResponse<any>> => {
//     const response = await api.get('/analytics/delays/heatmap', { params });
//     return response.data;
//   },

//   getDelayTrends: async (): Promise<ApiResponse<any>> => {
//     const response = await api.get('/analytics/delays/trends');
//     return response.data;
//   },

//   getRiderPerformanceComparison: async (): Promise<ApiResponse<any>> => {
//     const response = await api.get('/analytics/riders/performance');
//     return response.data;
//   },
// };

// // Auth API
// export const authAPI = {
//   login: async (email: string, password: string): Promise<ApiResponse<any>> => {
//     const response = await api.post('/auth/login', { email, password });
//     return response.data;
//   },

//   logout: async (): Promise<ApiResponse<any>> => {
//     const response = await api.post('/auth/logout');
//     return response.data;
//   },
// };

// export default api;
// 2. Create API Types (src/types/api.ts):
// // API Response wrapper
// export interface ApiResponse<T> {
//   success: boolean;
//   data: T;
//   error?: string;
//   message?: string;
// }

// // Pagination
// export interface Pagination {
//   total: number;
//   page: number;
//   pages: number;
//   limit: number;
// }

// // Orders List Response
// export interface OrdersListResponse {
//   orders: Order[];
//   pagination: Pagination;
// }

// // Error Response
// export interface ApiError {
//   success: false;
//   error: string;
//   statusCode: number;
// }
// Commit:
// git checkout -b feature/api-integration
// git add .
// npm run commit
// # Type: feat
// # Scope: api
// # Description: create API service layer with axios and interceptors
// Afternoon: Socket.io Setup
// 3. Create Socket Service (src/services/socket.ts):
// import { io, Socket } from 'socket.io-client';

// class SocketService {
//   private socket: Socket | null = null;
//   private reconnectAttempts = 0;
//   private maxReconnectAttempts = 5;

//   /**
//    * Connect to Socket.io server
//    */
//   connect(): Socket {
//     if (this.socket?.connected) {
//       return this.socket;
//     }

//     const url = process.env.REACT_APP_API_URL || 'http://localhost:5000';

//     this.socket = io(url, {
//       transports: ['websocket', 'polling'],
//       reconnection: true,
//       reconnectionDelay: 1000,
//       reconnectionDelayMax: 5000,
//       reconnectionAttempts: this.maxReconnectAttempts,
//     });

//     this.setupEventListeners();

//     return this.socket;
//   }

//   /**
//    * Setup global socket event listeners
//    */
//   private setupEventListeners(): void {
//     if (!this.socket) return;

//     this.socket.on('connect', () => {
//       console.log('✅ Socket connected:', this.socket?.id);
//       this.reconnectAttempts = 0;
//     });

//     this.socket.on('disconnect', (reason) => {
//       console.log('❌ Socket disconnected:', reason);
//     });

//     this.socket.on('connect_error', (error) => {
//       console.error('🔴 Socket connection error:', error);
//       this.reconnectAttempts++;

//       if (this.reconnectAttempts >= this.maxReconnectAttempts) {
//         console.error('Max reconnection attempts reached');
//       }
//     });

//     this.socket.on('reconnect', (attemptNumber) => {
//       console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
//     });
//   }

//   /**
//    * Disconnect from socket server
//    */
//   disconnect(): void {
//     if (this.socket) {
//       this.socket.disconnect();
//       this.socket = null;
//     }
//   }

//   /**
//    * Check if socket is connected
//    */
//   isConnected(): boolean {
//     return this.socket?.connected || false;
//   }
  
//   // ============================================
//   // CUSTOMER TRACKING NAMESPACE
//   // ============================================

//   /**
//    * Join tracking room for a specific order
//    */
//   joinTracking(orderNumber: string): void {
//     if (!this.socket) {
//       console.error('Socket not connected');
//       return;
//     }

//     this.socket.emit('join-tracking', { orderNumber });
//     console.log('📍 Joined tracking for order:', orderNumber);
//   }

//   /**
//    * Leave tracking room
//    */
//   leaveTracking(orderNumber: string): void {
//     if (!this.socket) return;
//     this.socket.emit('leave-tracking', { orderNumber });
//     console.log('👋 Left tracking for order:', orderNumber);
//   }

//   /**
//    * Listen for location updates
//    */
//   onLocationUpdate(callback: (data: LocationUpdate) => void): void {
//     if (!this.socket) return;
//     this.socket.on('location-update', callback);
//   }

//   /**
//    * Listen for status updates
//    */
//   onStatusUpdate(callback: (data: StatusUpdate) => void): void {
//     if (!this.socket) return;
//     this.socket.on('status-update', callback);
//   }

//   /**
//    * Listen for delay alerts
//    */
//   onDelayAlert(callback: (data: DelayAlert) => void): void {
//     if (!this.socket) return;
//     this.socket.on('delay-alert', callback);
//   }

//   /**
//    * Listen for ETA updates
//    */
//   onETAUpdate(callback: (data: ETAUpdate) => void): void {
//     if (!this.socket) return;
//     this.socket.on('eta-update', callback);
//   }

//   // ============================================
//   // DASHBOARD NAMESPACE
//   // ============================================

//   /**
//    * Join dashboard room
//    */
//   joinDashboard(userId: string): void {
//     if (!this.socket) {
//       console.error('Socket not connected');
//       return;
//     }

//     this.socket.emit('join-dashboard', { userId });
//     console.log('📊 Joined dashboard');
//   }

//   /**
//    * Leave dashboard room
//    */
//   leaveDashboard(): void {
//     if (!this.socket) return;
//     this.socket.emit('leave-dashboard');
//     console.log('👋 Left dashboard');
//   }

//   /**
//    * Listen for order updates on dashboard
//    */
//   onOrderUpdate(callback: (data: OrderUpdate) => void): void {
//     if (!this.socket) return;
//     this.socket.on('order-update', callback);
//   }

//   /**
//    * Listen for new orders
//    */
//   onNewOrder(callback: (data: NewOrder) => void): void {
//     if (!this.socket) return;
//     this.socket.on('new-order', callback);
//   }

//   /**
//    * Listen for dashboard delay alerts
//    */
//   onDashboardDelayAlert(callback: (data: DashboardDelayAlert) => void): void {
//     if (!this.socket) return;
//     this.socket.on('delay-alert', callback);
//   }

//   // ============================================
//   // CLEANUP
//   // ============================================

//   /**
//    * Remove all listeners for an event
//    */
//   off(event: string): void {
//     if (!this.socket) return;
//     this.socket.off(event);
//   }

//   /**
//    * Remove all listeners
//    */
//   offAll(): void {
//     if (!this.socket) return;
//     this.socket.removeAllListeners();
//   }
// }

// // Socket event data types
// export interface LocationUpdate {
//   lat: number;
//   lng: number;
//   timestamp: string;
// }

// export interface StatusUpdate {
//   status: string;
//   timestamp: string;
// }

// export interface DelayAlert {
//   delayMinutes: number;
//   reason?: string;
//   newETA: string;
// }

// export interface ETAUpdate {
//   estimatedDeliveryTime: string;
//   minutesRemaining: number;
// }

// export interface OrderUpdate {
//   order: any; // Use your Order type
// }

// export interface NewOrder {
//   order: any; // Use your Order type
// }

// export interface DashboardDelayAlert {
//   orderId: string;
//   orderNumber: string;
//   delayMinutes: number;
//   reason?: string;
// }

// // Export singleton instance
// const socketService = new SocketService();
// export default socketService;