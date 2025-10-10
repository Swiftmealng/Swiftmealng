import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import Logger from "../../utils/logger";

let io: Server;

/**
 * Initialize Socket.io server
 */
export const initializeSocket = (httpServer: HTTPServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  // Tracking namespace for customer order tracking
  const trackingNamespace = io.of("/tracking");
  trackingNamespace.on("connection", (socket: Socket) => {
    Logger.info("Client connected to tracking namespace", {
      socketId: socket.id,
    });

    // Join a specific order room
    socket.on("join-tracking", (data: { orderNumber: string }) => {
      const { orderNumber } = data;
      socket.join(orderNumber);
      Logger.info("Client joined order tracking", {
        orderNumber,
        socketId: socket.id,
      });
    });

    // Leave order room
    socket.on("leave-tracking", (data: { orderNumber: string }) => {
      const { orderNumber } = data;
      socket.leave(orderNumber);
      Logger.info("Client left order tracking", {
        orderNumber,
        socketId: socket.id,
      });
    });

    socket.on("disconnect", () => {
      Logger.info("Client disconnected from tracking namespace", {
        socketId: socket.id,
      });
    });
  });

  // Dashboard namespace for support/operations
  const dashboardNamespace = io.of("/dashboard");
  dashboardNamespace.on("connection", (socket: Socket) => {
    Logger.info("Client connected to dashboard namespace", {
      socketId: socket.id,
    });

    // Join dashboard room
    socket.on("join-dashboard", (data: { userId: string }) => {
      const { userId } = data;
      socket.join("dashboard");
      Logger.info("Client joined dashboard", { userId, socketId: socket.id });
    });

    socket.on("disconnect", () => {
      Logger.info("Client disconnected from dashboard namespace", {
        socketId: socket.id,
      });
    });
  });

  Logger.info("Socket.io initialized with namespaces: /tracking, /dashboard");
  return io;
};

/**
 * Get Socket.io instance
 */
export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initializeSocket first.");
  }
  return io;
};

/**
 * Emit location update to tracking clients
 */
export const emitLocationUpdate = (
  orderNumber: string,
  data: { lat: number; lng: number; timestamp: Date },
) => {
  const trackingNamespace = io.of("/tracking");
  trackingNamespace.to(orderNumber).emit("location-update", data);
  Logger.info("Location update emitted", { orderNumber, data });
};

/**
 * Emit status update to tracking clients
 */
export const emitStatusUpdate = (
  orderNumber: string,
  data: { status: string; timestamp: Date },
) => {
  const trackingNamespace = io.of("/tracking");
  trackingNamespace.to(orderNumber).emit("status-update", data);
  Logger.info("Status update emitted", { orderNumber, data });
};

/**
 * Emit delay alert to tracking clients
 */
export const emitDelayAlert = (
  orderNumber: string,
  data: { delayMinutes: number; reason?: string },
) => {
  const trackingNamespace = io.of("/tracking");
  trackingNamespace.to(orderNumber).emit("delay-alert", data);
  Logger.info("Delay alert emitted", { orderNumber, data });
};

/**
 * Emit order update to dashboard
 */
export const emitOrderUpdate = (order: any) => {
  const dashboardNamespace = io.of("/dashboard");
  dashboardNamespace.to("dashboard").emit("order-update", { order });
  Logger.info("Order update emitted to dashboard", { orderId: order._id });
};

/**
 * Emit new order to dashboard
 */
export const emitNewOrder = (order: any) => {
  const dashboardNamespace = io.of("/dashboard");
  dashboardNamespace.to("dashboard").emit("new-order", { order });
  Logger.info("New order emitted to dashboard", { orderId: order._id });
};

/**
 * Emit delay alert to dashboard
 */
export const emitDashboardDelayAlert = (
  orderId: string,
  delayMinutes: number,
) => {
  const dashboardNamespace = io.of("/dashboard");
  dashboardNamespace
    .to("dashboard")
    .emit("delay-alert", { orderId, delayMinutes });
  Logger.info("Delay alert emitted to dashboard", { orderId, delayMinutes });
};
