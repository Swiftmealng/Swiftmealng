import { Request, Response, NextFunction } from 'express';
import * as publicController from '../../controllers/public.controller';
import Order from '../../models/Order';
import User from '../../models/User';
import Rating from '../../models/Rating';

jest.mock('../../models/Order');
jest.mock('../../models/User');
jest.mock('../../models/Rating');

describe('Public Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPublicStats', () => {
    it('should return public statistics', async () => {
      (Order.countDocuments as jest.Mock).mockResolvedValue(150);
      (Order.distinct as jest.Mock).mockResolvedValue([
        'Restaurant A',
        'Restaurant B',
        'Restaurant C',
      ]);
      (User.countDocuments as jest.Mock).mockResolvedValue(500);
      (Rating.aggregate as jest.Mock).mockResolvedValue([
        { _id: null, avgFoodRating: 4.6, totalRatings: 120 },
      ]);

      await publicController.getPublicStats(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(Order.countDocuments).toHaveBeenCalledWith({ status: 'completed' });
      expect(User.countDocuments).toHaveBeenCalledWith({ role: 'customer' });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          stats: {
            totalCustomers: 500,
            totalRestaurants: 3,
            averageRating: 4.6,
            totalOrders: 150,
          },
        },
      });
    });

    it('should use default values when no ratings exist', async () => {
      (Order.countDocuments as jest.Mock).mockResolvedValue(0);
      (Order.distinct as jest.Mock).mockResolvedValue([]);
      (User.countDocuments as jest.Mock).mockResolvedValue(0);
      (Rating.aggregate as jest.Mock).mockResolvedValue([]);

      await publicController.getPublicStats(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          stats: {
            totalCustomers: 0,
            totalRestaurants: 50, // Default value
            averageRating: 4.8, // Default value
            totalOrders: 0,
          },
        },
      });
    });
  });
});