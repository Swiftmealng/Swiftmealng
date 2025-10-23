import { sendSMS } from '../../services/sms.service';
import Logger from '../../utils/logger';
import Notification from '../../models/Notification';

// Mock dependencies
jest.mock('twilio');
jest.mock('../../utils/logger');
jest.mock('../../models/Notification');

describe('SMS Service', () => {
  const mockTwilioClient = {
    messages: {
      create: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.TWILIO_ACCOUNT_SID = 'test_account_sid';
    process.env.TWILIO_AUTH_TOKEN = 'test_auth_token';
    process.env.TWILIO_PHONE_NUMBER = '+1234567890';
    
    (Notification.create as jest.Mock).mockResolvedValue({});
  });

  describe('Phone Number Formatting', () => {
    it('should format phone number starting with 0 to E.164 format', async () => {
      mockTwilioClient.messages.create.mockResolvedValue({
        sid: 'test_sid',
        status: 'sent',
      });

      const twilio = require('twilio');
      twilio.mockReturnValue(mockTwilioClient);

      await sendSMS({
        to: '08012345678',
        message: 'Test message',
        type: 'order_placed',
      });

      expect(mockTwilioClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '+2348012345678',
        })
      );
    });

    it('should add + prefix if missing', async () => {
      mockTwilioClient.messages.create.mockResolvedValue({
        sid: 'test_sid',
        status: 'sent',
      });

      const twilio = require('twilio');
      twilio.mockReturnValue(mockTwilioClient);

      await sendSMS({
        to: '2348012345678',
        message: 'Test message',
        type: 'order_confirmed',
      });

      expect(mockTwilioClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '+2348012345678',
        })
      );
    });

    it('should keep properly formatted E.164 numbers as is', async () => {
      mockTwilioClient.messages.create.mockResolvedValue({
        sid: 'test_sid',
        status: 'sent',
      });

      const twilio = require('twilio');
      twilio.mockReturnValue(mockTwilioClient);

      await sendSMS({
        to: '+2348012345678',
        message: 'Test message',
        type: 'delivered',
      });

      expect(mockTwilioClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '+2348012345678',
        })
      );
    });
  });

  describe('SMS Sending - Success Cases', () => {
    it('should send SMS successfully with all parameters', async () => {
      mockTwilioClient.messages.create.mockResolvedValue({
        sid: 'test_message_sid',
        status: 'sent',
        to: '+2348012345678',
        from: '+1234567890',
      });

      const twilio = require('twilio');
      twilio.mockReturnValue(mockTwilioClient);

      const result = await sendSMS({
        to: '+2348012345678',
        message: 'Your order has been placed successfully',
        orderId: 'order123',
        orderNumber: 'ORD-001',
        recipientName: 'John Doe',
        type: 'order_placed',
      });

      expect(result).toBe(true);
      expect(mockTwilioClient.messages.create).toHaveBeenCalledWith({
        body: 'Your order has been placed successfully',
        from: '+1234567890',
        to: '+2348012345678',
      });
      expect(Notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'sent',
          channel: 'sms',
        })
      );
    });

    it('should log success message when SMS is sent', async () => {
      mockTwilioClient.messages.create.mockResolvedValue({
        sid: 'test_sid',
        status: 'sent',
      });

      const twilio = require('twilio');
      twilio.mockReturnValue(mockTwilioClient);

      await sendSMS({
        to: '+2348012345678',
        message: 'Test message',
        type: 'out_for_delivery',
      });

      expect(Logger.info).toHaveBeenCalled();
    });
  });

  describe('SMS Sending - Retry Logic', () => {
    it('should retry up to 3 times on failure', async () => {
      mockTwilioClient.messages.create
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          sid: 'test_sid',
          status: 'sent',
        });

      const twilio = require('twilio');
      twilio.mockReturnValue(mockTwilioClient);

      const result = await sendSMS({
        to: '+2348012345678',
        message: 'Test message',
        type: 'delay_alert',
      });

      expect(result).toBe(true);
      expect(mockTwilioClient.messages.create).toHaveBeenCalledTimes(3);
    });

    it('should fail after 3 attempts', async () => {
      mockTwilioClient.messages.create.mockRejectedValue(new Error('Persistent network error'));

      const twilio = require('twilio');
      twilio.mockReturnValue(mockTwilioClient);

      const result = await sendSMS({
        to: '+2348012345678',
        message: 'Test message',
        type: 'cancelled',
      });

      expect(result).toBe(false);
      expect(mockTwilioClient.messages.create).toHaveBeenCalledTimes(3);
      expect(Notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'failed',
        })
      );
    });
  });

  describe('SMS Sending - Twilio Not Configured', () => {
    beforeEach(() => {
      delete process.env.TWILIO_ACCOUNT_SID;
      delete process.env.TWILIO_AUTH_TOKEN;
      delete process.env.TWILIO_PHONE_NUMBER;
      jest.resetModules();
    });

    it('should log warning and create failed notification when Twilio is not configured', async () => {
      const result = await sendSMS({
        to: '+2348012345678',
        message: 'Test message',
        orderId: 'order123',
        orderNumber: 'ORD-001',
        recipientName: 'John Doe',
        type: 'order_placed',
      });

      expect(result).toBe(false);
      expect(Logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('SMS not sent - Twilio not configured'),
        expect.any(Object)
      );
      expect(Notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'failed',
          errorMessage: 'Twilio not configured',
        })
      );
    });
  });

  describe('Notification Recording', () => {
    it('should record notification with all details on success', async () => {
      mockTwilioClient.messages.create.mockResolvedValue({
        sid: 'test_sid',
        status: 'sent',
      });

      const twilio = require('twilio');
      twilio.mockReturnValue(mockTwilioClient);

      await sendSMS({
        to: '+2348012345678',
        message: 'Delivery completed',
        orderId: 'order456',
        orderNumber: 'ORD-456',
        recipientName: 'Jane Smith',
        type: 'delivered',
      });

      expect(Notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 'order456',
          orderNumber: 'ORD-456',
          type: 'delivered',
          channel: 'sms',
          recipient: {
            name: 'Jane Smith',
            phone: '+2348012345678',
          },
          message: 'Delivery completed',
          status: 'sent',
        })
      );
    });

    it('should record notification with error message on failure', async () => {
      const error = new Error('Invalid phone number');
      mockTwilioClient.messages.create.mockRejectedValue(error);

      const twilio = require('twilio');
      twilio.mockReturnValue(mockTwilioClient);

      await sendSMS({
        to: 'invalid',
        message: 'Test',
        type: 'order_placed',
      });

      expect(Notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'failed',
          errorMessage: expect.stringContaining('Invalid phone number'),
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle phone numbers with special characters', async () => {
      mockTwilioClient.messages.create.mockResolvedValue({
        sid: 'test_sid',
        status: 'sent',
      });

      const twilio = require('twilio');
      twilio.mockReturnValue(mockTwilioClient);

      await sendSMS({
        to: '+234 (801) 234-5678',
        message: 'Test message',
        type: 'order_placed',
      });

      expect(mockTwilioClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          to: expect.stringMatching(/^\+234\d+$/),
        })
      );
    });

    it('should use default values when optional parameters are missing', async () => {
      mockTwilioClient.messages.create.mockResolvedValue({
        sid: 'test_sid',
        status: 'sent',
      });

      const twilio = require('twilio');
      twilio.mockReturnValue(mockTwilioClient);

      await sendSMS({
        to: '+2348012345678',
        message: 'Test message',
        type: 'order_placed',
      });

      expect(Notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          orderNumber: 'N/A',
          recipient: expect.objectContaining({
            name: 'Customer',
          }),
        })
      );
    });
  });
});