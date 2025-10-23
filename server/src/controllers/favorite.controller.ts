import { Request, Response } from "express";
import Favorite from "../models/Favorite";
import AppError from "../utils/AppError";
import asyncHandler from "../utils/asyncHandler";

/**
 * @desc    Get all user favorites
 * @route   GET /api/v1/favorites
 * @access  Private
 */
export const getFavorites = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    
    // Pagination support
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await Favorite.countDocuments({ userId });
    const favorites = await Favorite.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: favorites.length,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
      data: { favorites },
    });
  }
);

/**
 * @desc    Add meal to favorites
 * @route   POST /api/v1/favorites
 * @access  Private
 */
export const addFavorite = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { mealName, restaurantName, price, imageUrl, notes } = req.body;

    // Input validation
    if (!mealName || typeof mealName !== 'string' || mealName.trim().length === 0) {
      throw new AppError("Valid meal name is required", 400);
    }

    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      throw new AppError("Price must be a positive number", 400);
    }

    // Check if already exists
    const existing = await Favorite.findOne({ userId, mealName: mealName.trim() });
    if (existing) {
      throw new AppError("Meal already in favorites", 400);
    }

    const favorite = await Favorite.create({
      userId,
      mealName: mealName.trim(),
      restaurantName,
      price,
      imageUrl,
      notes,
    });

    res.status(201).json({
      success: true,
      data: { favorite },
    });
  }
);

/**
 * @desc    Remove favorite
 * @route   DELETE /api/v1/favorites/:favoriteId
 * @access  Private
 */
export const removeFavorite = asyncHandler(
  async (req: Request, res: Response) => {
    const { favoriteId } = req.params;
    const userId = (req as any).user.id;

    const favorite = await Favorite.findOneAndDelete({
      _id: favoriteId,
      userId, // Ensure user owns this favorite
    });

    if (!favorite) {
      throw new AppError("Favorite not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Favorite removed successfully",
    });
  }
);
