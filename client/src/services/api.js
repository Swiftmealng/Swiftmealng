import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Navigation callback for handling redirects
let navigationCallback = null;

export const setNavigationCallback = (callback) => {
  navigationCallback = callback;
};

const handleLogout = () => {
  tokenManager.clearTokens();
  tokenManager.clearUser();
  
  // Use callback if available (React Router), otherwise fall back to window.location
  if (navigationCallback) {
    navigationCallback('/login');
  } else {
    window.location.href = '/login';
  }
};

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue requests while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenManager.getRefreshToken();
      
      if (!refreshToken) {
        // No refresh token, clear and redirect
        toast.error('Please log in again.');
        handleLogout();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken
        });

        // Backend returns { success: true, data: { accessToken } }
        // Axios interceptor unwraps to { data: { accessToken } }
        const { accessToken } = response.data;
        const rememberMe = localStorage.getItem('rememberMe') === 'true';
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('accessToken', accessToken);
        
        isRefreshing = false;
        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        
        // Refresh failed, clear and redirect
        toast.error('Please log in again.');
        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    // Get user-friendly error message
    const status = error.response?.status;
    const serverMessage = error.response?.data?.message;
    
    let friendlyMessage = serverMessage || error.message || 'An error occurred';
    
    // Map common status codes to friendly messages
    if (!serverMessage) {
      switch (status) {
        case 400:
          friendlyMessage = 'Invalid request. Please check your input.';
          break;
        case 401:
          friendlyMessage = 'Please log in to continue.';
          break;
        case 403:
          friendlyMessage = "You don't have permission to do this.";
          break;
        case 404:
          friendlyMessage = 'The requested resource was not found.';
          break;
        case 429:
          friendlyMessage = 'Too many requests. Please slow down and try again.';
          break;
        case 500:
          friendlyMessage = 'Something went wrong on our end. Please try again.';
          break;
        case 503:
          friendlyMessage = 'Service temporarily unavailable. Please try again later.';
          break;
        default:
          if (status >= 500) {
            friendlyMessage = 'Server error. Please try again later.';
          }
      }
    }
    
    // Show toast for errors (except 401 which is handled above)
    if (status !== 401) {
      toast.error(friendlyMessage);
    }
    
    return Promise.reject(new Error(friendlyMessage));
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  resendCode: (data) => api.post('/auth/resend-code', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh-token', { refreshToken: localStorage.getItem('refreshToken') })
};

export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  getById: (orderId) => api.get(`/orders/${orderId}`),
  updateStatus: (orderId, status) => api.patch(`/orders/${orderId}/status`, { status }),
  track: (orderNumber) => api.get(`/track/${orderNumber}`)
};

export const riderAPI = {
  getProfile: (riderId) => api.get(`/riders/${riderId}`),
  updateProfile: (riderId, data) => api.patch(`/riders/${riderId}`, data),
  uploadPhoto: (riderId, file) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post(`/riders/${riderId}/photo`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  getPerformance: (riderId) => api.get(`/riders/${riderId}/performance`),
  updateLocation: (location) => api.post('/riders/location', location)
};

export const analyticsAPI = {
  getDelayHeatmap: (params) => api.get('/analytics/delays/heatmap', { params }),
  getDelayTrends: (params) => api.get('/analytics/delays/trends', { params }),
  getRiderPerformance: () => api.get('/analytics/riders/performance')
};

export const adminAPI = {
  sendInvite: (data) => api.post('/auth/admin/invite', data)
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (notificationId) => api.patch(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  send: (data) => api.post('/notifications/send', data)
};

export const userAPI = {
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (userId, data) => api.patch(`/users/${userId}`, data),
  updatePassword: (userId, data) => api.patch(`/users/${userId}/password`, data),
  uploadPhoto: (userId, file) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post(`/users/${userId}/photo`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  }
};

export const favoritesAPI = {
  getAll: () => api.get('/favorites'),
  add: (data) => api.post('/favorites', data),
  remove: (favoriteId) => api.delete(`/favorites/${favoriteId}`)
};

export const ratingsAPI = {
  create: (data) => api.post('/ratings', data),
  getByOrder: (orderId) => api.get('/ratings', { params: { orderId } })
};

export const paymentAPI = {
  initiate: (data) => api.post('/payments', data),
  verify: (reference) => api.get(`/payments/verify/${reference}`)
};

export const publicAPI = {
  getStats: () => api.get('/public/stats')
};

export const tokenManager = {
  setTokens: (accessToken, refreshToken, rememberMe = false) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('accessToken', accessToken);
    storage.setItem('refreshToken', refreshToken);
    // Store the preference so we know where to look
    localStorage.setItem('rememberMe', rememberMe.toString());
  },
  getAccessToken: () => {
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    const storage = rememberMe ? localStorage : sessionStorage;
    return storage.getItem('accessToken');
  },
  getRefreshToken: () => {
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    const storage = rememberMe ? localStorage : sessionStorage;
    return storage.getItem('refreshToken');
  },
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    localStorage.removeItem('rememberMe');
  },
  setUser: (user) => {
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(user));
  },
  getUser: () => {
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    const storage = rememberMe ? localStorage : sessionStorage;
    const user = storage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  clearUser: () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
  }
};

export default api;