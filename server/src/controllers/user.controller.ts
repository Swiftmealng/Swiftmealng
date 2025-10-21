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
    const { name, phone } = req.body;

    // Don't allow updating email, password, or role through this endpoint
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
    const { currentPassword, newPassword } = req.body;

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

    if (!req.file) {
      throw new AppError("Please upload a photo", 400);
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      { folder: `users/${userId}` }
    );

    // Note: User model doesn't have photoUrl field yet
    // You may need to add it to the User model schema
    // For now, just return the URL
    const photoUrl = result.url;

    res.status(200).json({
      success: true,
      data: {
        photoUrl,
        user: {
          ...user.toObject(),
          photoUrl, // Add dynamically for response
        },
      },
    });
  }
);
