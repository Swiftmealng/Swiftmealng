import { Request, Response } from 'express';
import { login, register } from '../../controllers/auth.controller';
import * as authService from '../../services/auth.service';
import jwt from 'jsonwebtoken';

jest.mock('../../services/auth.service');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login user and set cookies', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        role: 'customer'
      };

      mockReq.body = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false
      };

      (authService.loginUser as jest.Mock).mockResolvedValue({
        user: mockUser,
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      });

      await login(mockReq as Request, mockRes as Response);

      expect(authService.loginUser).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        false
      );

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'accessToken',
        'access-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict'
        })
      );

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict'
        })
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: mockUser,
          accessToken: 'access-token',
          refreshToken: 'refresh-token'
        }
      });
    });

    it('should set longer cookie expiry when rememberMe is true', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true
      };

      (authService.loginUser as jest.Mock).mockResolvedValue({
        user: { _id: 'user123' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      });

      await login(mockReq as Request, mockRes as Response);

      // Check that cookie was set with appropriate expiry
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'accessToken',
        'access-token',
        expect.objectContaining({
          expires: expect.any(Date)
        })
      );
    });

    it('should use secure cookies in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      mockReq.body = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false
      };

      (authService.loginUser as jest.Mock).mockResolvedValue({
        user: { _id: 'user123' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      });

      await login(mockReq as Request, mockRes as Response);

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'accessToken',
        'access-token',
        expect.objectContaining({
          secure: true
        })
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('register', () => {
    it('should successfully register a customer without invite token', async () => {
      mockReq.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '+1234567890',
        role: 'customer'
      };

      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer'
      };

      (authService.registerUser as jest.Mock).mockResolvedValue({
        user: mockUser,
        message: 'Verification code sent to your email'
      });

      await register(mockReq as Request, mockRes as Response);

      expect(authService.registerUser).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '+1234567890',
        role: 'customer'
      });

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should reject admin registration without invite token', async () => {
      mockReq.body = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin'
      };

      await register(mockReq as Request, mockRes as Response);

      expect(authService.registerUser).not.toHaveBeenCalled();
    });

    it('should accept admin registration with valid invite token', async () => {
      const inviteToken = 'valid-invite-token';
      
      mockReq.body = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
        inviteToken
      };

      (jwt.verify as jest.Mock).mockReturnValue({
        email: 'admin@example.com',
        role: 'admin',
        type: 'admin-invite'
      });

      (authService.registerUser as jest.Mock).mockResolvedValue({
        user: { _id: 'admin123', email: 'admin@example.com', role: 'admin' },
        message: 'Verification code sent'
      });

      await register(mockReq as Request, mockRes as Response);

      expect(jwt.verify).toHaveBeenCalledWith(inviteToken, process.env.JWT_SECRET);
      expect(authService.registerUser).toHaveBeenCalled();
    });

    it('should reject admin registration with mismatched email in token', async () => {
      mockReq.body = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
        inviteToken: 'token'
      };

      (jwt.verify as jest.Mock).mockReturnValue({
        email: 'different@example.com',
        role: 'admin',
        type: 'admin-invite'
      });

      await register(mockReq as Request, mockRes as Response);

      expect(authService.registerUser).not.toHaveBeenCalled();
    });

    it('should reject admin registration with mismatched role in token', async () => {
      mockReq.body = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
        inviteToken: 'token'
      };

      (jwt.verify as jest.Mock).mockReturnValue({
        email: 'admin@example.com',
        role: 'operations',
        type: 'admin-invite'
      });

      await register(mockReq as Request, mockRes as Response);

      expect(authService.registerUser).not.toHaveBeenCalled();
    });

    it('should reject expired invite tokens', async () => {
      mockReq.body = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
        inviteToken: 'expired-token'
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        const error: any = new Error('jwt expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      await register(mockReq as Request, mockRes as Response);

      expect(authService.registerUser).not.toHaveBeenCalled();
    });

    it('should reject operations role without invite token', async () => {
      mockReq.body = {
        name: 'Operations User',
        email: 'ops@example.com',
        password: 'password123',
        role: 'operations'
      };

      await register(mockReq as Request, mockRes as Response);

      expect(authService.registerUser).not.toHaveBeenCalled();
    });
  });
});