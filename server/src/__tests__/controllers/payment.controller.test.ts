jest.mock("../../utils/asyncHandler", () => ({ __esModule: true, default: (fn: any) => fn }));
import { Request, Response } from "express";
import * as paymentController from "../../controllers/payment.controller";
import Payment from "../../models/Payment";
import Order from "../../models/Order";
import AppError from "../../utils/AppError";
import axios from "axios";

jest.mock("../../models/Payment");
jest.mock("../../models/Order");
jest.mock("axios");

describe("Payment Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;
  const originalEnv = process.env;

  beforeEach(() => {
    mockRequest = {
      user: { _id: "user123", email: "user@test.com" },
      body: {},
      params: {},
    } as any;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    nextFunction = jest.fn();
    process.env = { ...originalEnv, PAYSTACK_SECRET_KEY: "sk_test_123456" };
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("initiatePayment", () => {
    it("should initialize payment successfully", async () => {
      mockRequest.body = {
        orderId: "order123",
        amount: 5000,
        email: "customer@test.com",
      };

      const mockOrder = {
        _id: "order123",
        customerId: "user123",
        orderNumber: "ORD-001",
      };

      const mockPaystackResponse = {
        data: {
          data: {
            authorization_url: "https://checkout.paystack.com/abc123",
            access_code: "abc123",
            reference: "ref123",
          },
        },
      };

      const mockPayment = {
        _id: "payment123",
        orderId: "order123",
        orderNumber: "ORD-001",
        userId: "user123",
        amount: 5000,
        reference: expect.any(String),
        status: "pending",
      };

      (Order.findOne as jest.Mock) = jest.fn().mockResolvedValue(mockOrder);
      (axios.post as jest.Mock) = jest.fn().mockResolvedValue(mockPaystackResponse);
      (Payment.create as jest.Mock) = jest.fn().mockResolvedValue(mockPayment);

      await paymentController.initiatePayment(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(Order.findOne).toHaveBeenCalledWith({
        _id: "order123",
        customerId: "user123",
      });
      expect(axios.post).toHaveBeenCalledWith(
        "https://api.paystack.co/transaction/initialize",
        expect.objectContaining({
          email: "customer@test.com",
          amount: 500000, // 5000 * 100 (kobo)
          currency: "NGN",
        }),
        expect.objectContaining({
          headers: {
            Authorization: "Bearer sk_test_123456",
            "Content-Type": "application/json",
          },
        })
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it("should throw error if orderId is missing", async () => {
      mockRequest.body = {
        amount: 5000,
      };

      await expect(
        paymentController.initiatePayment(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toMatchObject({
        message: "Order ID and amount are required",
        statusCode: 400,
      });
    });

    it("should throw error if amount is missing", async () => {
      mockRequest.body = {
        orderId: "order123",
      };

      await expect(
        paymentController.initiatePayment(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toMatchObject({
        message: "Order ID and amount are required",
        statusCode: 400,
      });
    });

    it("should throw error if order not found", async () => {
      mockRequest.body = {
        orderId: "order123",
        amount: 5000,
      };

      (Order.findOne as jest.Mock) = jest.fn().mockResolvedValue(null);

      await expect(
        paymentController.initiatePayment(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toMatchObject({
        message: "Order not found or unauthorized",
        statusCode: 404,
      });
    });

    it("should use user email if not provided in body", async () => {
      mockRequest.body = {
        orderId: "order123",
        amount: 5000,
      };

      const mockOrder = {
        _id: "order123",
        customerId: "user123",
        orderNumber: "ORD-001",
      };

      const mockPaystackResponse = {
        data: {
          data: {
            authorization_url: "https://checkout.paystack.com/abc123",
            access_code: "abc123",
          },
        },
      };

      (Order.findOne as jest.Mock) = jest.fn().mockResolvedValue(mockOrder);
      (axios.post as jest.Mock) = jest.fn().mockResolvedValue(mockPaystackResponse);
      (Payment.create as jest.Mock) = jest.fn().mockResolvedValue({});

      await paymentController.initiatePayment(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          email: "user@test.com",
        }),
        expect.any(Object)
      );
    });

    it("should handle Paystack API errors", async () => {
      mockRequest.body = {
        orderId: "order123",
        amount: 5000,
      };

      const mockOrder = {
        _id: "order123",
        customerId: "user123",
        orderNumber: "ORD-001",
      };

      const paystackError = {
        response: {
          data: {
            message: "Invalid API key",
          },
        },
      };

      (Order.findOne as jest.Mock) = jest.fn().mockResolvedValue(mockOrder);
      (axios.post as jest.Mock) = jest.fn().mockRejectedValue(paystackError);

      await expect(
        paymentController.initiatePayment(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toMatchObject({
        message: "Invalid API key",
        statusCode: 500,
      });
    });

    it("should handle network errors", async () => {
      mockRequest.body = {
        orderId: "order123",
        amount: 5000,
      };

      const mockOrder = {
        _id: "order123",
        customerId: "user123",
        orderNumber: "ORD-001",
      };

      (Order.findOne as jest.Mock) = jest.fn().mockResolvedValue(mockOrder);
      (axios.post as jest.Mock) = jest.fn().mockRejectedValue(new Error("Network error"));

      await expect(
        paymentController.initiatePayment(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toMatchObject({
        message: "Payment initialization failed",
        statusCode: 500,
      });
    });
  });

  describe("verifyPayment", () => {
    it("should verify successful payment", async () => {
      mockRequest.params = { reference: "ref123" };

      const mockPayment = {
        _id: "payment123",
        orderId: "order123",
        reference: "ref123",
        amount: 5000,
        status: "pending",
        save: jest.fn().mockResolvedValue(true),
      };

      const mockVerifyResponse = {
        data: {
          data: {
            status: "success",
            amount: 5000,
          },
        },
      };

      (Payment.findOne as jest.Mock) = jest.fn().mockResolvedValue(mockPayment);
      (axios.get as jest.Mock) = jest.fn().mockResolvedValue(mockVerifyResponse);
      (Order.findByIdAndUpdate as jest.Mock) = jest.fn().mockResolvedValue({});

      await paymentController.verifyPayment(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(Payment.findOne).toHaveBeenCalledWith({ reference: "ref123" });
      expect(axios.get).toHaveBeenCalledWith(
        "https://api.paystack.co/transaction/verify/ref123",
        expect.objectContaining({
          headers: {
            Authorization: "Bearer sk_test_123456",
          },
        })
      );
      expect(mockPayment.status).toBe("success");
      expect(mockPayment.paidAt).toBeInstanceOf(Date);
      expect(mockPayment.save).toHaveBeenCalled();
      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith("order123", {
        paymentStatus: "paid",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it("should throw error if payment not found", async () => {
      mockRequest.params = { reference: "nonexistent" };

      (Payment.findOne as jest.Mock) = jest.fn().mockResolvedValue(null);

      await expect(
        paymentController.verifyPayment(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toMatchObject({
        message: "Payment not found",
        statusCode: 404,
      });
    });

    it("should handle failed payment verification", async () => {
      mockRequest.params = { reference: "ref123" };

      const mockPayment = {
        _id: "payment123",
        orderId: "order123",
        reference: "ref123",
        amount: 5000,
        status: "pending",
        save: jest.fn().mockResolvedValue(true),
      };

      const mockVerifyResponse = {
        data: {
          data: {
            status: "failed",
            amount: 5000,
          },
        },
      };

      (Payment.findOne as jest.Mock) = jest.fn().mockResolvedValue(mockPayment);
      (axios.get as jest.Mock) = jest.fn().mockResolvedValue(mockVerifyResponse);

      await paymentController.verifyPayment(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockPayment.status).toBe("failed");
      expect(mockPayment.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          data: expect.objectContaining({
            status: "failed",
          }),
        })
      );
    });

    it("should handle amount mismatch", async () => {
      mockRequest.params = { reference: "ref123" };

      const mockPayment = {
        _id: "payment123",
        orderId: "order123",
        reference: "ref123",
        amount: 5000,
        status: "pending",
        save: jest.fn().mockResolvedValue(true),
      };

      const mockVerifyResponse = {
        data: {
          data: {
            status: "success",
            amount: 3000, // Different amount
          },
        },
      };

      (Payment.findOne as jest.Mock) = jest.fn().mockResolvedValue(mockPayment);
      (axios.get as jest.Mock) = jest.fn().mockResolvedValue(mockVerifyResponse);

      await paymentController.verifyPayment(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockPayment.status).toBe("failed");
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it("should handle Paystack verification errors", async () => {
      mockRequest.params = { reference: "ref123" };

      const mockPayment = {
        _id: "payment123",
        reference: "ref123",
      };

      const paystackError = {
        response: {
          data: {
            message: "Transaction not found",
          },
        },
      };

      (Payment.findOne as jest.Mock) = jest.fn().mockResolvedValue(mockPayment);
      (axios.get as jest.Mock) = jest.fn().mockRejectedValue(paystackError);

      await expect(
        paymentController.verifyPayment(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toMatchObject({
        message: "Transaction not found",
        statusCode: 500,
      });
    });
  });
});