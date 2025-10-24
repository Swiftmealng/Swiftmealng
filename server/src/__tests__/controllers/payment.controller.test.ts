import { Request, Response } from 'express';
import * as paymentController from '../../controllers/payment.controller';
import Payment from '../../models/Payment';
import Order from '../../models/Order';
import AppError from '../../utils/AppError';
import axios from 'axios';

jest.mock('../../models/Payment');
jest.mock('../../models/Order');
jest.mock('axios');

describe('Payment Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      headers: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    process.env.PAYSTACK_SECRET_KEY = 'sk_test_secret';
    process.env.CLIENT_URL = 'http://localhost:5173';
    (mockRequest as any).user = { id: 'user123', email: 'test@example.com' };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initiatePayment', () => {
    it('should successfully initiate payment', async () => {
      mockRequest.body = {
        orderId: 'order123',
        amount: 5000,
        email: 'test@example.com',
      };

      const mockOrder = {
        _id: 'order123',
        orderNumber: 'ORD-123',
        customerId: 'user123',
      };

      (Order.findById as jest.Mock).mockResolvedValue(mockOrder);
      (Payment.findOne as jest.Mock).mockResolvedValue(null);

      const mockPaystackResponse = {
        data: {
          data: {
            authorization_url: 'https://checkout.paystack.com/abc123',
            access_code: 'abc123',
          },
        },
      };

      (axios.post as jest.Mock).mockResolvedValue(mockPaystackResponse);

      const mockPayment = {
        _id: 'payment123',
        orderId: 'order123',
        amount: 5000,
        reference: expect.stringContaining('SWM-'),
      };

      (Payment.create as jest.Mock).mockResolvedValue(mockPayment);

      await paymentController.initiatePayment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Order.findById).toHaveBeenCalledWith('order123');
      expect(axios.post).toHaveBeenCalledWith(
        'https://api.paystack.co/transaction/initialize',
        expect.objectContaining({
          email: 'test@example.com',
          amount: 500000, // 5000 * 100 (kobo)
          currency: 'NGN',
        }),
        expect.any(Object)
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          payment: mockPayment,
          authorizationUrl: 'https://checkout.paystack.com/abc123',
        }),
      });
    });

    it('should reject payment for non-existent order', async () => {
      mockRequest.body = {
        orderId: 'invalid-order',
        amount: 5000,
      };

      (Order.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        paymentController.initiatePayment(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow('Order not found');
    });

    it('should reject payment with invalid amount', async () => {
      mockRequest.body = {
        orderId: 'order123',
        amount: -100,
      };

      await expect(
        paymentController.initiatePayment(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow('Invalid amount');
    });

    it('should reject payment for unauthorized order', async () => {
      mockRequest.body = {
        orderId: 'order123',
        amount: 5000,
      };

      const mockOrder = {
        _id: 'order123',
        customerId: 'different-user',
      };

      (Order.findById as jest.Mock).mockResolvedValue(mockOrder);

      await expect(
        paymentController.initiatePayment(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow('Unauthorized to access this order');
    });

    it('should return existing pending payment (idempotency)', async () => {
      mockRequest.body = {
        orderId: 'order123',
        amount: 5000,
      };

      const mockOrder = {
        _id: 'order123',
        customerId: 'user123',
      };

      const existingPayment = {
        _id: 'payment123',
        status: 'pending',
        authorizationUrl: 'https://checkout.paystack.com/existing',
        accessCode: 'existing123',
        reference: 'SWM-existing',
      };

      (Order.findById as jest.Mock).mockResolvedValue(mockOrder);
      (Payment.findOne as jest.Mock).mockResolvedValue(existingPayment);

      await paymentController.initiatePayment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Payment.create).not.toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Using existing pending payment',
        })
      );
    });

    it('should reject payment for already completed order', async () => {
      mockRequest.body = {
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

      await expect(
        paymentController.initiatePayment(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow('Payment already completed for this order');
    });

    it('should handle Paystack API errors', async () => {
      mockRequest.body = {
        orderId: 'order123',
        amount: 5000,
      };

      const mockOrder = {
        _id: 'order123',
        customerId: 'user123',
        orderNumber: 'ORD-123',
      };

      (Order.findById as jest.Mock).mockResolvedValue(mockOrder);
      (Payment.findOne as jest.Mock).mockResolvedValue(null);

      const error = {
        response: {
          data: {
            message: 'Invalid API key',
          },
        },
      };

      (axios.post as jest.Mock).mockRejectedValue(error);

      await expect(
        paymentController.initiatePayment(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow('Invalid API key');
    });
  });

  describe('verifyPayment', () => {
    it('should successfully verify payment', async () => {
      mockRequest.params = { reference: 'SWM-123' };

      const mockPayment = {
        _id: 'payment123',
        reference: 'SWM-123',
        orderId: 'order123',
        amount: 5000,
        status: 'pending',
        save: jest.fn(),
      };

      (Payment.findOne as jest.Mock).mockResolvedValue(mockPayment);

      const mockVerifyResponse = {
        data: {
          data: {
            status: 'success',
            amount: 5000,
          },
        },
      };

      (axios.get as jest.Mock).mockResolvedValue(mockVerifyResponse);
      (Order.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

      await paymentController.verifyPayment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(axios.get).toHaveBeenCalledWith(
        'https://api.paystack.co/transaction/verify/SWM-123',
        expect.any(Object)
      );
      expect(mockPayment.status).toBe('success');
      expect(mockPayment.save).toHaveBeenCalled();
      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith('order123', {
        paymentStatus: 'paid',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should handle payment verification failure', async () => {
      mockRequest.params = { reference: 'SWM-123' };

      const mockPayment = {
        reference: 'SWM-123',
        amount: 5000,
        status: 'pending',
        save: jest.fn(),
      };

      (Payment.findOne as jest.Mock).mockResolvedValue(mockPayment);

      const mockVerifyResponse = {
        data: {
          data: {
            status: 'failed',
            amount: 5000,
          },
        },
      };

      (axios.get as jest.Mock).mockResolvedValue(mockVerifyResponse);

      await paymentController.verifyPayment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockPayment.status).toBe('failed');
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should reject verification for non-existent payment', async () => {
      mockRequest.params = { reference: 'invalid-ref' };

      (Payment.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        paymentController.verifyPayment(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow('Payment not found');
    });
  });

  describe('handlePaystackWebhook', () => {
    it('should verify webhook signature', async () => {
      const webhookBody = {
        event: 'charge.success',
        data: {
          reference: 'SWM-123',
          amount: 500000,
          paid_at: new Date().toISOString(),
        },
      };

      mockRequest.body = webhookBody;
      mockRequest.headers = {
        'x-paystack-signature': 'invalid-signature',
      };

      const crypto = require('crypto');
      const hash = crypto
        .createHmac('sha512', 'sk_test_secret')
        .update(JSON.stringify(webhookBody))
        .digest('hex');

      mockRequest.headers['x-paystack-signature'] = hash;

      const mockPayment = {
        reference: 'SWM-123',
        orderId: 'order123',
        amount: 5000,
        status: 'pending',
        save: jest.fn(),
      };

      (Payment.findOne as jest.Mock).mockResolvedValue(mockPayment);
      (Order.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

      await paymentController.handlePaystackWebhook(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should reject invalid webhook signature', async () => {
      mockRequest.body = { event: 'charge.success' };
      mockRequest.headers = {
        'x-paystack-signature': 'invalid-signature',
      };

      await expect(
        paymentController.handlePaystackWebhook(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow('Invalid webhook signature');
    });
  });
});