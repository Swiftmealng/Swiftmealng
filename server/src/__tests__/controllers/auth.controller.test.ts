import { Request, Response } from 'express';
import * as authController from '../../controllers/auth.controller';
import * as authService from '../../services/auth.service';
import User from '../../models/User';
import jwt from 'jsonwebtoken';
import AppError from '../../utils/AppError';
import { AuthRequest } from '../../middleware/auth.middleware';

// Mock dependencies
jest.mock('../../services/auth.service');
jest.mock('../../models/User');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      cookies: {},
      headers: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
    process.env.JWT_SECRET = 'test-secret';
    process.env.NODE_ENV = 'test';
    process.env.FRONTEND_URL = 'http://localhost:5173';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login user with valid credentials', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'customer',
      };

      const mockTokens = {
        user: mockUser,
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      };

      (authService.loginUser as jest.Mock).mockResolvedValue(mockTokens);

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(authService.loginUser).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        false
      );
      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'accessToken',
        'mock-access-token',
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
        })
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: mockUser,
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      });
    });

    it('should set longer cookie expiration when rememberMe is true', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'customer',
      };

      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true,
      };

      (authService.loginUser as jest.Mock).mockResolvedValue({
        user: mockUser,
        accessToken: 'token',
        refreshToken: 'refresh-token',
      });

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      const cookieCall = (mockResponse.cookie as jest.Mock).mock.calls[0];
      const accessTokenExpiry = cookieCall[2].expires;
      const now = new Date();
      const diff = accessTokenExpiry.getTime() - now.getTime();

      // Should be approximately 7 days (with 1 minute tolerance)
      expect(diff).toBeGreaterThan(7 * 24 * 60 * 60 * 1000 - 60000);
      expect(diff).toBeLessThan(7 * 24 * 60 * 60 * 1000 + 60000);
    });

    it('should handle login errors', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const error = new Error('Invalid credentials');
      (authService.loginUser as jest.Mock).mockRejectedValue(error);

      await expect(
        authController.login(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should successfully register a customer without invite token', async () => {
      mockRequest.body = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        phone: '+1234567890',
        role: 'customer',
      };

      const mockResult = {
        user: {
          _id: 'user123',
          name: 'New User',
          email: 'newuser@example.com',
          role: 'customer',
        },
        message: 'Verification code sent to your email',
      };

      (authService.registerUser as jest.Mock).mockResolvedValue(mockResult);

      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(authService.registerUser).toHaveBeenCalledWith({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        phone: '+1234567890',
        role: 'customer',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: mockResult.message,
        data: { user: mockResult.user },
      });
    });

    it('should reject admin registration without invite token', async () => {
      mockRequest.body = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
      };

      await expect(
        authController.register(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow(AppError);

      await expect(
        authController.register(mockRequest as Request, mockResponse as Response)
      ).rejects.toMatchObject({
        message: 'Admin invitation required for this role',
        statusCode: 403,
      });
    });

    it('should successfully register admin with valid invite token', async () => {
      const inviteToken = 'valid-invite-token';
      mockRequest.body = {
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

      const mockResult = {
        user: {
          _id: 'admin123',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
        },
        message: 'Verification code sent to your email',
      };

      (authService.registerUser as jest.Mock).mockResolvedValue(mockResult);

      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jwt.verify).toHaveBeenCalledWith(inviteToken, 'test-secret');
      expect(authService.registerUser).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('should reject admin registration with mismatched email in token', async () => {
      mockRequest.body = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
        inviteToken: 'token',
      };

      (jwt.verify as jest.Mock).mockReturnValue({
        email: 'different@example.com',
        role: 'admin',
        type: 'admin-invite',
      });

      await expect(
        authController.register(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow('Invitation email does not match');
    });

    it('should reject admin registration with expired invite token', async () => {
      mockRequest.body = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
        inviteToken: 'expired-token',
      };

      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw error;
      });

      await expect(
        authController.register(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow('Invitation link has expired');
    });

    it('should reject operations role registration without invite token', async () => {
      mockRequest.body = {
        name: 'Ops User',
        email: 'ops@example.com',
        password: 'password123',
        role: 'operations',
      };

      await expect(
        authController.register(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow('Admin invitation required for this role');
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      const authReq = mockRequest as AuthRequest;
      authReq.user = {
        id: 'user123',
        email: 'test@example.com',
        role: 'customer',
      };

      (authService.logoutUser as jest.Mock).mockResolvedValue({
        message: 'Logged out successfully',
      });

      await authController.logout(authReq as Request, mockResponse as Response);

      expect(authService.logoutUser).toHaveBeenCalledWith('user123');
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'accessToken',
        '',
        expect.objectContaining({
          expires: new Date(0),
          httpOnly: true,
        })
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        '',
        expect.objectContaining({
          expires: new Date(0),
          httpOnly: true,
        })
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logged out successfully',
      });
    });

    it('should handle logout without authenticated user', async () => {
      const authReq = mockRequest as AuthRequest;
      authReq.user = undefined;

      await authController.logout(authReq as Request, mockResponse as Response);

      expect(authService.logoutUser).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('verifyEmail', () => {
    it('should successfully verify email with valid code', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        code: '123456',
      };

      (authService.verifyEmail as jest.Mock).mockResolvedValue({
        message: 'Email verified successfully',
      });

      await authController.verifyEmail(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(authService.verifyEmail).toHaveBeenCalledWith(
        'test@example.com',
        '123456'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Email verified successfully',
      });
    });

    it('should handle invalid verification code', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        code: 'wrong',
      };

      const error = new Error('Invalid verification code');
      (authService.verifyEmail as jest.Mock).mockRejectedValue(error);

      await expect(
        authController.verifyEmail(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow('Invalid verification code');
    });
  });

  describe('resendCode', () => {
    it('should successfully resend verification code', async () => {
      mockRequest.body = { email: 'test@example.com' };

      (authService.resendVerificationCode as jest.Mock).mockResolvedValue({
        message: 'New verification code sent to your email',
      });

      await authController.resendCode(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(authService.resendVerificationCode).toHaveBeenCalledWith(
        'test@example.com'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('refreshToken', () => {
    it('should refresh access token from request body', async () => {
      mockRequest.body = { refreshToken: 'valid-refresh-token' };

      (authService.refreshAccessToken as jest.Mock).mockResolvedValue({
        accessToken: 'new-access-token',
      });

      await authController.refreshToken(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(authService.refreshAccessToken).toHaveBeenCalledWith(
        'valid-refresh-token'
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'accessToken',
        'new-access-token',
        expect.any(Object)
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should refresh access token from cookies', async () => {
      mockRequest.cookies = { refreshToken: 'cookie-refresh-token' };

      (authService.refreshAccessToken as jest.Mock).mockResolvedValue({
        accessToken: 'new-access-token',
      });

      await authController.refreshToken(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(authService.refreshAccessToken).toHaveBeenCalledWith(
        'cookie-refresh-token'
      );
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset code', async () => {
      mockRequest.body = { email: 'test@example.com' };

      (authService.requestPasswordReset as jest.Mock).mockResolvedValue({
        message: 'Password reset code sent to your email',
      });

      await authController.forgotPassword(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(authService.requestPasswordReset).toHaveBeenCalledWith(
        'test@example.com'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password with valid code', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        code: '123456',
        newPassword: 'newpassword123',
      };

      (authService.resetPassword as jest.Mock).mockResolvedValue({
        message: 'Password reset successfully',
      });

      await authController.resetPassword(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(authService.resetPassword).toHaveBeenCalledWith(
        'test@example.com',
        '123456',
        'newpassword123'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('sendAdminInvite', () => {
    it('should generate admin invitation link for admin user', async () => {
      const authReq = mockRequest as AuthRequest;
      authReq.user = {
        id: 'admin123',
        email: 'admin@example.com',
        role: 'admin',
      };
      authReq.body = {
        email: 'newadmin@example.com',
        role: 'operations',
      };

      const mockToken = 'mock-invite-token';
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      await authController.sendAdminInvite(
        authReq as Request,
        mockResponse as Response
      );

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          email: 'newadmin@example.com',
          role: 'operations',
          type: 'admin-invite',
        },
        'test-secret',
        { expiresIn: '7d' }
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Invitation generated successfully',
        data: expect.objectContaining({
          inviteLink: expect.stringContaining(mockToken),
          inviteToken: mockToken,
          email: 'newadmin@example.com',
          role: 'operations',
        }),
      });
    });

    it('should reject invitation from non-admin user', async () => {
      const authReq = mockRequest as AuthRequest;
      authReq.user = {
        id: 'user123',
        email: 'user@example.com',
        role: 'customer',
      };
      authReq.body = {
        email: 'someone@example.com',
        role: 'admin',
      };

      await expect(
        authController.sendAdminInvite(
          authReq as Request,
          mockResponse as Response
        )
      ).rejects.toThrow('Only admins can send invitations');
    });

    it('should reject invalid role in invitation', async () => {
      const authReq = mockRequest as AuthRequest;
      authReq.user = {
        id: 'admin123',
        email: 'admin@example.com',
        role: 'admin',
      };
      authReq.body = {
        email: 'someone@example.com',
        role: 'invalid-role',
      };

      await expect(
        authController.sendAdminInvite(
          authReq as Request,
          mockResponse as Response
        )
      ).rejects.toThrow('Invalid role');
    });

    it('should reject invalid email format', async () => {
      const authReq = mockRequest as AuthRequest;
      authReq.user = {
        id: 'admin123',
        email: 'admin@example.com',
        role: 'admin',
      };
      authReq.body = {
        email: 'invalid-email',
        role: 'admin',
      };

      await expect(
        authController.sendAdminInvite(
          authReq as Request,
          mockResponse as Response
        )
      ).rejects.toThrow('Valid email is required');
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token with valid refresh token', async () => {
      mockRequest.body = { refreshToken: 'valid-refresh-token' };

      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        role: 'customer',
        refreshToken: 'hashed-refresh-token',
        refreshTokenExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const bcrypt = require('bcryptjs');
      bcrypt.compare = jest.fn().mockResolvedValue(true);

      const generateToken = require('../../utils/generateToken');
      generateToken.generateToken = jest.fn().mockReturnValue('new-token');

      await authController.refreshAccessToken(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          accessToken: expect.any(String),
        }),
      });
    });

    it('should reject request without refresh token', async () => {
      mockRequest.body = {};

      await expect(
        authController.refreshAccessToken(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow('Refresh token is required');
    });
  });
});