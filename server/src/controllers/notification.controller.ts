import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import Order from "../models/Order";
import Notification from "../models/Notification";
import { NotFoundError } from "../utils/AppError";
import {
  sendDelayAlertSMS,
  sendStatusUpdateSMS,
  sendDeliveryConfirmationSMS,
} from "../services/sms.service";

/**
 * @desc    Send notification (internal trigger)
 * @route   POST /api/v1/notifications/send
 * @access  Private (Internal/Admin)
 */
export const sendNotification = asyncHandler(
  async (req: Request, res: Response) => {
    const { orderId, type, channel } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    let sent = false;

    // Currently only SMS channel is supported
    if (channel === "sms" && order.customerPhone) {
      switch (type) {
        case "delay_alert":
          sent = await sendDelayAlertSMS(
            order.customerPhone,
            order.orderNumber,
            order.delayMinutes || 0,
            order.delayReason || "Unexpected delay",
            String(order._id),
          );
          break;

        case "status_update":
          sent = await sendStatusUpdateSMS(
            order.customerPhone,
            order.orderNumber,
            order.status,
            String(order._id),
          );
          break;

        case "delivery_confirmation":
          sent = await sendDeliveryConfirmationSMS(
            order.customerPhone,
            order.orderNumber,
            String(order._id),
          );
          break;

        default:
          res.status(400).json({
            success: false,
            error: "Invalid notification type",
          });
          return;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        sent,
        orderId,
        type,
        channel,
      },
    });
  },
);

/**
 * @desc    Get user notifications
 * @route   GET /api/v1/notifications
 * @access  Private
 */
export const getNotifications = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { limit = 50, status } = req.query;

    // Get orders for this user
    const userOrders = await Order.find({ customerId: userId }).select("_id");
    const orderIds = userOrders.map((order) => order._id);

    const query: any = { orderId: { $in: orderIds } };
    if (status) {
      query.status = status;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: { notifications },
    });
  }
);

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/v1/notifications/:notificationId/read
 * @access  Private
 */
export const markNotificationAsRead = asyncHandler(
  async (req: Request, res: Response) => {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    // Update status to 'delivered' to mark as read
    notification.status = "delivered";
    notification.deliveredAt = new Date();
    await notification.save();

    res.status(200).json({
      success: true,
      data: { notification },
    });
  }
);

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/v1/notifications/read-all
 * @access  Private
 */
export const markAllNotificationsAsRead = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).user.id;

    // Get orders for this user
    const userOrders = await Order.find({ customerId: userId }).select("_id");
    const orderIds = userOrders.map((order) => order._id);

    // Update all unread notifications
    const result = await Notification.updateMany(
      { orderId: { $in: orderIds }, status: { $ne: "delivered" } },
      { status: "delivered", deliveredAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: { modifiedCount: result.modifiedCount },
    });
  }
);
