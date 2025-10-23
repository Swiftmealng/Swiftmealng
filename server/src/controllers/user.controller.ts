import { Request, Response } from "express";
import User from "../models/User";
import { uploadToCloudinary } from "../config/cloudinary/cloudinary";
import AppError from "../utils/AppError";
import asyncHandler from "../utils/asyncHandler";

/**
 * @desc    Get user profile
 * @route   GET /api/v1/users/:userId
 * @access  Private
 */
export const getUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const requestingUserId = (req as any).user.id;

    // Verify user owns the resource or is admin
    if (userId !== requestingUserId && (req as any).user.role !== 'admin') {
      throw new AppError("You are not authorized to view this profile", 403);
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  }
);

/**
 * @desc    Update user profile
 * @route   PATCH /api/v1/users/:userId
 * @access  Private
 */
export const updateUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const requestingUserId = (req as any).user.id;
    const { name, phone, email, password, role } = req.body;

    // Verify user owns the resource or is admin
    if (userId !== requestingUserId && (req as any).user.role !== 'admin') {
      throw new AppError("You are not authorized to update this profile", 403);
    }

    // Explicitly reject protected fields
    if (email || password || role) {
      throw new AppError("Cannot update email, password, or role through this endpoint", 400);
    }

    // Only allow updating name and phone
    const updateData: any = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  }
);

/**
 * @desc    Change user password
 * @route   PATCH /api/v1/users/:userId/password
 * @access  Private
 */
export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const requestingUserId = (req as any).user.id;
    const { currentPassword, newPassword } = req.body;

    // Verify user owns the resource (admins cannot change other users' passwords)
    if (userId !== requestingUserId) {
      throw new AppError("You can only change your own password", 403);
    }

    if (!currentPassword || !newPassword) {
      throw new AppError(
        "Current password and new password are required",
        400
      );
    }

    if (newPassword.length < 8) {
      throw new AppError("New password must be at least 8 characters", 400);
    }

    const user = await User.findById(userId).select("+password");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError("Current password is incorrect", 401);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  }
);

/**
 * @desc    Upload user photo
 * @route   POST /api/v1/users/:userId/photo
 * @access  Private
 */
export const uploadUserPhoto = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const requestingUserId = (req as any).user.id;

    // Verify user owns the resource or is admin
    if (userId !== requestingUserId && (req as any).user.role !== 'admin') {
      throw new AppError("You are not authorized to upload photo for this user", 403);
    }

    if (!req.file) {
      throw new AppError("Please upload a photo", 400);
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (req.file.size > maxSize) {
      throw new AppError("File size must be less than 5MB", 400);
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      throw new AppError("Only JPEG, PNG, GIF, and WebP images are allowed", 400);
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      { folder: `users/${userId}` }
    );

    const photoUrl = result.url;

    // Update user with photo URL
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { photoUrl },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      success: true,
      data: {
        photoUrl,
        user: updatedUser,
      },
    });
  }
);
