jest.mock("../../utils/asyncHandler", () => ({ __esModule: true, default: (fn: any) => fn }));
import { Request, Response } from "express";
import * as userController from "../../controllers/user.controller";
import User from "../../models/User";
import AppError from "../../utils/AppError";
import { uploadToCloudinary } from "../../config/cloudinary/cloudinary";

jest.mock("../../models/User");
jest.mock("../../config/cloudinary/cloudinary");

describe("User Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      user: { _id: "user123" },
      body: {},
      params: {},
      file: undefined,
    } as any;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe("getUserProfile", () => {
    it("should return user profile successfully", async () => {
      mockRequest.params = { userId: "user123" };

      const mockUser = {
        _id: "user123",
        name: "John Doe",
        email: "john@test.com",
        role: "customer",
        phone: "1234567890",
      };

      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      (User.findById as jest.Mock) = jest.fn().mockReturnValue({
        select: mockSelect,
      });

      await userController.getUserProfile(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(mockSelect).toHaveBeenCalledWith("-password");
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { user: mockUser },
      });
    });

    it("should throw error if user not found", async () => {
      mockRequest.params = { userId: "nonexistent" };

      const mockSelect = jest.fn().mockResolvedValue(null);
      (User.findById as jest.Mock) = jest.fn().mockReturnValue({
        select: mockSelect,
      });

      await expect(
        userController.getUserProfile(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toMatchObject({
        message: "User not found",
        statusCode: 404,
      });
    });

    it("should handle database errors", async () => {
      mockRequest.params = { userId: "user123" };

      const mockSelect = jest.fn().mockRejectedValue(new Error("Database error"));
      (User.findById as jest.Mock) = jest.fn().mockReturnValue({
        select: mockSelect,
      });

      await expect(
        userController.getUserProfile(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toThrow("Database error");
    });
  });

  describe("updateUserProfile", () => {
    it("should update user profile successfully", async () => {
      mockRequest.params = { userId: "user123" };
      mockRequest.body = {
        name: "Jane Doe",
        phone: "9876543210",
      };

      const mockUser = {
        _id: "user123",
        name: "Jane Doe",
        email: "jane@test.com",
        phone: "9876543210",
      };

      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      (User.findByIdAndUpdate as jest.Mock) = jest.fn().mockReturnValue({
        select: mockSelect,
      });

      await userController.updateUserProfile(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        "user123",
        { name: "Jane Doe", phone: "9876543210" },
        { new: true, runValidators: true }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { user: mockUser },
      });
    });

    it("should update only name", async () => {
      mockRequest.params = { userId: "user123" };
      mockRequest.body = {
        name: "Jane Doe",
      };

      const mockUser = {
        _id: "user123",
        name: "Jane Doe",
      };

      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      (User.findByIdAndUpdate as jest.Mock) = jest.fn().mockReturnValue({
        select: mockSelect,
      });

      await userController.updateUserProfile(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        "user123",
        { name: "Jane Doe" },
        { new: true, runValidators: true }
      );
    });

    it("should update only phone", async () => {
      mockRequest.params = { userId: "user123" };
      mockRequest.body = {
        phone: "9876543210",
      };

      const mockUser = {
        _id: "user123",
        phone: "9876543210",
      };

      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      (User.findByIdAndUpdate as jest.Mock) = jest.fn().mockReturnValue({
        select: mockSelect,
      });

      await userController.updateUserProfile(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        "user123",
        { phone: "9876543210" },
        { new: true, runValidators: true }
      );
    });

    it("should not update email, password, or role", async () => {
      mockRequest.params = { userId: "user123" };
      mockRequest.body = {
        name: "Jane Doe",
        email: "newemail@test.com",
        password: "newpassword",
        role: "admin",
      };

      const mockUser = {
        _id: "user123",
        name: "Jane Doe",
      };

      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      (User.findByIdAndUpdate as jest.Mock) = jest.fn().mockReturnValue({
        select: mockSelect,
      });

      await userController.updateUserProfile(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Should only update name, not email, password, or role
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        "user123",
        { name: "Jane Doe" },
        { new: true, runValidators: true }
      );
    });

    it("should throw error if user not found", async () => {
      mockRequest.params = { userId: "nonexistent" };
      mockRequest.body = { name: "Jane Doe" };

      const mockSelect = jest.fn().mockResolvedValue(null);
      (User.findByIdAndUpdate as jest.Mock) = jest.fn().mockReturnValue({
        select: mockSelect,
      });

      await expect(
        userController.updateUserProfile(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toMatchObject({
        message: "User not found",
        statusCode: 404,
      });
    });
  });

  describe("changePassword", () => {
    it("should change password successfully", async () => {
      mockRequest.params = { userId: "user123" };
      mockRequest.body = {
        currentPassword: "oldPassword123",
        newPassword: "newPassword456",
      };

      const mockUser = {
        _id: "user123",
        password: "hashedOldPassword",
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
      };

      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      (User.findById as jest.Mock) = jest.fn().mockReturnValue({
        select: mockSelect,
      });

      await userController.changePassword(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(mockSelect).toHaveBeenCalledWith("+password");
      expect(mockUser.comparePassword).toHaveBeenCalledWith("oldPassword123");
      expect(mockUser.password).toBe("newPassword456");
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Password updated successfully",
      });
    });

    it("should throw error if currentPassword is missing", async () => {
      mockRequest.params = { userId: "user123" };
      mockRequest.body = {
        newPassword: "newPassword456",
      };

      await expect(
        userController.changePassword(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toMatchObject({
        message: "Current password and new password are required",
        statusCode: 400,
      });
    });

    it("should throw error if newPassword is missing", async () => {
      mockRequest.params = { userId: "user123" };
      mockRequest.body = {
        currentPassword: "oldPassword123",
      };

      await expect(
        userController.changePassword(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toMatchObject({
        message: "Current password and new password are required",
        statusCode: 400,
      });
    });

    it("should throw error if newPassword is too short", async () => {
      mockRequest.params = { userId: "user123" };
      mockRequest.body = {
        currentPassword: "oldPassword123",
        newPassword: "short",
      };

      await expect(
        userController.changePassword(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toMatchObject({
        message: "New password must be at least 8 characters",
        statusCode: 400,
      });
    });

    it("should throw error if user not found", async () => {
      mockRequest.params = { userId: "nonexistent" };
      mockRequest.body = {
        currentPassword: "oldPassword123",
        newPassword: "newPassword456",
      };

      const mockSelect = jest.fn().mockResolvedValue(null);
      (User.findById as jest.Mock) = jest.fn().mockReturnValue({
        select: mockSelect,
      });

      await expect(
        userController.changePassword(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toMatchObject({
        message: "User not found",
        statusCode: 404,
      });
    });

    it("should throw error if current password is incorrect", async () => {
      mockRequest.params = { userId: "user123" };
      mockRequest.body = {
        currentPassword: "wrongPassword",
        newPassword: "newPassword456",
      };

      const mockUser = {
        _id: "user123",
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      (User.findById as jest.Mock) = jest.fn().mockReturnValue({
        select: mockSelect,
      });

      await expect(
        userController.changePassword(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toMatchObject({
        message: "Current password is incorrect",
        statusCode: 401,
      });
    });
  });

  describe("uploadUserPhoto", () => {
    it("should upload user photo successfully", async () => {
      mockRequest.params = { userId: "user123" };
      mockRequest.file = {
        buffer: Buffer.from("fake image data"),
        mimetype: "image/jpeg",
      } as any;

      const mockUser = {
        _id: "user123",
        name: "John Doe",
        toObject: jest.fn().mockReturnValue({
          _id: "user123",
          name: "John Doe",
        }),
      };

      const mockCloudinaryResult = {
        url: "https://cloudinary.com/photo123.jpg",
        public_id: "users/user123/photo123",
      };

      (User.findById as jest.Mock) = jest.fn().mockResolvedValue(mockUser);
      jest.mocked(uploadToCloudinary).mockResolvedValue(mockCloudinaryResult);

      await userController.uploadUserPhoto(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(uploadToCloudinary).toHaveBeenCalledWith(
        mockRequest.file.buffer,
        { folder: "users/user123" }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          photoUrl: "https://cloudinary.com/photo123.jpg",
          user: expect.objectContaining({
            _id: "user123",
            photoUrl: "https://cloudinary.com/photo123.jpg",
          }),
        },
      });
    });

    it("should throw error if no file uploaded", async () => {
      mockRequest.params = { userId: "user123" };
      mockRequest.file = undefined;

      await expect(
        userController.uploadUserPhoto(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toMatchObject({
        message: "Please upload a photo",
        statusCode: 400,
      });
    });

    it("should throw error if user not found", async () => {
      mockRequest.params = { userId: "nonexistent" };
      mockRequest.file = {
        buffer: Buffer.from("fake image data"),
      } as any;

      (User.findById as jest.Mock) = jest.fn().mockResolvedValue(null);

      await expect(
        userController.uploadUserPhoto(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toMatchObject({
        message: "User not found",
        statusCode: 404,
      });
    });

    it("should handle cloudinary upload errors", async () => {
      mockRequest.params = { userId: "user123" };
      mockRequest.file = {
        buffer: Buffer.from("fake image data"),
      } as any;

      const mockUser = {
        _id: "user123",
        name: "John Doe",
      };

      (User.findById as jest.Mock) = jest.fn().mockResolvedValue(mockUser);
      jest.mocked(uploadToCloudinary).mockRejectedValue(
        new Error("Cloudinary upload failed")
      );

      await expect(
        userController.uploadUserPhoto(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toThrow("Cloudinary upload failed");
    });
  });
});