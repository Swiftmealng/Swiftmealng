import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import Order from "../models/Order";
import { NotFoundError } from "../utils/AppError";

/**
 * @desc    Get order tracking by order number (public)
 * @route   GET /api/v1/track/:orderNumber
 * @access  Public
 */
export const getOrderTracking = asyncHandler(
  async (req: Request, res: Response) => {
    const { orderNumber } = req.params;

    const order = await Order.findOne({ orderNumber })
      .populate("riderId", "name phone photo currentLocation")
      .select("-__v");

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    res.status(200).json({
      success: true,
      data: {
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          status: order.status,
          items: order.items,
          totalAmount: order.totalAmount,
          deliveryAddress: order.deliveryAddress,
          restaurantAddress: order.restaurantAddress,
          estimatedDeliveryTime: order.estimatedDeliveryTime,
          actualDeliveryTime: order.actualDeliveryTime,
          isDelayed: order.isDelayed,
          delayMinutes: order.delayMinutes,
          delayReason: order.delayReason,
          trackingEvents: order.trackingEvents,
          riderId: order.riderId,
          riderName: order.riderName,
          riderPhone: order.riderPhone,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        },
      },
    });
  },
);