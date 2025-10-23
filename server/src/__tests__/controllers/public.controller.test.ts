import { Request, Response, NextFunction } from 'express';
import { getPublicStats } from '../../controllers/public.controller';
import Order from '../../models/Order';
import User from '../../models/User';
import Rating from '../../models/Rating';

jest.mock('../../models/Order');
jest.mock('../../models/User');
jest.mock('../../models/Rating');

describe('Public Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('getPublicStats', () => {
    it('should return public statistics successfully', async () => {
      // Mock database responses
      (Order.countDocuments as jest.Mock).mockResolvedValue(150);
      (Order.distinct as jest.Mock).mockResolvedValue(['Restaurant1', 'Restaurant2', 'Restaurant3']);
      (User.countDocuments as jest.Mock).mockResolvedValue(500);
      (Rating.aggregate as jest.Mock).mockResolvedValue([
        { _id: null, avgFoodRating: 4.5, totalRatings: 100 }
      ]);

      await getPublicStats(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          stats: {
            totalCustomers: 500,
            totalRestaurants: 3,
            averageRating: 4.5,
            totalOrders: 150
          }
        }
      });
    });

    it('should use default rating if no ratings exist', async () => {
      (Order.countDocuments as jest.Mock).mockResolvedValue(0);
      (Order.distinct as jest.Mock).mockResolvedValue([]);
      (User.countDocuments as jest.Mock).mockResolvedValue(0);
      (Rating.aggregate as jest.Mock).mockResolvedValue([]);

      await getPublicStats(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          stats: expect.objectContaining({
            averageRating: 4.8
          })
        }
      });
    });

    it('should use fallback restaurant count if none found', async () => {
      (Order.countDocuments as jest.Mock).mockResolvedValue(0);
      (Order.distinct as jest.Mock).mockResolvedValue([]);
      (User.countDocuments as jest.Mock).mockResolvedValue(0);
      (Rating.aggregate as jest.Mock).mockResolvedValue([]);

      await getPublicStats(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          stats: expect.objectContaining({
            totalRestaurants: 50
          })
        }
      });
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      (Order.countDocuments as jest.Mock).mockRejectedValue(error);

      await getPublicStats(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should round average rating to 1 decimal place', async () => {
      (Order.countDocuments as jest.Mock).mockResolvedValue(100);
      (Order.distinct as jest.Mock).mockResolvedValue(['R1', 'R2']);
      (User.countDocuments as jest.Mock).mockResolvedValue(200);
      (Rating.aggregate as jest.Mock).mockResolvedValue([
        { _id: null, avgFoodRating: 4.567, totalRatings: 100 }
      ]);

      await getPublicStats(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          stats: expect.objectContaining({
            averageRating: 4.6
          })
        }
      });
    });
  });
});