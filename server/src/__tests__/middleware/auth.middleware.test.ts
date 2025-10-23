import { Response, NextFunction } from 'express';
import { authenticate, restrictTo, AuthRequest } from '../../middleware/auth.middleware';
import { verifyToken } from '../../utils/generateToken';
import User from '../../models/User';
import { AuthenticationError } from '../../utils/AppError';

jest.mock('../../utils/generateToken');
jest.mock('../../models/User');

describe('Auth Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      cookies: {},
    };
    mockResponse = {};
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should authenticate user with valid Bearer token', async () => {
      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      const mockDecodedToken = {
        id: 'user123',
        email: 'test@example.com',
        role: 'customer',
      };

      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        role: 'customer',
      };

      (verifyToken as jest.Mock).mockReturnValue(mockDecodedToken);
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(verifyToken).toHaveBeenCalledWith('valid-token');
      expect(mockRequest.user).toEqual({
        id: 'user123',
        email: 'test@example.com',
        role: 'customer',
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should authenticate user with cookie token', async () => {
      mockRequest.cookies = {
        accessToken: 'cookie-token',
      };

      const mockDecodedToken = {
        id: 'user123',
        email: 'test@example.com',
        role: 'customer',
      };

      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        role: 'customer',
      };

      (verifyToken as jest.Mock).mockReturnValue(mockDecodedToken);
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(verifyToken).toHaveBeenCalledWith('cookie-token');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should throw error when no token provided', async () => {
      await expect(
        authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext)
      ).rejects.toThrow(AuthenticationError);

      await expect(
        authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext)
      ).rejects.toThrow('Not authorized. Please log in.');
    });

    it('should throw error for invalid token', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      (verifyToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(
        authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext)
      ).rejects.toThrow('Invalid token. Please log in again.');
    });

    it('should throw error when user no longer exists', async () => {
      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      (verifyToken as jest.Mock).mockReturnValue({ id: 'deleted-user' });
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(
        authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext)
      ).rejects.toThrow('User no longer exists');
    });
  });

  describe('restrictTo', () => {
    it('should allow access for authorized role', () => {
      mockRequest.user = {
        id: 'admin123',
        email: 'admin@example.com',
        role: 'admin',
      };

      const middleware = restrictTo('admin', 'operations');

      middleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access for unauthorized role', () => {
      mockRequest.user = {
        id: 'user123',
        email: 'user@example.com',
        role: 'customer',
      };

      const middleware = restrictTo('admin', 'operations');

      expect(() => {
        middleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);
      }).toThrow('You do not have permission to perform this action');
    });

    it('should throw error when user not authenticated', () => {
      mockRequest.user = undefined;

      const middleware = restrictTo('admin');

      expect(() => {
        middleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);
      }).toThrow('Not authorized');
    });
  });
});