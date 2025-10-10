import Order from "../models/Order";
import { NotFoundError } from "../utils/AppError";
import mongoose from "mongoose";
import {
  sendOrderConfirmationSMS,
  sendStatusUpdateSMS,
  sendDeliveryConfirmationSMS,
} from "./sms.service";
import {
  emitNewOrder,
  emitOrderUpdate,
  emitStatusUpdate,
} from "../config/socket/socket";
import { checkAndHandleDelay } from "../utils/delayDetection";
import Logger from "../utils/logger";

export const createOrder = async (orderData: any) => {
  // Generate order number
  const orderNumber = `ORD-${Date.now()}`;

  // Calculate estimated delivery time (30 minutes from now)
  const estimatedDeliveryTime = new Date(Date.now() + 30 * 60 * 1000);

  // Calculate total amount
  const totalAmount = orderData.items.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity,
    0,
  );

  const order = await Order.create({
    ...orderData,
    orderNumber,
    estimatedDeliveryTime,
    totalAmount,
    trackingEvents: [
      {
        status: "placed",
        timestamp: new Date(),
        note: "Order placed successfully",
      },
    ],
  });

  // Send confirmation SMS to customer
  if (orderData.customerPhone) {
    await sendOrderConfirmationSMS(
      orderData.customerPhone,
      orderNumber,
      estimatedDeliveryTime,
      String(order._id),
    );
  }

  // Emit new order to dashboard
  emitNewOrder(order);

  Logger.info("Order created", { orderId: String(order._id), orderNumber });

  return order;
};

export const getOrders = async (query: any) => {
  const { status, area, isDelayed, page = 1, limit = 50 } = query;

  const filter: any = {};

  if (status) filter.status = status;
  if (area) filter["deliveryAddress.area"] = area;
  if (isDelayed !== undefined) filter.isDelayed = isDelayed === "true";

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const orders = await Order.find(filter)
    .populate("customerId", "name email")
    .populate("riderId", "name phone")
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Order.countDocuments(filter);

  return {
    orders,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

export const getOrderById = async (orderId: string) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new NotFoundError("Invalid order ID");
  }

  const order = await Order.findById(orderId)
    .populate("customerId", "name email phone")
    .populate("riderId", "name phone photo");

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  return order;
};

export const updateOrderStatus = async (
  orderId: string,
  status: string,
  location?: { lat: number; lng: number },
) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new NotFoundError("Invalid order ID");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  // Update status
  order.status = status as any;

  // Add tracking event
  order.trackingEvents.push({
    status,
    timestamp: new Date(),
    location: location ? { lat: location.lat, lng: location.lng } : undefined,
    note: `Order status updated to ${status}`,
  });

  // Set actual delivery time if delivered
  if (status === "delivered") {
    order.actualDeliveryTime = new Date();
  }

  await order.save();

  // Send SMS notification for status updates
  if (
    order.customerPhone &&
    ["preparing", "ready", "out_for_delivery"].includes(status)
  ) {
    await sendStatusUpdateSMS(
      order.customerPhone,
      order.orderNumber,
      status,
      String(order._id),
    );
  }

  // Send delivery confirmation SMS
  if (order.customerPhone && status === "delivered") {
    await sendDeliveryConfirmationSMS(
      order.customerPhone,
      order.orderNumber,
      String(order._id),
    );
  }

  // Emit real-time status update
  emitStatusUpdate(order.orderNumber, {
    status,
    timestamp: new Date(),
  });

  // Emit order update to dashboard
  emitOrderUpdate(order);

  // Check for delays after status update
  await checkAndHandleDelay(String(order._id));

  Logger.info("Order status updated", {
    orderId: String(order._id),
    orderNumber: order.orderNumber,
    status,
  });

  return order;
};
