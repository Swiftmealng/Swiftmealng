import * as authService from '../../services/auth.service';
import User from '../../models/User';
import { AuthenticationError } from '../../utils/AppError';
import * as emailService from '../../services/email.service';
import bcrypt from 'bcryptjs';

// Mock dependencies
jest.mock('../../models/User');
jest.mock('../../services/email.service');
jest.mock('bcryptjs');
jest.mock('../../utils/generateToken', () => ({
  generateToken: jest.fn(() => 'mock-jwt-token')
}));

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateVerificationCode', () => {
    it('should generate a 6-digit verification code', () => {
      const code = authService.generateVerificationCode();
      expect(code).toHaveLength(6);
      expect(Number(code)).toBeGreaterThanOrEqual(100000);
      expect(Number(code)).toBeLessThanOrEqual(999999);
    });

    it('should generate different codes on multiple calls', () => {
      const codes = new Set();
      for (let i = 0; i < 10; i++) {
        codes.add(authService.generateVerificationCode());
      }
      expect(codes.size).toBeGreaterThan(1);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a 128-character hex string', () => {
      const token = authService.generateRefreshToken();
      expect(token).toHaveLength(128);
      expect(token).toMatch(/^[a-f0-9]+$/);
    });

    it('should generate unique tokens', () => {
      const token1 = authService.generateRefreshToken();
      const token2 = authService.generateRefreshToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('loginUser', () => {
    const mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      role: 'customer',
      isEmailVerified: true,
      comparePassword: jest.fn(),
      save: jest.fn(),
      toObject: jest.fn()
    };

    it('should successfully login user with correct credentials', async () => {
      mockUser.comparePassword.mockResolvedValue(true);
      mockUser.toObject.mockReturnValue({ ...mockUser, password: 'hashed' });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-refresh-token');
      
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      const result = await authService.loginUser('test@example.com', 'password123');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.password).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should use different token expiry for rememberMe', async () => {
      mockUser.comparePassword.mockResolvedValue(true);
      mockUser.toObject.mockReturnValue({ ...mockUser });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-refresh-token');
      
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      const result = await authService.loginUser('test@example.com', 'password123', true);
      expect(result.accessToken).toBeDefined();
    });

    it('should throw error for non-existent user', async () => {
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await expect(
        authService.loginUser('nonexistent@example.com', 'password123')
      ).rejects.toThrow(AuthenticationError);
    });

    it('should throw error for incorrect password', async () => {
      mockUser.comparePassword.mockResolvedValue(false);
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await expect(
        authService.loginUser('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw error for unverified email', async () => {
      const unverifiedUser = { ...mockUser, isEmailVerified: false };
      unverifiedUser.comparePassword.mockResolvedValue(true);
      
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(unverifiedUser)
      });

      await expect(
        authService.loginUser('test@example.com', 'password123')
      ).rejects.toThrow('Please verify your email before logging in');
    });
  });

  describe('registerUser', () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: '+1234567890',
      role: 'customer'
    };

    it('should successfully register a new user', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      
      const mockCreatedUser = {
        ...userData,
        _id: 'user123',
        toObject: jest.fn().mockReturnValue({
          ...userData,
          _id: 'user123',
          password: 'hashed',
          verificationCode: '123456'
        })
      };
      
      (User.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(true);

      const result = await authService.registerUser(userData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('message');
      expect(result.user.password).toBeUndefined();
      expect(result.user.verificationCode).toBeUndefined();
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: userData.name,
          email: userData.email,
          verificationCode: expect.any(String)
        })
      );
    });

    it('should throw error for existing user', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({ email: userData.email });

      await expect(
        authService.registerUser(userData)
      ).rejects.toThrow('User with this email already exists');
    });

    it('should not fail if email sending fails', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      
      const mockCreatedUser = {
        ...userData,
        _id: 'user123',
        toObject: jest.fn().mockReturnValue({ ...userData, _id: 'user123' })
      };
      
      (User.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      (emailService.sendVerificationEmail as jest.Mock).mockRejectedValue(
        new Error('Email service unavailable')
      );

      const result = await authService.registerUser(userData);
      expect(result).toHaveProperty('user');
    });
  });

  describe('verifyEmail', () => {
    const mockUser = {
      _id: 'user123',
      email: 'test@example.com',
      isEmailVerified: false,
      verificationCode: '123456',
      verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000),
      verificationAttempts: 0,
      save: jest.fn()
    };

    it('should successfully verify email with correct code', async () => {
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });
      (emailService.sendWelcomeEmail as jest.Mock).mockResolvedValue(true);

      const result = await authService.verifyEmail('test@example.com', '123456');

      expect(result.message).toBe('Email verified successfully');
      expect(mockUser.isEmailVerified).toBe(true);
      expect(mockUser.verificationCode).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw error for already verified email', async () => {
      const verifiedUser = { ...mockUser, isEmailVerified: true };
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(verifiedUser)
      });

      await expect(
        authService.verifyEmail('test@example.com', '123456')
      ).rejects.toThrow('Email already verified');
    });

    it('should throw error for expired code', async () => {
      const expiredUser = {
        ...mockUser,
        verificationCodeExpires: new Date(Date.now() - 1000)
      };
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(expiredUser)
      });

      await expect(
        authService.verifyEmail('test@example.com', '123456')
      ).rejects.toThrow('Verification code expired');
    });

    it('should throw error for incorrect code', async () => {
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await expect(
        authService.verifyEmail('test@example.com', '999999')
      ).rejects.toThrow('Invalid verification code');
    });

    it('should enforce rate limiting after 3 attempts', async () => {
      const limitedUser = {
        ...mockUser,
        verificationAttempts: 3,
        verificationAttemptsResetAt: new Date(Date.now() + 60 * 60 * 1000)
      };
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(limitedUser)
      });

      await expect(
        authService.verifyEmail('test@example.com', '123456')
      ).rejects.toThrow('Too many attempts');
    });
  });

  describe('refreshAccessToken', () => {
    it('should successfully refresh access token', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        role: 'customer',
        refreshToken: 'hashed-refresh-token',
        refreshTokenExpires: new Date(Date.now() + 1000000)
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.refreshAccessToken('valid-refresh-token');

      expect(result).toHaveProperty('accessToken');
      expect(result.accessToken).toBe('mock-jwt-token');
    });

    it('should throw error for missing refresh token', async () => {
      await expect(
        authService.refreshAccessToken('')
      ).rejects.toThrow('Refresh token required');
    });

    it('should throw error for expired refresh token', async () => {
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await expect(
        authService.refreshAccessToken('expired-token')
      ).rejects.toThrow('Invalid or expired refresh token');
    });

    it('should throw error for invalid refresh token', async () => {
      const mockUser = {
        _id: 'user123',
        refreshToken: 'hashed-refresh-token',
        refreshTokenExpires: new Date(Date.now() + 1000000)
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.refreshAccessToken('wrong-token')
      ).rejects.toThrow('Invalid or expired refresh token');
    });
  });

  describe('requestPasswordReset', () => {
    it('should send password reset code to existing user', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        save: jest.fn()
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (emailService.sendPasswordResetEmail as jest.Mock).mockResolvedValue(true);

      const result = await authService.requestPasswordReset('test@example.com');

      expect(result.message).toContain('reset code sent');
      expect(mockUser.verificationCode).toBeDefined();
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw error for non-existent user', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.requestPasswordReset('nonexistent@example.com')
      ).rejects.toThrow('User not found');
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password with valid code', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        verificationCode: '123456',
        verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000),
        password: 'old-password',
        save: jest.fn()
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      const result = await authService.resetPassword(
        'test@example.com',
        '123456',
        'newPassword123'
      );

      expect(result.message).toBe('Password reset successfully');
      expect(mockUser.password).toBe('newPassword123');
      expect(mockUser.verificationCode).toBeUndefined();
      expect(mockUser.refreshToken).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw error for invalid reset code', async () => {
      const mockUser = {
        email: 'test@example.com',
        verificationCode: '123456',
        verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000)
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await expect(
        authService.resetPassword('test@example.com', '999999', 'newPassword')
      ).rejects.toThrow('Invalid reset code');
    });

    it('should throw error for expired reset code', async () => {
      const mockUser = {
        email: 'test@example.com',
        verificationCode: '123456',
        verificationCodeExpires: new Date(Date.now() - 1000)
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await expect(
        authService.resetPassword('test@example.com', '123456', 'newPassword')
      ).rejects.toThrow('Reset code expired');
    });
  });

  describe('logoutUser', () => {
    it('should clear refresh token on logout', async () => {
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

      const result = await authService.logoutUser('user123');

      expect(result.message).toBe('Logged out successfully');
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { $unset: { refreshToken: 1, refreshTokenExpires: 1 } }
      );
    });
  });

  describe('resendVerificationCode', () => {
    it('should resend verification code for unverified user', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        isEmailVerified: false,
        verificationAttempts: 0,
        save: jest.fn()
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });
      (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(true);

      const result = await authService.resendVerificationCode('test@example.com');

      expect(result.message).toContain('New verification code sent');
      expect(mockUser.verificationCode).toBeDefined();
      expect(mockUser.verificationCodeExpires).toBeDefined();
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw error for already verified email', async () => {
      const mockUser = {
        email: 'test@example.com',
        isEmailVerified: true
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await expect(
        authService.resendVerificationCode('test@example.com')
      ).rejects.toThrow('Email already verified');
    });

    it('should enforce rate limiting on resend attempts', async () => {
      const mockUser = {
        email: 'test@example.com',
        isEmailVerified: false,
        verificationAttempts: 3,
        verificationAttemptsResetAt: new Date(Date.now() + 60 * 60 * 1000)
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await expect(
        authService.resendVerificationCode('test@example.com')
      ).rejects.toThrow('Too many resend attempts');
    });
  });
});