import twilio from "twilio";
import Logger from "../utils/logger";
import Notification from "../models/Notification";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let twilioClient: twilio.Twilio | null = null;

// Initialize Twilio client only if credentials are provided
if (accountSid && authToken && twilioPhoneNumber) {
  twilioClient = twilio(accountSid, authToken);
  Logger.info("Twilio client initialized");
} else {
  Logger.warn("Twilio credentials not found. SMS functionality disabled.");
}

interface SendSMSParams {
  to: string;
  message: string;
  orderId?: string;
  type:
    | "order_confirmation"
    | "status_update"
    | "delay_alert"
    | "delivery_confirmation";
}

/**
 * Send SMS notification
 */
export const sendSMS = async ({
  to,
  message,
  orderId,
  type,
}: SendSMSParams): Promise<boolean> => {
  if (!twilioClient || !twilioPhoneNumber) {
    Logger.warn("SMS not sent - Twilio not configured", { to, type });

    await Notification.create({
      orderId,
      type,
      channel: "sms",
      recipient: to,
      message,
      status: "failed",
      error: "Twilio not configured",
    });
    return false;
  }

  let attemptCount = 0;
  const maxAttempts = 3;

  while (attemptCount < maxAttempts) {
    try {
      attemptCount++;

      const result = await twilioClient.messages.create({
        body: message,
        from: twilioPhoneNumber,
        to,
      });

      // Log successful send
      await Notification.create({
        orderId,
        type,
        channel: "sms",
        recipient: to,
        message,
        status: "sent",
        sentAt: new Date(),
        externalId: result.sid,
      });

      Logger.info("SMS sent successfully", { to, type, sid: result.sid });
      return true;
    } catch (error: any) {
      Logger.error("SMS send failed", {
        to,
        type,
        attempt: attemptCount,
        error: error.message,
      });

      if (attemptCount >= maxAttempts) {
        // All attempts failed, log failure
        await Notification.create({
          orderId,
          type,
          channel: "sms",
          recipient: to,
          message,
          status: "failed",
          error: error.message,
          attempts: attemptCount,
        });
        return false;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000 * attemptCount));
    }
  }

  return false;
};

/**
 * Send order confirmation SMS
 */
export const sendOrderConfirmationSMS = async (
  phone: string,
  orderNumber: string,
  estimatedTime: Date,
  orderId: string,
): Promise<boolean> => {
  const message = `Your SWIFTMEAL order ${orderNumber} has been confirmed! Estimated delivery: ${estimatedTime.toLocaleTimeString()}. Track at: ${process.env.CLIENT_URL}/track/${orderNumber}`;

  return sendSMS({
    to: phone,
    message,
    orderId,
    type: "order_confirmation",
  });
};

/**
 * Send status update SMS
 */
export const sendStatusUpdateSMS = async (
  phone: string,
  orderNumber: string,
  status: string,
  orderId: string,
): Promise<boolean> => {
  const statusMessages: Record<string, string> = {
    preparing: "Your order is being prepared",
    ready: "Your order is ready for pickup",
    out_for_delivery: "Your order is out for delivery",
    delivered: "Your order has been delivered. Enjoy your meal!",
  };

  const message = `SWIFTMEAL Order ${orderNumber}: ${statusMessages[status] || status}. Track: ${process.env.CLIENT_URL}/track/${orderNumber}`;

  return sendSMS({
    to: phone,
    message,
    orderId,
    type: "status_update",
  });
};

/**
 * Send delay alert SMS
 */
export const sendDelayAlertSMS = async (
  phone: string,
  orderNumber: string,
  delayMinutes: number,
  reason: string,
  orderId: string,
): Promise<boolean> => {
  const message = `SWIFTMEAL Alert: Your order ${orderNumber} is delayed by ${delayMinutes} minutes. Reason: ${reason}. We apologize for the inconvenience. Track: ${process.env.CLIENT_URL}/track/${orderNumber}`;

  return sendSMS({
    to: phone,
    message,
    orderId,
    type: "delay_alert",
  });
};

/**
 * Send delivery confirmation SMS
 */
export const sendDeliveryConfirmationSMS = async (
  phone: string,
  orderNumber: string,
  orderId: string,
): Promise<boolean> => {
  const message = `Your SWIFTMEAL order ${orderNumber} has been delivered! Thank you for choosing us. Rate your experience: ${process.env.CLIENT_URL}/rate/${orderNumber}`;

  return sendSMS({
    to: phone,
    message,
    orderId,
    type: "delivery_confirmation",
  });
};
