import * as authService from '../../services/auth.service';
import User from '../../models/User';
import { AuthenticationError } from '../../utils/AppError';
import { generateToken } from '../../utils/generateToken';
import * as emailService from '../../services/email.service';
import bcrypt from 'bcryptjs';

jest.mock('../../models/User');
jest.mock('../../utils/generateToken');
jest.mock('../../services/email.service');
jest.mock('bcryptjs');

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
      
      // Statistically very unlikely to generate duplicates
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
      
      expect(token1).not.toEqual(token2);
    });
  });

  describe('loginUser', () => {
    it('should successfully login user with valid credentials', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'customer',
        isEmailVerified: true,
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn(),
        toObject: jest.fn().mockReturnValue({
          _id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'customer',
        }),
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      (generateToken as jest.Mock).mockReturnValue('access-token');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-refresh-token');

      const result = await authService.loginUser(
        'test@example.com',
        'password123',
        false
      );

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
      expect(generateToken).toHaveBeenCalledWith(
        {
          id: 'user123',
          email: 'test@example.com',
          role: 'customer',
        },
        '15m'
      );
      expect(result).toEqual({
        user: expect.objectContaining({
          email: 'test@example.com',
        }),
        accessToken: 'access-token',
        refreshToken: expect.any(String),
      });
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).not.toHaveProperty('refreshToken');
    });

    it('should use 7d token expiry when rememberMe is true', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        role: 'customer',
        isEmailVerified: true,
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn(),
        toObject: jest.fn().mockReturnValue({
          _id: 'user123',
          email: 'test@example.com',
        }),
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      (generateToken as jest.Mock).mockReturnValue('access-token');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

      await authService.loginUser('test@example.com', 'password', true);

      expect(generateToken).toHaveBeenCalledWith(
        expect.any(Object),
        '7d'
      );
    });

    it('should throw error for non-existent user', async () => {
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(
        authService.loginUser('nonexistent@example.com', 'password', false)
      ).rejects.toThrow(AuthenticationError);
      await expect(
        authService.loginUser('nonexistent@example.com', 'password', false)
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw error for incorrect password', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await expect(
        authService.loginUser('test@example.com', 'wrongpassword', false)
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw error for unverified email', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        isEmailVerified: false,
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await expect(
        authService.loginUser('test@example.com', 'password', false)
      ).rejects.toThrow('Please verify your email before logging in');
    });

    it('should save refresh token and expiry to user', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        isEmailVerified: true,
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn(),
        toObject: jest.fn().mockReturnValue({ _id: 'user123' }),
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      (generateToken as jest.Mock).mockReturnValue('token');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-token');

      await authService.loginUser('test@example.com', 'password', false);

      expect(mockUser.refreshToken).toBeDefined();
      expect(mockUser.refreshTokenExpires).toBeDefined();
      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe('registerUser', () => {
    it('should successfully register a new user', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const mockUser = {
        _id: 'newuser123',
        name: 'New User',
        email: 'newuser@example.com',
        role: 'customer',
        toObject: jest.fn().mockReturnValue({
          _id: 'newuser123',
          name: 'New User',
          email: 'newuser@example.com',
          role: 'customer',
        }),
      };

      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(true);

      const result = await authService.registerUser({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        phone: '+1234567890',
        role: 'customer',
      });

      expect(User.findOne).toHaveBeenCalledWith({ email: 'newuser@example.com' });
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New User',
          email: 'newuser@example.com',
          verificationCode: expect.any(String),
          verificationCodeExpires: expect.any(Date),
        })
      );
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).not.toHaveProperty('verificationCode');
      expect(result.message).toBe('Verification code sent to your email');
    });

    it('should throw error for existing user', async () => {
      const existingUser = { email: 'existing@example.com' };
      (User.findOne as jest.Mock).mockResolvedValue(existingUser);

      await expect(
        authService.registerUser({
          name: 'User',
          email: 'existing@example.com',
          password: 'password',
        })
      ).rejects.toThrow('User with this email already exists');
    });

    it('should handle email sending failure gracefully', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const mockUser = {
        toObject: jest.fn().mockReturnValue({ _id: 'user123' }),
      };

      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (emailService.sendVerificationEmail as jest.Mock).mockRejectedValue(
        new Error('Email service down')
      );

      // Should not throw error even if email fails
      const result = await authService.registerUser({
        name: 'User',
        email: 'user@example.com',
        password: 'password',
      });

      expect(result).toBeDefined();
    });
  });

  describe('verifyEmail', () => {
    it('should successfully verify email with correct code', async () => {
      const futureDate = new Date(Date.now() + 10 * 60 * 1000);
      const mockUser = {
        email: 'test@example.com',
        isEmailVerified: false,
        verificationCode: '123456',
        verificationCodeExpires: futureDate,
        verificationAttempts: 0,
        save: jest.fn(),
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      (emailService.sendWelcomeEmail as jest.Mock).mockResolvedValue(true);

      const result = await authService.verifyEmail('test@example.com', '123456');

      expect(mockUser.isEmailVerified).toBe(true);
      expect(mockUser.verificationCode).toBeUndefined();
      expect(mockUser.verificationCodeExpires).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalled();
      expect(result.message).toBe('Email verified successfully');
    });

    it('should throw error for already verified email', async () => {
      const mockUser = {
        isEmailVerified: true,
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await expect(
        authService.verifyEmail('test@example.com', '123456')
      ).rejects.toThrow('Email already verified');
    });

    it('should throw error for expired code', async () => {
      const pastDate = new Date(Date.now() - 60 * 1000);
      const mockUser = {
        isEmailVerified: false,
        verificationCode: '123456',
        verificationCodeExpires: pastDate,
        verificationAttempts: 0,
        save: jest.fn(),
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await expect(
        authService.verifyEmail('test@example.com', '123456')
      ).rejects.toThrow('Verification code expired');
    });

    it('should throw error for incorrect code', async () => {
      const futureDate = new Date(Date.now() + 10 * 60 * 1000);
      const mockUser = {
        isEmailVerified: false,
        verificationCode: '123456',
        verificationCodeExpires: futureDate,
        verificationAttempts: 0,
        save: jest.fn(),
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await expect(
        authService.verifyEmail('test@example.com', '654321')
      ).rejects.toThrow('Invalid verification code');

      expect(mockUser.verificationAttempts).toBe(1);
    });

    it('should enforce rate limiting after 3 attempts', async () => {
      const futureResetTime = new Date(Date.now() + 30 * 60 * 1000);
      const mockUser = {
        isEmailVerified: false,
        verificationCode: '123456',
        verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000),
        verificationAttempts: 3,
        verificationAttemptsResetAt: futureResetTime,
        save: jest.fn(),
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await expect(
        authService.verifyEmail('test@example.com', '654321')
      ).rejects.toThrow('Too many attempts');
    });
  });

  describe('resendVerificationCode', () => {
    it('should successfully resend verification code', async () => {
      const mockUser = {
        email: 'test@example.com',
        isEmailVerified: false,
        verificationAttempts: 0,
        save: jest.fn(),
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(true);

      const result = await authService.resendVerificationCode('test@example.com');

      expect(mockUser.verificationCode).toBeDefined();
      expect(mockUser.verificationCodeExpires).toBeDefined();
      expect(mockUser.save).toHaveBeenCalled();
      expect(result.message).toBe('New verification code sent to your email');
    });

    it('should throw error for already verified email', async () => {
      const mockUser = {
        isEmailVerified: true,
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await expect(
        authService.resendVerificationCode('test@example.com')
      ).rejects.toThrow('Email already verified');
    });

    it('should enforce rate limiting', async () => {
      const futureResetTime = new Date(Date.now() + 30 * 60 * 1000);
      const mockUser = {
        isEmailVerified: false,
        verificationAttempts: 3,
        verificationAttemptsResetAt: futureResetTime,
        save: jest.fn(),
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await expect(
        authService.resendVerificationCode('test@example.com')
      ).rejects.toThrow('Too many resend attempts');
    });
  });

  describe('refreshAccessToken', () => {
    it('should successfully refresh access token', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        role: 'customer',
        refreshToken: 'hashed-token',
        refreshTokenExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (generateToken as jest.Mock).mockReturnValue('new-access-token');

      const result = await authService.refreshAccessToken('valid-refresh-token');

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'valid-refresh-token',
        'hashed-token'
      );
      expect(result.accessToken).toBe('new-access-token');
    });

    it('should throw error for invalid refresh token', async () => {
      const mockUser = {
        refreshToken: 'hashed-token',
        refreshTokenExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.refreshAccessToken('invalid-token')
      ).rejects.toThrow('Invalid or expired refresh token');
    });

    it('should throw error for missing refresh token', async () => {
      await expect(
        authService.refreshAccessToken('')
      ).rejects.toThrow('Refresh token required');
    });
  });

  describe('logoutUser', () => {
    it('should successfully logout user', async () => {
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

      const result = await authService.logoutUser('user123');

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith('user123', {
        $unset: { refreshToken: 1, refreshTokenExpires: 1 },
      });
      expect(result.message).toBe('Logged out successfully');
    });
  });

  describe('requestPasswordReset', () => {
    it('should send password reset code to user', async () => {
      const mockUser = {
        email: 'test@example.com',
        save: jest.fn(),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (emailService.sendPasswordResetEmail as jest.Mock).mockResolvedValue(true);

      const result = await authService.requestPasswordReset('test@example.com');

      expect(mockUser.verificationCode).toBeDefined();
      expect(mockUser.verificationCodeExpires).toBeDefined();
      expect(mockUser.save).toHaveBeenCalled();
      expect(result.message).toBe('Password reset code sent to your email');
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
        email: 'test@example.com',
        verificationCode: '123456',
        verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000),
        password: 'oldpassword',
        save: jest.fn(),
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await authService.resetPassword(
        'test@example.com',
        '123456',
        'newpassword123'
      );

      expect(mockUser.password).toBe('newpassword123');
      expect(mockUser.verificationCode).toBeUndefined();
      expect(mockUser.verificationCodeExpires).toBeUndefined();
      expect(mockUser.refreshToken).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalled();
      expect(result.message).toBe('Password reset successfully');
    });

    it('should throw error for expired reset code', async () => {
      const mockUser = {
        verificationCode: '123456',
        verificationCodeExpires: new Date(Date.now() - 60 * 1000),
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await expect(
        authService.resetPassword('test@example.com', '123456', 'newpass')
      ).rejects.toThrow('Reset code expired');
    });

    it('should throw error for invalid reset code', async () => {
      const mockUser = {
        verificationCode: '123456',
        verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000),
      };

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await expect(
        authService.resetPassword('test@example.com', '654321', 'newpass')
      ).rejects.toThrow('Invalid reset code');
    });
  });
});