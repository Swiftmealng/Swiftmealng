import { Request, Response } from 'express';
import * as ratingController from '../../controllers/rating.controller';
import Rating from '../../models/Rating';
import Order from '../../models/Order';
import Rider from '../../models/Rider';
import AppError from '../../utils/AppError';

jest.mock('../../models/Rating');
jest.mock('../../models/Order');
jest.mock('../../models/Rider');

describe('Rating Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    (mockRequest as any).user = { id: 'user123' };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRating', () => {
    it('should successfully create a rating', async () => {
      mockRequest.body = {
        orderId: 'order123',
        orderNumber: 'ORD-123',
        foodRating: 5,
        deliveryRating: 4,
        riderRating: 5,
        review: 'Great service!',
      };

      const mockOrder = {
        _id: 'order123',
        customerId: 'user123',
        status: 'delivered',
        riderId: 'rider123',
      };

      (Order.findOne as jest.Mock).mockResolvedValue(mockOrder);
      (Rating.findOne as jest.Mock).mockResolvedValue(null);

      const mockRating = {
        _id: 'rating123',
        orderId: 'order123',
        foodRating: 5,
        deliveryRating: 4,
        riderRating: 5,
      };

      (Rating.create as jest.Mock).mockResolvedValue(mockRating);
      (Rating.aggregate as jest.Mock).mockResolvedValue([{ avgRating: 4.5 }]);
      (Rider.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

      await ratingController.createRating(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Rating.create).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 'order123',
          foodRating: 5,
          deliveryRating: 4,
          riderRating: 5,
        })
      );
      expect(Rider.findByIdAndUpdate).toHaveBeenCalledWith('rider123', {
        rating: 4.5,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('should reject rating for non-delivered order', async () => {
      mockRequest.body = {
        orderId: 'order123',
        orderNumber: 'ORD-123',
        foodRating: 5,
        deliveryRating: 4,
      };

      const mockOrder = {
        _id: 'order123',
        customerId: 'user123',
        status: 'pending',
      };

      (Order.findOne as jest.Mock).mockResolvedValue(mockOrder);

      await expect(
        ratingController.createRating(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow('Can only rate completed orders');
    });

    it('should reject duplicate rating', async () => {
      mockRequest.body = {
        orderId: 'order123',
        orderNumber: 'ORD-123',
        foodRating: 5,
        deliveryRating: 4,
      };

      const mockOrder = {
        customerId: 'user123',
        status: 'delivered',
      };

      const existingRating = { _id: 'rating123' };

      (Order.findOne as jest.Mock).mockResolvedValue(mockOrder);
      (Rating.findOne as jest.Mock).mockResolvedValue(existingRating);

      await expect(
        ratingController.createRating(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow('Order already rated');
    });

    it('should validate rating values', async () => {
      mockRequest.body = {
        orderId: 'order123',
        orderNumber: 'ORD-123',
        foodRating: 6, // Invalid: > 5
        deliveryRating: 4,
      };

      await expect(
        ratingController.createRating(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow('Ratings must be integers between 1 and 5');
    });

    it('should validate integer ratings', async () => {
      mockRequest.body = {
        orderId: 'order123',
        orderNumber: 'ORD-123',
        foodRating: 4.5, // Invalid: not integer
        deliveryRating: 4,
      };

      await expect(
        ratingController.createRating(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow('Ratings must be integers between 1 and 5');
    });

    it('should reject unauthorized rating', async () => {
      mockRequest.body = {
        orderId: 'order123',
        orderNumber: 'ORD-123',
        foodRating: 5,
        deliveryRating: 4,
      };

      (Order.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        ratingController.createRating(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow('Order not found or unauthorized');
    });
  });

  describe('getRatingByOrder', () => {
    it('should get rating for an order', async () => {
      mockRequest.params = { orderId: 'order123' };

      const mockRating = {
        _id: 'rating123',
        orderId: 'order123',
        foodRating: 5,
        deliveryRating: 4,
      };

      (Rating.findOne as jest.Mock).mockResolvedValue(mockRating);

      await ratingController.getRatingByOrder(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Rating.findOne).toHaveBeenCalledWith({ orderId: 'order123' });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { rating: mockRating },
      });
    });

    it('should return null for non-existent rating', async () => {
      mockRequest.params = { orderId: 'order123' };

      (Rating.findOne as jest.Mock).mockResolvedValue(null);

      await ratingController.getRatingByOrder(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { rating: null },
      });
    });
  });
});