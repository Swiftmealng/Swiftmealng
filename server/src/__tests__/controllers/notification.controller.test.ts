jest.mock("../../utils/asyncHandler", () => ({ __esModule: true, default: (fn: any) => fn }));
import { Request, Response } from "express";
import * as notificationController from "../../controllers/notification.controller";
import Order from "../../models/Order";
import Notification from "../../models/Notification";
import { NotFoundError } from "../../utils/AppError";
import * as smsService from "../../services/sms.service";

jest.mock("../../models/Order");
jest.mock("../../models/Notification");
jest.mock("../../services/sms.service");

describe("Notification Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      user: { _id: "user123" },
      body: {},
      query: {},
      params: {},
    } as any;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe("sendNotification", () => {
    it("should send delay alert SMS successfully", async () => {
      mockRequest.body = {
        orderId: "order123",
        type: "delay_alert",
        channel: "sms",
      };

      const mockOrder = {
        _id: "order123",
        orderNumber: "ORD-001",
        customerPhone: "+2348012345678",
        delayMinutes: 15,
        delayReason: "Traffic delay",
        status: "out_for_delivery",
      };

      (Order.findById as jest.Mock) = jest.fn().mockResolvedValue(mockOrder);
      (smsService.sendDelayAlertSMS as jest.Mock) = jest.fn().mockResolvedValue(true);

      await notificationController.sendNotification(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(Order.findById).toHaveBeenCalledWith("order123");
      expect(smsService.sendDelayAlertSMS).toHaveBeenCalledWith(
        "+2348012345678",
        "ORD-001",
        15,
        "Traffic delay",
        "order123"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          sent: true,
          orderId: "order123",
          type: "delay_alert",
          channel: "sms",
        },
      });
    });

    it("should send status update SMS successfully", async () => {
      mockRequest.body = {
        orderId: "order123",
        type: "status_update",
        channel: "sms",
      };

      const mockOrder = {
        _id: "order123",
        orderNumber: "ORD-001",
        customerPhone: "+2348012345678",
        status: "out_for_delivery",
      };

      (Order.findById as jest.Mock) = jest.fn().mockResolvedValue(mockOrder);
      (smsService.sendStatusUpdateSMS as jest.Mock) = jest.fn().mockResolvedValue(true);

      await notificationController.sendNotification(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(smsService.sendStatusUpdateSMS).toHaveBeenCalledWith(
        "+2348012345678",
        "ORD-001",
        "out_for_delivery",
        "order123"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it("should send delivery confirmation SMS successfully", async () => {
      mockRequest.body = {
        orderId: "order123",
        type: "delivery_confirmation",
        channel: "sms",
      };

      const mockOrder = {
        _id: "order123",
        orderNumber: "ORD-001",
        customerPhone: "+2348012345678",
        status: "delivered",
      };

      (Order.findById as jest.Mock) = jest.fn().mockResolvedValue(mockOrder);
      (smsService.sendDeliveryConfirmationSMS as jest.Mock) = jest.fn().mockResolvedValue(true);

      await notificationController.sendNotification(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(smsService.sendDeliveryConfirmationSMS).toHaveBeenCalledWith(
        "+2348012345678",
        "ORD-001",
        "order123"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it("should throw error if order not found", async () => {
      mockRequest.body = {
        orderId: "nonexistent",
        type: "status_update",
        channel: "sms",
      };

      (Order.findById as jest.Mock) = jest.fn().mockResolvedValue(null);

      await expect(
        notificationController.sendNotification(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toThrow(NotFoundError);
    });

    it("should return 400 for invalid notification type", async () => {
      mockRequest.body = {
        orderId: "order123",
        type: "invalid_type",
        channel: "sms",
      };

      const mockOrder = {
        _id: "order123",
        orderNumber: "ORD-001",
        customerPhone: "+2348012345678",
      };

      (Order.findById as jest.Mock) = jest.fn().mockResolvedValue(mockOrder);

      await notificationController.sendNotification(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: "Invalid notification type",
      });
    });

    it("should handle SMS send failure", async () => {
      mockRequest.body = {
        orderId: "order123",
        type: "status_update",
        channel: "sms",
      };

      const mockOrder = {
        _id: "order123",
        orderNumber: "ORD-001",
        customerPhone: "+2348012345678",
        status: "out_for_delivery",
      };

      (Order.findById as jest.Mock) = jest.fn().mockResolvedValue(mockOrder);
      (smsService.sendStatusUpdateSMS as jest.Mock) = jest.fn().mockResolvedValue(false);

      await notificationController.sendNotification(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            sent: false,
          }),
        })
      );
    });

    it("should handle order without phone number", async () => {
      mockRequest.body = {
        orderId: "order123",
        type: "status_update",
        channel: "sms",
      };

      const mockOrder = {
        _id: "order123",
        orderNumber: "ORD-001",
        customerPhone: null,
        status: "out_for_delivery",
      };

      (Order.findById as jest.Mock) = jest.fn().mockResolvedValue(mockOrder);

      await notificationController.sendNotification(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(smsService.sendStatusUpdateSMS).not.toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            sent: false,
          }),
        })
      );
    });
  });

  describe("getNotifications", () => {
    it("should return user notifications successfully", async () => {
      mockRequest.query = {};

      const mockOrders = [
        { _id: "order1" },
        { _id: "order2" },
      ];

      const mockNotifications = [
        {
          _id: "notif1",
          orderId: "order1",
          type: "status_update",
          message: "Order confirmed",
        },
        {
          _id: "notif2",
          orderId: "order2",
          type: "delivery_confirmation",
          message: "Order delivered",
        },
      ];

      const mockSelect = jest.fn().mockResolvedValue(mockOrders);
      (Order.find as jest.Mock) = jest.fn().mockReturnValue({
        select: mockSelect,
      });

      const mockSort = jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockNotifications),
      });
      (Notification.find as jest.Mock) = jest.fn().mockReturnValue({
        sort: mockSort,
      });

      await notificationController.getNotifications(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(Order.find).toHaveBeenCalledWith({ customerId: "user123" });
      expect(Notification.find).toHaveBeenCalledWith({
        orderId: { $in: ["order1", "order2"] },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: { notifications: mockNotifications },
      });
    });

    it("should filter notifications by status", async () => {
      mockRequest.query = { status: "sent" };

      const mockOrders = [{ _id: "order1" }];

      const mockSelect = jest.fn().mockResolvedValue(mockOrders);
      (Order.find as jest.Mock) = jest.fn().mockReturnValue({
        select: mockSelect,
      });

      const mockSort = jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([]),
      });
      (Notification.find as jest.Mock) = jest.fn().mockReturnValue({
        sort: mockSort,
      });

      await notificationController.getNotifications(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(Notification.find).toHaveBeenCalledWith({
        orderId: { $in: ["order1"] },
        status: "sent",
      });
    });

    it("should respect limit parameter", async () => {
      mockRequest.query = { limit: "10" };

      const mockOrders = [{ _id: "order1" }];

      const mockSelect = jest.fn().mockResolvedValue(mockOrders);
      (Order.find as jest.Mock) = jest.fn().mockReturnValue({
        select: mockSelect,
      });

      const mockLimit = jest.fn().mockResolvedValue([]);
      const mockSort = jest.fn().mockReturnValue({
        limit: mockLimit,
      });
      (Notification.find as jest.Mock) = jest.fn().mockReturnValue({
        sort: mockSort,
      });

      await notificationController.getNotifications(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockLimit).toHaveBeenCalledWith(10);
    });

    it("should handle user with no orders", async () => {
      mockRequest.query = {};

      const mockSelect = jest.fn().mockResolvedValue([]);
      (Order.find as jest.Mock) = jest.fn().mockReturnValue({
        select: mockSelect,
      });

      const mockSort = jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([]),
      });
      (Notification.find as jest.Mock) = jest.fn().mockReturnValue({
        sort: mockSort,
      });

      await notificationController.getNotifications(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        data: { notifications: [] },
      });
    });
  });

  describe("markNotificationAsRead", () => {
    it("should mark notification as read successfully", async () => {
      mockRequest.params = { notificationId: "notif123" };

      const mockNotification = {
        _id: "notif123",
        status: "sent",
        save: jest.fn().mockResolvedValue(true),
      };

      (Notification.findById as jest.Mock) = jest.fn().mockResolvedValue(mockNotification);

      await notificationController.markNotificationAsRead(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(Notification.findById).toHaveBeenCalledWith("notif123");
      expect(mockNotification.status).toBe("delivered");
      expect(mockNotification.deliveredAt).toBeInstanceOf(Date);
      expect(mockNotification.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it("should throw error if notification not found", async () => {
      mockRequest.params = { notificationId: "nonexistent" };

      (Notification.findById as jest.Mock) = jest.fn().mockResolvedValue(null);

      await expect(
        notificationController.markNotificationAsRead(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("markAllNotificationsAsRead", () => {
    it("should mark all user notifications as read", async () => {
      const mockOrders = [
        { _id: "order1" },
        { _id: "order2" },
      ];

      const mockSelect = jest.fn().mockResolvedValue(mockOrders);
      (Order.find as jest.Mock) = jest.fn().mockReturnValue({
        select: mockSelect,
      });

      (Notification.updateMany as jest.Mock) = jest.fn().mockResolvedValue({
        modifiedCount: 5,
      });

      await notificationController.markAllNotificationsAsRead(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(Order.find).toHaveBeenCalledWith({ customerId: "user123" });
      expect(Notification.updateMany).toHaveBeenCalledWith(
        { orderId: { $in: ["order1", "order2"] }, status: { $ne: "delivered" } },
        { status: "delivered", deliveredAt: expect.any(Date) }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "All notifications marked as read",
        data: { modifiedCount: 5 },
      });
    });

    it("should handle user with no unread notifications", async () => {
      const mockOrders = [{ _id: "order1" }];

      const mockSelect = jest.fn().mockResolvedValue(mockOrders);
      (Order.find as jest.Mock) = jest.fn().mockReturnValue({
        select: mockSelect,
      });

      (Notification.updateMany as jest.Mock) = jest.fn().mockResolvedValue({
        modifiedCount: 0,
      });

      await notificationController.markAllNotificationsAsRead(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { modifiedCount: 0 },
        })
      );
    });
  });
});