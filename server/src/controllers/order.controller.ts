import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import * as orderService from "../services/order.service";
import { AuthRequest } from "../middleware/auth.middleware";

/**
 * @desc    Create new order
 * @route   POST /api/v1/orders
 * @access  Private
 */
export const createOrder = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const order = await orderService.createOrder(req.body);

    res.status(201).json({
      success: true,
      data: { order },
    });
  },
);

/**
 * @desc    Get all orders
 * @route   GET /api/v1/orders
 * @access  Private
 */
export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const result = await orderService.getOrders(req.query);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * @desc    Get single order
 * @route   GET /api/v1/orders/:orderId
 * @access  Private
 */
export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const order = await orderService.getOrderById(orderId!);

  res.status(200).json({
    success: true,
    data: { order },
  });
});

/**
 * @desc    Update order status
 * @route   PATCH /api/v1/orders/:orderId/status
 * @access  Private
 */
export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { status, location } = req.body;

    const order = await orderService.updateOrderStatus(
      orderId!,
      status,
      location,
    );

    res.status(200).json({
      success: true,
      data: { order },
    });
  },
);
