import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import Order from "../models/Order";
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
