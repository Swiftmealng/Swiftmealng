import { Request, Response } from 'express';
import { initiatePayment } from '../../controllers/payment.controller';
import Payment from '../../models/Payment';
import Order from '../../models/Order';
import axios from 'axios';

jest.mock('../../models/Payment');
jest.mock('../../models/Order');
jest.mock('axios');

describe('Payment Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      body: {},
      user: { id: 'user123' }
    } as any;
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('initiatePayment', () => {
    it('should successfully initiate payment', async () => {
      mockReq.body = {
        orderId: 'order123',
        amount: 5000,
        email: 'test@example.com'
      };

      const mockOrder = {
        _id: 'order123',
        customerId: 'user123',
        status: 'pending'
      };

      (Order.findById as jest.Mock).mockResolvedValue(mockOrder);
      (Payment.findOne as jest.Mock).mockResolvedValue(null);

      const mockPaystackResponse = {
        data: {
          status: true,
          data: {
            authorization_url: 'https://paystack.com/pay/xyz',
            access_code: 'abc123',
            reference: 'ref-123'
          }
        }
      };

      (axios.post as jest.Mock).mockResolvedValue(mockPaystackResponse);
      (Payment.create as jest.Mock).mockResolvedValue({
        _id: 'payment123',
        reference: 'ref-123'
      });

      await initiatePayment(mockReq as any, mockRes as Response);

      expect(Order.findById).toHaveBeenCalledWith('order123');
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should return existing pending payment (idempotency)', async () => {
      mockReq.body = {
        orderId: 'order123',
        amount: 5000,
        email: 'test@example.com'
      };

      const mockOrder = {
        _id: 'order123',
        customerId: 'user123'
      };

      const existingPayment = {
        _id: 'payment123',
        status: 'pending',
        authorizationUrl: 'https://paystack.com/pay/xyz',
        accessCode: 'abc123',
        reference: 'ref-123'
      };

      (Order.findById as jest.Mock).mockResolvedValue(mockOrder);
      (Payment.findOne as jest.Mock).mockResolvedValue(existingPayment);

      await initiatePayment(mockReq as any, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          payment: existingPayment
        }),
        message: 'Using existing pending payment'
      });
    });

    it('should throw error if order not found', async () => {
      mockReq.body = {
        orderId: 'nonexistent',
        amount: 5000,
        email: 'test@example.com'
      };

      (Order.findById as jest.Mock).mockResolvedValue(null);

      await initiatePayment(mockReq as any, mockRes as Response);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should throw error if user is not authorized for order', async () => {
      mockReq.body = {
        orderId: 'order123',
        amount: 5000,
        email: 'test@example.com'
      };

      const mockOrder = {
        _id: 'order123',
        customerId: 'different-user'
      };

      (Order.findById as jest.Mock).mockResolvedValue(mockOrder);

      await initiatePayment(mockReq as any, mockRes as Response);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should validate amount is positive number', async () => {
      mockReq.body = {
        orderId: 'order123',
        amount: -100,
        email: 'test@example.com'
      };

      await initiatePayment(mockReq as any, mockRes as Response);

      expect(Order.findById).not.toHaveBeenCalled();
    });

    it('should validate amount is a number', async () => {
      mockReq.body = {
        orderId: 'order123',
        amount: 'invalid',
        email: 'test@example.com'
      };

      await initiatePayment(mockReq as any, mockRes as Response);

      expect(Order.findById).not.toHaveBeenCalled();
    });

    it('should throw error if payment already completed', async () => {
      mockReq.body = {
        orderId: 'order123',
        amount: 5000,
        email: 'test@example.com'
      };

      const mockOrder = {
        _id: 'order123',
        customerId: 'user123'
      };

      const completedPayment = {
        status: 'success',
        orderId: 'order123'
      };

      (Order.findById as jest.Mock).mockResolvedValue(mockOrder);
      (Payment.findOne as jest.Mock).mockResolvedValue(completedPayment);

      await initiatePayment(mockReq as any, mockRes as Response);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should generate unique payment reference', async () => {
      mockReq.body = {
        orderId: 'order123',
        amount: 5000,
        email: 'test@example.com'
      };

      const mockOrder = {
        _id: 'order123',
        customerId: 'user123'
      };

      (Order.findById as jest.Mock).mockResolvedValue(mockOrder);
      (Payment.findOne as jest.Mock).mockResolvedValue(null);

      const mockPaystackResponse = {
        data: {
          status: true,
          data: {
            authorization_url: 'https://paystack.com/pay/xyz',
            access_code: 'abc123',
            reference: 'generated-ref'
          }
        }
      };

      (axios.post as jest.Mock).mockResolvedValue(mockPaystackResponse);
      (Payment.create as jest.Mock).mockImplementation((data) => {
        expect(data.reference).toMatch(/^SWM-/);
        return Promise.resolve({ _id: 'payment123', ...data });
      });

      await initiatePayment(mockReq as any, mockRes as Response);

      expect(Payment.create).toHaveBeenCalled();
    });

    it('should handle Paystack API errors', async () => {
      mockReq.body = {
        orderId: 'order123',
        amount: 5000,
        email: 'test@example.com'
      };

      const mockOrder = {
        _id: 'order123',
        customerId: 'user123'
      };

      (Order.findById as jest.Mock).mockResolvedValue(mockOrder);
      (Payment.findOne as jest.Mock).mockResolvedValue(null);
      (axios.post as jest.Mock).mockRejectedValue(new Error('Paystack API error'));

      await initiatePayment(mockReq as any, mockRes as Response);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});