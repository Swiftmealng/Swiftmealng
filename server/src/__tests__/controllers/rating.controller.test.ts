jest.mock("../../utils/asyncHandler", () => ({ __esModule: true, default: (fn: any) => fn }));
import { Request, Response } from "express";
import * as ratingController from "../../controllers/rating.controller";
import Rating from "../../models/Rating";
import Order from "../../models/Order";
import Rider from "../../models/Rider";
import AppError from "../../utils/AppError";

jest.mock("../../models/Rating");
jest.mock("../../models/Order");
jest.mock("../../models/Rider");

describe("Rating Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      user: { _id: "user123" },
      body: {},
      query: {},
    } as any;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe("createRating", () => {
    it("should create a rating successfully", async () => {
      mockRequest.body = {
        orderId: "order123",
        orderNumber: "ORD-001",
        foodRating: 5,
        deliveryRating: 4,
        riderRating: 5,
        review: "Great service!",
      };

      const mockOrder = {
        _id: "order123",
        customerId: "user123",
        status: "delivered",
        riderId: "rider123",
      };

      const mockRating = {
        _id: "rating123",
        ...mockRequest.body,
        userId: "user123",
        riderId: "rider123",
      };

      const mockRiderRatings = [
        { riderRating: 4 },
        { riderRating: 5 },
        { riderRating: 5 },
      ];

      (Order.findOne as jest.Mock) = jest.fn().mockResolvedValue(mockOrder);
      (Rating.findOne as jest.Mock) = jest.fn().mockResolvedValue(null);
      (Rating.create as jest.Mock) = jest.fn().mockResolvedValue(mockRating);
      (Rating.find as jest.Mock) = jest.fn().mockResolvedValue(mockRiderRatings);
      (Rider.findByIdAndUpdate as jest.Mock) = jest.fn().mockResolvedValue({});

      await ratingController.createRating(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(Order.findOne).toHaveBeenCalledWith({
        _id: "order123",
        customerId: "user123",
      });
      expect(Rating.findOne).toHaveBeenCalledWith({ orderId: "order123" });
      expect(Rating.create).toHaveBeenCalledWith({
        orderId: "order123",
        orderNumber: "ORD-001",
        userId: "user123",
        riderId: "rider123",
        foodRating: 5,
        deliveryRating: 4,
        riderRating: 5,
        review: "Great service!",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { rating: mockRating },
      });
    });

    it("should throw error if orderId is missing", async () => {
      mockRequest.body = {
        orderNumber: "ORD-001",
        foodRating: 5,
        deliveryRating: 4,
      };

      await expect(
        ratingController.createRating(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toMatchObject({
        message: "Order ID and Order Number are required",
        statusCode: 400,
      });
    });

    it("should throw error if orderNumber is missing", async () => {
      mockRequest.body = {
        orderId: "order123",
        foodRating: 5,
        deliveryRating: 4,
      };

      await expect(
        ratingController.createRating(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toMatchObject({
        message: "Order ID and Order Number are required",
        statusCode: 400,
      });
    });

    it("should throw error if foodRating is missing", async () => {
      mockRequest.body = {
        orderId: "order123",
        orderNumber: "ORD-001",
        deliveryRating: 4,
      };

      await expect(
        ratingController.createRating(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toMatchObject({
        message: "Food and delivery ratings are required",
        statusCode: 400,
      });
    });

    it("should throw error if deliveryRating is missing", async () => {
      mockRequest.body = {
        orderId: "order123",
        orderNumber: "ORD-001",
        foodRating: 5,
      };

      await expect(
        ratingController.createRating(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toMatchObject({
        message: "Food and delivery ratings are required",
        statusCode: 400,
      });
    });

    it("should throw error if foodRating is below 1", async () => {
      mockRequest.body = {
        orderId: "order123",
        orderNumber: "ORD-001",
        foodRating: 0,
        deliveryRating: 4,
      };

      await expect(
        ratingController.createRating(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toMatchObject({
        message: "Ratings must be between 1 and 5",
        statusCode: 400,
      });
    });

    it("should throw error if foodRating is above 5", async () => {
      mockRequest.body = {
        orderId: "order123",
        orderNumber: "ORD-001",
        foodRating: 6,
        deliveryRating: 4,
      };

      await expect(
        ratingController.createRating(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toMatchObject({
        message: "Ratings must be between 1 and 5",
        statusCode: 400,
      });
    });

    it("should throw error if deliveryRating is invalid", async () => {
      mockRequest.body = {
        orderId: "order123",
        orderNumber: "ORD-001",
        foodRating: 5,
        deliveryRating: 0,
      };

      await expect(
        ratingController.createRating(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toMatchObject({
        message: "Ratings must be between 1 and 5",
        statusCode: 400,
      });
    });

    it("should throw error if riderRating is invalid", async () => {
      mockRequest.body = {
        orderId: "order123",
        orderNumber: "ORD-001",
        foodRating: 5,
        deliveryRating: 4,
        riderRating: 6,
      };

      await expect(
        ratingController.createRating(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toMatchObject({
        message: "Rider rating must be between 1 and 5",
        statusCode: 400,
      });
    });

    it("should throw error if order not found", async () => {
      mockRequest.body = {
        orderId: "order123",
        orderNumber: "ORD-001",
        foodRating: 5,
        deliveryRating: 4,
      };

      (Order.findOne as jest.Mock) = jest.fn().mockResolvedValue(null);

      await expect(
        ratingController.createRating(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toMatchObject({
        message: "Order not found or unauthorized",
        statusCode: 404,
      });
    });

    it("should throw error if order is not delivered", async () => {
      mockRequest.body = {
        orderId: "order123",
        orderNumber: "ORD-001",
        foodRating: 5,
        deliveryRating: 4,
      };

      const mockOrder = {
        _id: "order123",
        customerId: "user123",
        status: "preparing",
      };

      (Order.findOne as jest.Mock) = jest.fn().mockResolvedValue(mockOrder);

      await expect(
        ratingController.createRating(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toMatchObject({
        message: "Can only rate completed orders",
        statusCode: 400,
      });
    });

    it("should throw error if order already rated", async () => {
      mockRequest.body = {
        orderId: "order123",
        orderNumber: "ORD-001",
        foodRating: 5,
        deliveryRating: 4,
      };

      const mockOrder = {
        _id: "order123",
        customerId: "user123",
        status: "delivered",
      };

      const existingRating = {
        _id: "rating123",
        orderId: "order123",
      };

      (Order.findOne as jest.Mock) = jest.fn().mockResolvedValue(mockOrder);
      (Rating.findOne as jest.Mock) = jest.fn().mockResolvedValue(existingRating);

      await expect(
        ratingController.createRating(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toMatchObject({
        message: "Order already rated",
        statusCode: 400,
      });
    });

    it("should create rating without riderRating", async () => {
      mockRequest.body = {
        orderId: "order123",
        orderNumber: "ORD-001",
        foodRating: 5,
        deliveryRating: 4,
      };

      const mockOrder = {
        _id: "order123",
        customerId: "user123",
        status: "delivered",
      };

      const mockRating = {
        _id: "rating123",
        ...mockRequest.body,
        userId: "user123",
      };

      (Order.findOne as jest.Mock) = jest.fn().mockResolvedValue(mockOrder);
      (Rating.findOne as jest.Mock) = jest.fn().mockResolvedValue(null);
      (Rating.create as jest.Mock) = jest.fn().mockResolvedValue(mockRating);

      await ratingController.createRating(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(Rider.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("should update rider average rating", async () => {
      mockRequest.body = {
        orderId: "order123",
        orderNumber: "ORD-001",
        foodRating: 5,
        deliveryRating: 4,
        riderRating: 5,
      };

      const mockOrder = {
        _id: "order123",
        customerId: "user123",
        status: "delivered",
        riderId: "rider123",
      };

      const mockRating = {
        _id: "rating123",
        ...mockRequest.body,
        userId: "user123",
        riderId: "rider123",
      };

      const mockRiderRatings = [
        { riderRating: 4 },
        { riderRating: 5 },
        { riderRating: 5 },
      ];

      (Order.findOne as jest.Mock) = jest.fn().mockResolvedValue(mockOrder);
      (Rating.findOne as jest.Mock) = jest.fn().mockResolvedValue(null);
      (Rating.create as jest.Mock) = jest.fn().mockResolvedValue(mockRating);
      (Rating.find as jest.Mock) = jest.fn().mockResolvedValue(mockRiderRatings);
      (Rider.findByIdAndUpdate as jest.Mock) = jest.fn().mockResolvedValue({});

      await ratingController.createRating(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(Rating.find).toHaveBeenCalledWith({
        riderId: "rider123",
        riderRating: { $exists: true },
      });
      expect(Rider.findByIdAndUpdate).toHaveBeenCalledWith("rider123", {
        rating: 4.7,
      });
    });
  });

  describe("getRatingByOrder", () => {
    it("should return rating for an order", async () => {
      mockRequest.query = { orderId: "order123" };

      const mockRating = {
        _id: "rating123",
        orderId: "order123",
        foodRating: 5,
        deliveryRating: 4,
      };

      (Rating.findOne as jest.Mock) = jest.fn().mockResolvedValue(mockRating);

      await ratingController.getRatingByOrder(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(Rating.findOne).toHaveBeenCalledWith({ orderId: "order123" });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { rating: mockRating },
      });
    });

    it("should return null if rating not found", async () => {
      mockRequest.query = { orderId: "order123" };

      (Rating.findOne as jest.Mock) = jest.fn().mockResolvedValue(null);

      await ratingController.getRatingByOrder(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { rating: null },
      });
    });

    it("should throw error if orderId is missing", async () => {
      mockRequest.query = {};

      await expect(
        ratingController.getRatingByOrder(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toMatchObject({
        message: "Order ID is required",
        statusCode: 400,
      });
    });

    it("should handle database errors", async () => {
      mockRequest.query = { orderId: "order123" };

      (Rating.findOne as jest.Mock) = jest.fn().mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        ratingController.getRatingByOrder(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toThrow("Database error");
    });
  });
});