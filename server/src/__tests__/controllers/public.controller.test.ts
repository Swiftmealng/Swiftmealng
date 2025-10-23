import { Request, Response, NextFunction } from 'express';
import { getPublicStats } from '../../controllers/public.controller';
import Order from '../../models/Order';
import User from '../../models/User';
import Rating from '../../models/Rating';

// Mock models
jest.mock('../../models/Order');
jest.mock('../../models/User');
jest.mock('../../models/Rating');

describe('Public Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('getPublicStats', () => {
    it('should return public statistics with all data', async () => {
      // Mock Order queries
      (Order.countDocuments as jest.Mock).mockResolvedValue(150);
      (Order.distinct as jest.Mock).mockResolvedValue([
        'Restaurant A',
        'Restaurant B',
        'Restaurant C',
      ]);

      // Mock Rating aggregation
      (Rating.aggregate as jest.Mock).mockResolvedValue([
        {
          _id: null,
          avgFoodRating: 4.7,
          totalRatings: 100,
        },
      ]);

      // Mock User count
      (User.countDocuments as jest.Mock).mockResolvedValue(500);

      await getPublicStats(mockReq as Request, mockRes as Response, mockNext as NextFunction);

      expect(Order.countDocuments).toHaveBeenCalledWith({ status: 'completed' });
      expect(Order.distinct).toHaveBeenCalledWith('pickupLocation.restaurantName', {
        status: 'completed',
      });
      expect(Rating.aggregate).toHaveBeenCalledWith([
        {
          $group: {
            _id: null,
            avgFoodRating: { $avg: '$foodRating' },
            totalRatings: { $sum: 1 },
          },
        },
      ]);
      expect(User.countDocuments).toHaveBeenCalledWith({ role: 'customer' });

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          stats: {
            totalCustomers: 500,
            totalRestaurants: 3,
            averageRating: 4.7,
            totalOrders: 150,
          },
        },
      });
    });

    it('should use default rating when no ratings exist', async () => {
      (Order.countDocuments as jest.Mock).mockResolvedValue(50);
      (Order.distinct as jest.Mock).mockResolvedValue(['Restaurant A']);
      (Rating.aggregate as jest.Mock).mockResolvedValue([]); // No ratings
      (User.countDocuments as jest.Mock).mockResolvedValue(200);

      await getPublicStats(mockReq as Request, mockRes as Response, mockNext as NextFunction);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          stats: {
            totalCustomers: 200,
            totalRestaurants: 1,
            averageRating: 4.8, // Default value
            totalOrders: 50,
          },
        },
      });
    });

    it('should use default restaurant count when no restaurants found', async () => {
      (Order.countDocuments as jest.Mock).mockResolvedValue(0);
      (Order.distinct as jest.Mock).mockResolvedValue([]); // No restaurants
      (Rating.aggregate as jest.Mock).mockResolvedValue([]);
      (User.countDocuments as jest.Mock).mockResolvedValue(100);

      await getPublicStats(mockReq as Request, mockRes as Response, mockNext as NextFunction);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          stats: {
            totalCustomers: 100,
            totalRestaurants: 50, // Default value
            averageRating: 4.8,
            totalOrders: 0,
          },
        },
      });
    });

    it('should round average rating to 1 decimal place', async () => {
      (Order.countDocuments as jest.Mock).mockResolvedValue(100);
      (Order.distinct as jest.Mock).mockResolvedValue(['Restaurant A', 'Restaurant B']);
      (Rating.aggregate as jest.Mock).mockResolvedValue([
        {
          _id: null,
          avgFoodRating: 4.56789, // Should be rounded to 4.6
          totalRatings: 50,
        },
      ]);
      (User.countDocuments as jest.Mock).mockResolvedValue(300);

      await getPublicStats(mockReq as Request, mockRes as Response, mockNext as NextFunction);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            stats: expect.objectContaining({
              averageRating: 4.6,
            }),
          },
        })
      );
    });

    it('should handle all zero values', async () => {
      (Order.countDocuments as jest.Mock).mockResolvedValue(0);
      (Order.distinct as jest.Mock).mockResolvedValue([]);
      (Rating.aggregate as jest.Mock).mockResolvedValue([]);
      (User.countDocuments as jest.Mock).mockResolvedValue(0);

      await getPublicStats(mockReq as Request, mockRes as Response, mockNext as NextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          stats: {
            totalCustomers: 0,
            totalRestaurants: 50,
            averageRating: 4.8,
            totalOrders: 0,
          },
        },
      });
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database connection failed');
      (Order.countDocuments as jest.Mock).mockRejectedValue(error);

      await expect(
        getPublicStats(mockReq as Request, mockRes as Response, mockNext as NextFunction)
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle large numbers correctly', async () => {
      (Order.countDocuments as jest.Mock).mockResolvedValue(999999);
      (Order.distinct as jest.Mock).mockResolvedValue(new Array(1000).fill('Restaurant'));
      (Rating.aggregate as jest.Mock).mockResolvedValue([
        {
          _id: null,
          avgFoodRating: 5.0,
          totalRatings: 500000,
        },
      ]);
      (User.countDocuments as jest.Mock).mockResolvedValue(100000);

      await getPublicStats(mockReq as Request, mockRes as Response, mockNext as NextFunction);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          stats: {
            totalCustomers: 100000,
            totalRestaurants: 1000,
            averageRating: 5.0,
            totalOrders: 999999,
          },
        },
      });
    });
  });
});