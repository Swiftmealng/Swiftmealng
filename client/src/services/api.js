import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
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

export const tokenManager = {
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },
  getAccessToken: () => localStorage.getItem('accessToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
  setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  clearUser: () => localStorage.removeItem('user')
};

export default api;