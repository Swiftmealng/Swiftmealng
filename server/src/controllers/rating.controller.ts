import { Request, Response } from "express";
import Rating from "../models/Rating";
import Order from "../models/Order";
import Rider from "../models/Rider";
import AppError from "../utils/AppError";
import asyncHandler from "../utils/asyncHandler";

/**
 * @desc    Create order rating
 * @route   POST /api/v1/ratings
 * @access  Private
 */
export const createRating = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const {
      orderId,
      orderNumber,
      foodRating,
      deliveryRating,
      riderRating,
      review,
    } = req.body;

    if (!orderId || !orderNumber) {
      throw new AppError("Order ID and Order Number are required", 400);
    }

    if (!foodRating || !deliveryRating) {
      throw new AppError("Food and delivery ratings are required", 400);
    }

    // Validate ratings are integers between 1-5
    if (
      !Number.isInteger(foodRating) ||
      !Number.isInteger(deliveryRating) ||
      foodRating < 1 ||
      foodRating > 5 ||
      deliveryRating < 1 ||
      deliveryRating > 5
    ) {
      throw new AppError("Ratings must be integers between 1 and 5", 400);
    }

    if (riderRating && (!Number.isInteger(riderRating) || riderRating < 1 || riderRating > 5)) {
      throw new AppError("Rider rating must be an integer between 1 and 5", 400);
    }

    // Check if order exists and belongs to user
    const order = await Order.findOne({ _id: orderId, customerId: userId });

    if (!order) {
      throw new AppError("Order not found or unauthorized", 404);
    }

    // Check if order is completed
    if (order.status !== "delivered") {
      throw new AppError("Can only rate completed orders", 400);
    }

    // Check if already rated
    const existingRating = await Rating.findOne({ orderId });
    if (existingRating) {
      throw new AppError("Order already rated", 400);
    }

    // Create rating
    const rating = await Rating.create({
      orderId,
      orderNumber,
      userId,
      riderId: order.riderId,
      foodRating,
      deliveryRating,
      riderRating,
      review,
    });

    // Update rider's average rating if rider was rated using aggregation
    if (order.riderId && riderRating) {
      const result = await Rating.aggregate([
        { 
          $match: { 
            riderId: order.riderId, 
            riderRating: { $exists: true, $ne: null } 
          } 
        },
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$riderRating" }
          }
        }
      ]);

      if (result.length > 0) {
        const avgRating = parseFloat(result[0].avgRating.toFixed(1));
        await Rider.findByIdAndUpdate(order.riderId, { rating: avgRating });
      }
    }

    res.status(201).json({
      success: true,
      data: { rating },
    });
  }
);

/**
 * @desc    Get rating by order ID
 * @route   GET /api/v1/ratings/:orderId
 * @access  Private
 */
export const getRatingByOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    if (!orderId) {
      throw new AppError("Order ID is required", 400);
    }

    const rating = await Rating.findOne({ orderId });

    res.status(200).json({
      success: true,
      data: { rating },
    });
  }
);
