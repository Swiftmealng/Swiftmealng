import { Request, Response } from 'express';
import { login, register, logout, verifyEmail, sendAdminInvite } from '../../controllers/auth.controller';
import * as authService from '../../services/auth.service';
import { AuthRequest } from '../../middleware/auth.middleware';
import jwt from 'jsonwebtoken';
import AppError from '../../utils/AppError';

// Mock dependencies
jest.mock('../../services/auth.service');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      body: {},
      cookies: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
    process.env.NODE_ENV = 'development';
  });

  describe('login', () => {
    it('should login user successfully with rememberMe true', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'customer',
      };
      const mockAccessToken = 'mock-access-token';
      const mockRefreshToken = 'mock-refresh-token';

      mockReq.body = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      };

      (authService.loginUser as jest.Mock).mockResolvedValue({
        user: mockUser,
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });

      await login(mockReq as Request, mockRes as Response);

      expect(authService.loginUser).toHaveBeenCalledWith('test@example.com', 'password123', true);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'accessToken',
        mockAccessToken,
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
        })
      );
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refreshToken',
        mockRefreshToken,
        expect.any(Object)
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: mockUser,
          accessToken: mockAccessToken,
          refreshToken: mockRefreshToken,
        },
      });
    });

    it('should login user with rememberMe false and shorter expiry', async () => {
      const mockUser = { id: '123', email: 'test@example.com', role: 'customer' };
      mockReq.body = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      };

      (authService.loginUser as jest.Mock).mockResolvedValue({
        user: mockUser,
        accessToken: 'token',
        refreshToken: 'refresh',
      });

      await login(mockReq as Request, mockRes as Response);

      expect(authService.loginUser).toHaveBeenCalledWith('test@example.com', 'password123', false);
    });

    it('should set secure cookie in production', async () => {
      process.env.NODE_ENV = 'production';
      mockReq.body = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      };

      (authService.loginUser as jest.Mock).mockResolvedValue({
        user: { id: '123' },
        accessToken: 'token',
        refreshToken: 'refresh',
      });

      await login(mockReq as Request, mockRes as Response);

      expect(mockRes.cookie).toHaveBeenCalledWith(
        'accessToken',
        'token',
        expect.objectContaining({ secure: true })
      );
    });
  });

  describe('register', () => {
    it('should register customer without invite token', async () => {
      mockReq.body = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        phone: '+1234567890',
        role: 'customer',
      };

      const mockUser = { id: '123', email: 'newuser@example.com', role: 'customer' };
      (authService.registerUser as jest.Mock).mockResolvedValue({
        user: mockUser,
        message: 'Verification code sent',
      });

      await register(mockReq as Request, mockRes as Response);

      expect(authService.registerUser).toHaveBeenCalledWith({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        phone: '+1234567890',
        role: 'customer',
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Verification code sent',
        data: { user: mockUser },
      });
    });

    it('should reject admin registration without invite token', async () => {
      mockReq.body = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
      };

      await expect(register(mockReq as Request, mockRes as Response)).rejects.toThrow(
        'Admin invitation required for this role'
      );
    });

    it('should register admin with valid invite token', async () => {
      process.env.JWT_SECRET = 'test-secret';
      const inviteToken = 'valid-token';
      
      mockReq.body = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
        inviteToken,
      };

      (jwt.verify as jest.Mock).mockReturnValue({
        email: 'admin@example.com',
        role: 'admin',
        type: 'admin-invite',
      });

      (authService.registerUser as jest.Mock).mockResolvedValue({
        user: { id: '123', email: 'admin@example.com', role: 'admin' },
        message: 'Admin registered',
      });

      await register(mockReq as Request, mockRes as Response);

      expect(jwt.verify).toHaveBeenCalledWith(inviteToken, 'test-secret');
      expect(authService.registerUser).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should reject admin registration with mismatched email', async () => {
      process.env.JWT_SECRET = 'test-secret';
      mockReq.body = {
        email: 'different@example.com',
        role: 'admin',
        inviteToken: 'token',
      };

      (jwt.verify as jest.Mock).mockReturnValue({
        email: 'admin@example.com',
        role: 'admin',
        type: 'admin-invite',
      });

      await expect(register(mockReq as Request, mockRes as Response)).rejects.toThrow(
        'Invitation email does not match'
      );
    });

    it('should reject admin registration with mismatched role', async () => {
      process.env.JWT_SECRET = 'test-secret';
      mockReq.body = {
        email: 'admin@example.com',
        role: 'operations',
        inviteToken: 'token',
      };

      (jwt.verify as jest.Mock).mockReturnValue({
        email: 'admin@example.com',
        role: 'admin',
        type: 'admin-invite',
      });

      await expect(register(mockReq as Request, mockRes as Response)).rejects.toThrow(
        'Invitation role does not match'
      );
    });

    it('should reject expired invite token', async () => {
      process.env.JWT_SECRET = 'test-secret';
      mockReq.body = {
        email: 'admin@example.com',
        role: 'admin',
        inviteToken: 'expired-token',
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        const error: any = new Error('Token expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      await expect(register(mockReq as Request, mockRes as Response)).rejects.toThrow(
        'Invitation link has expired'
      );
    });

    it('should reject invalid invite token', async () => {
      process.env.JWT_SECRET = 'test-secret';
      mockReq.body = {
        email: 'admin@example.com',
        role: 'admin',
        inviteToken: 'invalid-token',
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        const error: any = new Error('Invalid token');
        error.name = 'JsonWebTokenError';
        throw error;
      });

      await expect(register(mockReq as Request, mockRes as Response)).rejects.toThrow(
        'Invalid invitation token'
      );
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const authReq = mockReq as AuthRequest;
      authReq.user = { id: '123', email: 'test@example.com', role: 'customer' };

      (authService.logoutUser as jest.Mock).mockResolvedValue(undefined);

      await logout(authReq as Request, mockRes as Response);

      expect(authService.logoutUser).toHaveBeenCalledWith('123');
      expect(mockRes.cookie).toHaveBeenCalledWith('accessToken', '', {
        expires: new Date(0),
        httpOnly: true,
      });
      expect(mockRes.cookie).toHaveBeenCalledWith('refreshToken', '', {
        expires: new Date(0),
        httpOnly: true,
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logged out successfully',
      });
    });

    it('should handle logout without user in request', async () => {
      await logout(mockReq as Request, mockRes as Response);

      expect(authService.logoutUser).not.toHaveBeenCalled();
      expect(mockRes.cookie).toHaveBeenCalledTimes(2);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      mockReq.body = {
        email: 'test@example.com',
        code: '123456',
      };

      (authService.verifyEmail as jest.Mock).mockResolvedValue({
        message: 'Email verified successfully',
      });

      await verifyEmail(mockReq as Request, mockRes as Response);

      expect(authService.verifyEmail).toHaveBeenCalledWith('test@example.com', '123456');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Email verified successfully',
      });
    });
  });

  describe('sendAdminInvite', () => {
    it('should generate admin invite link successfully', async () => {
      process.env.JWT_SECRET = 'test-secret';
      process.env.FRONTEND_URL = 'https://example.com';

      const authReq = mockReq as AuthRequest;
      authReq.user = { id: '123', email: 'admin@example.com', role: 'admin' };
      authReq.body = {
        email: 'newadmin@example.com',
        role: 'admin',
      };

      (jwt.sign as jest.Mock).mockReturnValue('generated-token');

      await sendAdminInvite(authReq as Request, mockRes as Response);

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          email: 'newadmin@example.com',
          role: 'admin',
          type: 'admin-invite',
        },
        'test-secret',
        { expiresIn: '7d' }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Invitation generated successfully',
        data: expect.objectContaining({
          inviteLink: 'https://example.com/signup?token=generated-token',
          inviteToken: 'generated-token',
          email: 'newadmin@example.com',
          role: 'admin',
          expiresIn: '7 days',
        }),
      });
    });

    it('should reject invite from non-admin user', async () => {
      const authReq = mockReq as AuthRequest;
      authReq.user = { id: '123', email: 'user@example.com', role: 'customer' };
      authReq.body = {
        email: 'newadmin@example.com',
        role: 'admin',
      };

      await expect(sendAdminInvite(authReq as Request, mockRes as Response)).rejects.toThrow(
        'Only admins can send invitations'
      );
    });

    it('should reject invalid role', async () => {
      const authReq = mockReq as AuthRequest;
      authReq.user = { id: '123', email: 'admin@example.com', role: 'admin' };
      authReq.body = {
        email: 'newuser@example.com',
        role: 'invalid-role',
      };

      await expect(sendAdminInvite(authReq as Request, mockRes as Response)).rejects.toThrow(
        'Invalid role'
      );
    });

    it('should reject invalid email format', async () => {
      const authReq = mockReq as AuthRequest;
      authReq.user = { id: '123', email: 'admin@example.com', role: 'admin' };
      authReq.body = {
        email: 'invalid-email',
        role: 'admin',
      };

      await expect(sendAdminInvite(authReq as Request, mockRes as Response)).rejects.toThrow(
        'Valid email is required'
      );
    });

    it('should use default frontend URL when not set', async () => {
      process.env.JWT_SECRET = 'test-secret';
      delete process.env.FRONTEND_URL;

      const authReq = mockReq as AuthRequest;
      authReq.user = { id: '123', email: 'admin@example.com', role: 'admin' };
      authReq.body = {
        email: 'newadmin@example.com',
        role: 'operations',
      };

      (jwt.sign as jest.Mock).mockReturnValue('token');

      await sendAdminInvite(authReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            inviteLink: 'http://localhost:5173/signup?token=token',
          }),
        })
      );
    });
  });
});