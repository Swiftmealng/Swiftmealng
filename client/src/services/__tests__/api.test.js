import axios from 'axios';
import {
  authAPI,
  orderAPI,
  riderAPI,
  analyticsAPI,
  notificationAPI,
  userAPI,
  favoritesAPI,
  ratingsAPI,
  paymentAPI,
  tokenManager,
} from '../api';

jest.mock('axios');

describe('API Service', () => {
  let mockAxiosInstance;

  beforeEach(() => {
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    };

    axios.create = jest.fn(() => mockAxiosInstance);
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Auth API', () => {
    it('should register a new user', async () => {
      const userData = { name: 'John', email: 'john@test.com', password: 'password123' };
      mockAxiosInstance.post.mockResolvedValue({ data: { success: true } });

      await authAPI.register(userData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/register', userData);
    });

    it('should login a user', async () => {
      const credentials = { email: 'john@test.com', password: 'password123' };
      mockAxiosInstance.post.mockResolvedValue({ data: { success: true } });

      await authAPI.login(credentials);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/login', credentials);
    });

    it('should verify email', async () => {
      const data = { email: 'john@test.com', code: '123456' };
      mockAxiosInstance.post.mockResolvedValue({ data: { success: true } });

      await authAPI.verifyEmail(data);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/verify-email', data);
    });

    it('should request password reset', async () => {
      const data = { email: 'john@test.com' };
      mockAxiosInstance.post.mockResolvedValue({ data: { success: true } });

      await authAPI.forgotPassword(data);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/forgot-password', data);
    });

    it('should reset password', async () => {
      const data = { token: 'resetToken', password: 'newPassword123' };
      mockAxiosInstance.post.mockResolvedValue({ data: { success: true } });

      await authAPI.resetPassword(data);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/reset-password', data);
    });
  });

  describe('Favorites API', () => {
    it('should get all favorites', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: { favorites: [] } });

      await favoritesAPI.getAll();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/favorites');
    });

    it('should add a favorite', async () => {
      const data = { mealName: 'Pizza', restaurantName: 'Pizza Place' };
      mockAxiosInstance.post.mockResolvedValue({ data: { success: true } });

      await favoritesAPI.add(data);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/favorites', data);
    });

    it('should remove a favorite', async () => {
      mockAxiosInstance.delete.mockResolvedValue({ data: { success: true } });

      await favoritesAPI.remove('fav123');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/favorites/fav123');
    });
  });

  describe('Ratings API', () => {
    it('should create a rating', async () => {
      const data = {
        orderId: 'order123',
        orderNumber: 'ORD-001',
        foodRating: 5,
        deliveryRating: 4,
      };
      mockAxiosInstance.post.mockResolvedValue({ data: { success: true } });

      await ratingsAPI.create(data);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/ratings', data);
    });

    it('should get rating by order', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: { rating: {} } });

      await ratingsAPI.getByOrder('order123');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/ratings', {
        params: { orderId: 'order123' },
      });
    });
  });

  describe('Payment API', () => {
    it('should initiate payment', async () => {
      const data = { orderId: 'order123', amount: 5000 };
      mockAxiosInstance.post.mockResolvedValue({ data: { success: true } });

      await paymentAPI.initiate(data);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/payments', data);
    });

    it('should verify payment', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: { success: true } });

      await paymentAPI.verify('ref123');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/payments/verify/ref123');
    });
  });

  describe('User API', () => {
    it('should get user profile', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: { user: {} } });

      await userAPI.getProfile('user123');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/user123');
    });

    it('should update user profile', async () => {
      const data = { name: 'Jane Doe' };
      mockAxiosInstance.patch.mockResolvedValue({ data: { success: true } });

      await userAPI.updateProfile('user123', data);

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/users/user123', data);
    });

    it('should update password', async () => {
      const data = { currentPassword: 'old', newPassword: 'new' };
      mockAxiosInstance.patch.mockResolvedValue({ data: { success: true } });

      await userAPI.updatePassword('user123', data);

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/users/user123/password', data);
    });
  });

  describe('Token Manager', () => {
    it('should set tokens', () => {
      tokenManager.setTokens('accessToken123', 'refreshToken123');

      expect(localStorage.getItem('accessToken')).toBe('accessToken123');
      expect(localStorage.getItem('refreshToken')).toBe('refreshToken123');
    });

    it('should clear tokens', () => {
      localStorage.setItem('accessToken', 'testAccessToken');
      localStorage.setItem('refreshToken', 'testRefreshToken');

      tokenManager.clearTokens();

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });
});