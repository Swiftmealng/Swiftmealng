import { Request, Response } from 'express';
import * as userController from '../../controllers/user.controller';
import User from '../../models/User';
import AppError from '../../utils/AppError';
import { uploadToCloudinary } from '../../config/cloudinary/cloudinary';

jest.mock('../../models/User');
jest.mock('../../config/cloudinary/cloudinary');

describe('User Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      params: {},
      body: {},
      file: undefined,
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    (mockRequest as any).user = {
      id: 'user123',
      email: 'test@example.com',
      role: 'customer',
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('should get user profile for own account', async () => {
      mockRequest.params = { userId: 'user123' };

      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
      };

      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await userController.getUserProfile(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { user: mockUser },
      });
    });

    it('should allow admin to view other user profiles', async () => {
      (mockRequest as any).user.role = 'admin';
      mockRequest.params = { userId: 'other-user' };

      const mockUser = {
        _id: 'other-user',
        name: 'Other User',
      };

      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await userController.getUserProfile(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should reject non-admin viewing other user profiles', async () => {
      mockRequest.params = { userId: 'other-user' };

      await expect(
        userController.getUserProfile(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow('You are not authorized to view this profile');
    });

    it('should handle non-existent user', async () => {
      mockRequest.params = { userId: 'user123' };

      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(
        userController.getUserProfile(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow('User not found');
    });
  });

  describe('updateUserProfile', () => {
    it('should successfully update user profile', async () => {
      mockRequest.params = { userId: 'user123' };
      mockRequest.body = {
        name: 'Updated Name',
        phone: '+1234567890',
      };

      const mockUpdatedUser = {
        _id: 'user123',
        name: 'Updated Name',
        phone: '+1234567890',
      };

      (User.findByIdAndUpdate as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUpdatedUser),
      });

      await userController.updateUserProfile(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { name: 'Updated Name', phone: '+1234567890' },
        { new: true, runValidators: true }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should reject updating protected fields', async () => {
      mockRequest.params = { userId: 'user123' };
      mockRequest.body = {
        email: 'newemail@example.com',
        password: 'newpassword',
        role: 'admin',
      };

      await expect(
        userController.updateUserProfile(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow('Cannot update email, password, or role');
    });

    it('should reject unauthorized profile updates', async () => {
      mockRequest.params = { userId: 'other-user' };
      mockRequest.body = { name: 'Hacker' };

      await expect(
        userController.updateUserProfile(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow('You are not authorized to update this profile');
    });
  });

  describe('changePassword', () => {
    it('should successfully change password', async () => {
      mockRequest.params = { userId: 'user123' };
      mockRequest.body = {
        currentPassword: 'oldpassword123',
        newPassword: 'newpassword123',
      };

      const mockUser = {
        _id: 'user123',
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn(),
      };

      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await userController.changePassword(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockUser.comparePassword).toHaveBeenCalledWith('oldpassword123');
      expect(mockUser.password).toBe('newpassword123');
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should reject password change for other users', async () => {
      mockRequest.params = { userId: 'other-user' };
      mockRequest.body = {
        currentPassword: 'pass',
        newPassword: 'newpass',
      };

      await expect(
        userController.changePassword(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow('You can only change your own password');
    });

    it('should reject incorrect current password', async () => {
      mockRequest.params = { userId: 'user123' };
      mockRequest.body = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123',
      };

      const mockUser = {
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await expect(
        userController.changePassword(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow('Current password is incorrect');
    });

    it('should reject weak new password', async () => {
      mockRequest.params = { userId: 'user123' };
      mockRequest.body = {
        currentPassword: 'oldpass',
        newPassword: 'weak',
      };

      await expect(
        userController.changePassword(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow('New password must be at least 8 characters');
    });
  });

  describe('uploadUserPhoto', () => {
    it('should successfully upload user photo', async () => {
      mockRequest.params = { userId: 'user123' };
      mockRequest.file = {
        buffer: Buffer.from('fake-image-data'),
        mimetype: 'image/jpeg',
        size: 1024 * 1024, // 1MB
      } as Express.Multer.File;

      (uploadToCloudinary as jest.Mock).mockResolvedValue({
        url: 'https://cloudinary.com/photo.jpg',
      });

      const mockUpdatedUser = {
        _id: 'user123',
        photoUrl: 'https://cloudinary.com/photo.jpg',
      };

      (User.findByIdAndUpdate as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUpdatedUser),
      });

      await userController.uploadUserPhoto(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(uploadToCloudinary).toHaveBeenCalledWith(
        mockRequest.file.buffer,
        { folder: 'users/user123' }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should reject upload without file', async () => {
      mockRequest.params = { userId: 'user123' };
      mockRequest.file = undefined;

      await expect(
        userController.uploadUserPhoto(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow('Please upload a photo');
    });

    it('should reject oversized files', async () => {
      mockRequest.params = { userId: 'user123' };
      mockRequest.file = {
        buffer: Buffer.alloc(6 * 1024 * 1024), // 6MB
        mimetype: 'image/jpeg',
        size: 6 * 1024 * 1024,
      } as Express.Multer.File;

      await expect(
        userController.uploadUserPhoto(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow('File size must be less than 5MB');
    });

    it('should reject invalid file types', async () => {
      mockRequest.params = { userId: 'user123' };
      mockRequest.file = {
        buffer: Buffer.from('data'),
        mimetype: 'application/pdf',
        size: 1024,
      } as Express.Multer.File;

      await expect(
        userController.uploadUserPhoto(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow('Only JPEG, PNG, GIF, and WebP images are allowed');
    });
  });
});