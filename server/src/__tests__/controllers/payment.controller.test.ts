import { Request, Response } from 'express';
import { initiatePayment, verifyPayment } from '../../controllers/payment.controller';
import Payment from '../../models/Payment';
import Order from '../../models/Order';
import axios from 'axios';

// Mock dependencies
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
      params: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
    process.env.PAYSTACK_SECRET_KEY = 'test-secret-key';
    process.env.CLIENT_URL = 'http://localhost:5173';
  });

  describe('initiatePayment', () => {
    it('should initialize payment successfully', async () => {
      (mockReq as any).user = { id: 'user123', email: 'test@example.com' };
      mockReq.body = {
        orderId: 'order123',
        amount: 5000,
        email: 'test@example.com',
      };

      const mockOrder = {
        _id: 'order123',
        orderNumber: 'ORD-001',
        customerId: 'user123',
      };

      (Order.findById as jest.Mock).mockResolvedValue(mockOrder);
      (Payment.findOne as jest.Mock).mockResolvedValue(null);
      (axios.post as jest.Mock).mockResolvedValue({
        data: {
          data: {
            authorization_url: 'https://paystack.com/pay/xyz',
            access_code: 'abc123',
          },
        },
      });
      (Payment.create as jest.Mock).mockResolvedValue({
        _id: 'payment123',
        reference: expect.any(String),
        status: 'pending',
      });

      await initiatePayment(mockReq as Request, mockRes as Response);

      expect(Order.findById).toHaveBeenCalledWith('order123');
      expect(axios.post).toHaveBeenCalledWith(
        'https://api.paystack.co/transaction/initialize',
        expect.objectContaining({
          amount: 500000, // Converted to kobo
          currency: 'NGN',
        }),
        expect.any(Object)
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          authorizationUrl: 'https://paystack.com/pay/xyz',
          accessCode: 'abc123',
        }),
      });
    });

    it('should return existing pending payment', async () => {
      (mockReq as any).user = { id: 'user123' };
      mockReq.body = {
        orderId: 'order123',
        amount: 5000,
      };

      const mockOrder = {
        _id: 'order123',
        orderNumber: 'ORD-001',
        customerId: 'user123',
      };

      const existingPayment = {
        _id: 'payment123',
        status: 'pending',
        authorizationUrl: 'https://paystack.com/pay/xyz',
        accessCode: 'abc123',
        reference: 'REF-001',
      };

      (Order.findById as jest.Mock).mockResolvedValue(mockOrder);
      (Payment.findOne as jest.Mock).mockResolvedValue(existingPayment);

      await initiatePayment(mockReq as Request, mockRes as Response);

      expect(Payment.create).not.toHaveBeenCalled();
      expect(axios.post).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          reference: 'REF-001',
        }),
        message: 'Using existing pending payment',
      });
    });

    it('should reject payment for non-existent order', async () => {
      (mockReq as any).user = { id: 'user123' };
      mockReq.body = {
        orderId: 'invalid-order',
        amount: 5000,
      };

      (Order.findById as jest.Mock).mockResolvedValue(null);

      await expect(initiatePayment(mockReq as Request, mockRes as Response)).rejects.toThrow(
        'Order not found'
      );
    });

    it('should reject unauthorized order access', async () => {
      (mockReq as any).user = { id: 'user123' };
      mockReq.body = {
        orderId: 'order123',
        amount: 5000,
      };

      const mockOrder = {
        _id: 'order123',
        customerId: 'different-user',
      };

      (Order.findById as jest.Mock).mockResolvedValue(mockOrder);

      await expect(initiatePayment(mockReq as Request, mockRes as Response)).rejects.toThrow(
        'Unauthorized to access this order'
      );
    });

    it('should reject invalid amount', async () => {
      (mockReq as any).user = { id: 'user123' };
      mockReq.body = {
        orderId: 'order123',
        amount: -100,
      };

      await expect(initiatePayment(mockReq as Request, mockRes as Response)).rejects.toThrow(
        'Invalid amount'
      );
    });

    it('should reject already completed payment', async () => {
      (mockReq as any).user = { id: 'user123' };
      mockReq.body = {
        orderId: 'order123',
        amount: 5000,
      };

      const mockOrder = {
        _id: 'order123',
        customerId: 'user123',
      };

      const existingPayment = {
        status: 'success',
      };

      (Order.findById as jest.Mock).mockResolvedValue(mockOrder);
      (Payment.findOne as jest.Mock).mockResolvedValue(existingPayment);

      await expect(initiatePayment(mockReq as Request, mockRes as Response)).rejects.toThrow(
        'Payment already completed for this order'
      );
    });

    it('should retry on timeout', async () => {
      (mockReq as any).user = { id: 'user123', email: 'test@example.com' };
      mockReq.body = {
        orderId: 'order123',
        amount: 5000,
      };

      const mockOrder = {
        _id: 'order123',
        orderNumber: 'ORD-001',
        customerId: 'user123',
      };

      (Order.findById as jest.Mock).mockResolvedValue(mockOrder);
      (Payment.findOne as jest.Mock).mockResolvedValue(null);
      
      // First two attempts timeout, third succeeds
      (axios.post as jest.Mock)
        .mockRejectedValueOnce({ code: 'ECONNABORTED' })
        .mockRejectedValueOnce({ code: 'ECONNABORTED' })
        .mockResolvedValueOnce({
          data: {
            data: {
              authorization_url: 'https://paystack.com/pay/xyz',
              access_code: 'abc123',
            },
          },
        });
      
      (Payment.create as jest.Mock).mockResolvedValue({});

      await initiatePayment(mockReq as Request, mockRes as Response);

      expect(axios.post).toHaveBeenCalledTimes(3);
    });
  });

  describe('verifyPayment', () => {
    it('should verify payment successfully', async () => {
      mockReq.params = { reference: 'REF-001' };

      const mockPayment = {
        _id: 'payment123',
        reference: 'REF-001',
        amount: 500000,
        orderId: 'order123',
        status: 'pending',
        save: jest.fn().mockResolvedValue(undefined),
      };

      (Payment.findOne as jest.Mock).mockResolvedValue(mockPayment);
      (axios.get as jest.Mock).mockResolvedValue({
        data: {
          data: {
            status: 'success',
            amount: 500000,
          },
        },
      });
      (Order.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

      await verifyPayment(mockReq as Request, mockRes as Response);

      expect(Payment.findOne).toHaveBeenCalledWith({ reference: 'REF-001' });
      expect(mockPayment.status).toBe('success');
      expect(mockPayment.save).toHaveBeenCalled();
      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith('order123', {
        paymentStatus: 'paid',
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should reject verification for non-existent payment', async () => {
      mockReq.params = { reference: 'INVALID-REF' };

      (Payment.findOne as jest.Mock).mockResolvedValue(null);

      await expect(verifyPayment(mockReq as Request, mockRes as Response)).rejects.toThrow(
        'Payment not found'
      );
    });
  });
});