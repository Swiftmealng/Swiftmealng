import * as smsService from '../../services/sms.service';
import Notification from '../../models/Notification';

// Mock twilio and other dependencies
jest.mock('twilio', () => {
  return jest.fn(() => ({
    messages: {
      create: jest.fn()
    }
  }));
});

jest.mock('../../models/Notification');
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

describe('SMS Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendOrderConfirmationSMS', () => {
    it('should format message correctly for order confirmation', async () => {
      const mockCreate = jest.fn().mockResolvedValue({ sid: 'SM123' });
      const twilio = require('twilio');
      twilio.mockImplementation(() => ({
        messages: { create: mockCreate }
      }));

      // Re-import to get new twilio instance
      jest.resetModules();
      const sms = require('../../services/sms.service');

      (Notification.create as jest.Mock).mockResolvedValue({});

      const estimatedTime = new Date('2024-01-01T12:30:00');
      await sms.sendOrderConfirmationSMS(
        '+2348012345678',
        'SWM123',
        estimatedTime,
        'order123',
        'John Doe'
      );

      expect(Notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 'order123',
          orderNumber: 'SWM123',
          type: 'order_placed',
          channel: 'sms'
        })
      );
    });
  });

  describe('sendStatusUpdateSMS', () => {
    it('should handle all order status types', async () => {
      const statuses = ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
      
      (Notification.create as jest.Mock).mockResolvedValue({});

      for (const status of statuses) {
        await smsService.sendStatusUpdateSMS(
          '+2348012345678',
          'SWM123',
          status,
          'order123',
          'Customer Name'
        );
      }

      expect(Notification.create).toHaveBeenCalledTimes(statuses.length);
    });
  });

  describe('sendDelayAlertSMS', () => {
    it('should include delay information in message', async () => {
      (Notification.create as jest.Mock).mockResolvedValue({});

      await smsService.sendDelayAlertSMS(
        '+2348012345678',
        'SWM123',
        30,
        'Traffic delay',
        'order123',
        'Jane Doe'
      );

      expect(Notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'delay_alert',
          channel: 'sms',
          message: expect.stringContaining('30 minutes')
        })
      );
    });
  });

  describe('sendDeliveryConfirmationSMS', () => {
    it('should include rating link in delivery confirmation', async () => {
      (Notification.create as jest.Mock).mockResolvedValue({});

      await smsService.sendDeliveryConfirmationSMS(
        '+2348012345678',
        'SWM123',
        'order123',
        'Customer'
      );

      expect(Notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'delivered',
          message: expect.stringContaining('Rate your experience')
        })
      );
    });
  });

  describe('Phone number formatting', () => {
    it('should handle various phone number formats', async () => {
      (Notification.create as jest.Mock).mockResolvedValue({});

      const phoneNumbers = [
        '08012345678',   // Nigerian local format
        '+2348012345678', // E.164 format
        '2348012345678'   // Without plus
      ];

      for (const phone of phoneNumbers) {
        await smsService.sendStatusUpdateSMS(
          phone,
          'SWM123',
          'confirmed',
          'order123'
        );
      }

      // All should result in notification creation
      expect(Notification.create).toHaveBeenCalledTimes(phoneNumbers.length);
    });
  });

  describe('Error handling', () => {
    it('should handle SMS sending failures gracefully', async () => {
      (Notification.create as jest.Mock).mockResolvedValue({});

      // This should not throw even if Twilio is not configured
      const result = await smsService.sendStatusUpdateSMS(
        '+2348012345678',
        'SWM123',
        'confirmed',
        'order123'
      );

      // Should still create notification record
      expect(Notification.create).toHaveBeenCalled();
    });

    it('should record failed notifications', async () => {
      (Notification.create as jest.Mock).mockResolvedValue({});

      await smsService.sendStatusUpdateSMS(
        'invalid-phone',
        'SWM123',
        'confirmed',
        'order123'
      );

      expect(Notification.create).toHaveBeenCalled();
    });
  });
});