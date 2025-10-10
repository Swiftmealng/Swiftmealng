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
      .select("-customer.customerId -__v");

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    res.status(200).json({
      success: true,
      data: {
        order: {
          orderNumber: order.orderNumber,
          status: order.status,
          estimatedDeliveryTime: order.estimatedDeliveryTime,
          actualDeliveryTime: order.actualDeliveryTime,
          isDelayed: order.isDelayed,
          delayMinutes: order.delayMinutes,
          tracking: order.trackingEvents,
          rider: order.riderId,
        },
      },
    });
  },
);
