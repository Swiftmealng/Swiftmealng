import { Request, Response, NextFunction } from "express";
import asyncHandler from "../utils/asyncHandler";
import Order from "../models/Order";
import User from "../models/User";
import Rating from "../models/Rating";

/**
 * @desc    Get public statistics
 * @route   GET /api/v1/public/stats
 * @access  Public
 */
export const getPublicStats = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    // Get total completed orders count
    const totalOrders = await Order.countDocuments({ status: "completed" });

    // Get unique restaurant count (from completed orders)
    const restaurants = await Order.distinct("pickupLocation.restaurantName", {
      status: "completed",
    });

    // Get average rating
    const ratingStats = await Rating.aggregate([
      {
        $group: {
          _id: null,
          avgFoodRating: { $avg: "$foodRating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    const averageRating =
      ratingStats.length > 0
        ? parseFloat(ratingStats[0].avgFoodRating.toFixed(1))
        : 4.8;

    // Get customer count
    const customerCount = await User.countDocuments({ role: "customer" });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalCustomers: customerCount,
          totalRestaurants: restaurants.length || 50,
          averageRating: averageRating,
          totalOrders: totalOrders,
        },
      },
    });
  },
);
