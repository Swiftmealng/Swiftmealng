import Order from "../models/Order";
import DelayAnalytics from "../models/DelayAnalytics";
import Logger from "./logger";
import { sendDelayAlertSMS } from "../services/sms.service";
import {
  emitDelayAlert,
  emitDashboardDelayAlert,
} from "../config/socket/socket";

/**
 * Check if an order is delayed and trigger alerts
 */
export const checkAndHandleDelay = async (orderId: string): Promise<void> => {
  try {
    const order = await Order.findById(orderId);

    if (!order) {
      Logger.error("Order not found for delay check", { orderId });
      return;
    }

    // Skip if order is already delivered or cancelled
    if (order.status === "delivered" || order.status === "cancelled") {
      return;
    }

    const now = new Date();
    const estimatedTime = new Date(order.estimatedDeliveryTime);
    const delayMinutes = Math.floor(
      (now.getTime() - estimatedTime.getTime()) / (1000 * 60),
    );

    // Check if delay exceeds threshold (10 minutes as per TDD)
    if (delayMinutes >= 10 && !order.isDelayed) {
      // Mark order as delayed
      order.isDelayed = true;
      order.delayMinutes = delayMinutes;
      order.delayReason = "Exceeded estimated delivery time";
      await order.save();

      Logger.warn("Order marked as delayed", {
        orderId: String(order._id),
        orderNumber: order.orderNumber,
        delayMinutes,
      });

      // Create delay analytics record
      await DelayAnalytics.create({
        orderId: order._id,
        orderNumber: order.orderNumber,
        area: order.deliveryAddress.area,
        delayMinutes,
        reason: order.delayReason,
        estimatedDeliveryTime: order.estimatedDeliveryTime,
        actualStartTime: now,
        riderId: order.riderId,
        location: {
          type: "Point",
          coordinates: order.deliveryAddress.coordinates,
        },
      });

      // Send SMS alert to customer
      if (order.customerPhone) {
        await sendDelayAlertSMS(
          order.customerPhone,
          order.orderNumber,
          delayMinutes,
          order.delayReason,
          String(order._id),
        );
      }

      // Emit real-time alerts
      emitDelayAlert(order.orderNumber, {
        delayMinutes,
        reason: order.delayReason,
      });

      emitDashboardDelayAlert(String(order._id), delayMinutes);

      Logger.info("Delay alerts sent", {
        orderId: String(order._id),
        orderNumber: order.orderNumber,
        delayMinutes,
      });
    } else if (delayMinutes >= 10 && order.isDelayed) {
      // Update delay minutes if already marked as delayed
      order.delayMinutes = delayMinutes;
      await order.save();

      // Update analytics
      await DelayAnalytics.findOneAndUpdate(
        { orderId: order._id },
        { delayMinutes },
        { new: true },
      );
    }
  } catch (error: any) {
    Logger.error("Error in delay detection", { orderId, error: error.message });
  }
};

/**
 * Check delays for orders approaching estimated delivery time
 * This runs periodically as a backup safety net (every 5 minutes)
 * Primary delay detection happens event-based in order status updates
 */

export const startDelayMonitoringBackup = (): void => {
  setInterval(
    async () => {
      try {
        // Only check orders that are:
        // 1. Active (not delivered/cancelled)
        // 2. Past estimated delivery time
        const ordersNearDeadline = await Order.find({
          status: {
            $in: ["confirmed", "preparing", "ready", "out_for_delivery"],
          },
          estimatedDeliveryTime: { $lte: new Date() },
          isDelayed: false, // Only check orders not yet marked as delayed
        }).select("_id");

        if (ordersNearDeadline.length > 0) {
          Logger.info("Running backup delay check", {
            orderCount: ordersNearDeadline.length,
          });

          for (const order of ordersNearDeadline) {
            await checkAndHandleDelay(String(order._id));
          }
        }
      } catch (error: any) {
        Logger.error("Error in backup delay monitoring", {
          error: error.message,
        });
      }
    },
    5 * 60 * 1000,
  ); // Every 5 minutes (backup only)

  Logger.info(
    "Backup delay monitoring started - checking every 5 minutes for orders past deadline",
  );
};
