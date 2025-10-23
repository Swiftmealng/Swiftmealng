import { Request, Response } from "express";
import Payment from "../models/Payment";
import Order from "../models/Order";
import AppError from "../utils/AppError";
import asyncHandler from "../utils/asyncHandler";
import axios from "axios";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";
const PAYSTACK_BASE_URL = "https://api.paystack.co";
const PAYSTACK_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;

/**
 * Helper function to make Paystack API calls with retry and timeout
 */
const paystackRequest = async (url: string, data: any, retries = MAX_RETRIES): Promise<any> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: PAYSTACK_TIMEOUT,
      });
      return response;
    } catch (error: any) {
      if (i === retries - 1) throw error; // Last retry, throw error
      if (error.code === 'ECONNABORTED' || error.response?.status >= 500) {
        // Retry on timeout or server errors
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
        continue;
      }
      throw error; // Don't retry on client errors
    }
  }
};

/**
 * @desc    Initialize payment
 * @route   POST /api/v1/payments
 * @access  Private
 */
export const initiatePayment = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { orderId, amount, email } = req.body;

    if (!orderId || !amount) {
      throw new AppError("Order ID and amount are required", 400);
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      throw new AppError("Invalid amount", 400);
    }

    // Verify order exists
const order = await Order.findById(orderId);

if (!order) {
  throw new AppError("Order not found", 404);
}

// If order has a customerId, verify it belongs to the authenticated user
if (order.customerId && order.customerId.toString() !== userId.toString()) {
  throw new AppError("Unauthorized to access this order", 403);
}

    // Check for existing pending or successful payment (idempotency)
    const existingPayment = await Payment.findOne({
      orderId,
      status: { $in: ['pending', 'success'] }
    });

    if (existingPayment) {
      if (existingPayment.status === 'success') {
        throw new AppError("Payment already completed for this order", 400);
      }
      
      // Return existing pending payment
      return res.status(200).json({
        success: true,
        data: {
          payment: existingPayment,
          authorizationUrl: existingPayment.authorizationUrl,
          accessCode: existingPayment.accessCode,
          reference: existingPayment.reference,
        },
        message: "Using existing pending payment"
      });
    }

    // Generate unique reference
    const reference = `SWM-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}`;

    // Initialize Paystack payment with retry
    try {
      const response = await paystackRequest(
        `${PAYSTACK_BASE_URL}/transaction/initialize`,
        {
          email: email || (req as any).user.email,
          amount: amount * 100, // Convert to kobo
          reference,
          currency: "NGN",
          callback_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/${orderId}`,
          metadata: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            userId: userId.toString(),
          },
        }
      );

      const { authorization_url, access_code } = response.data.data;

      // Save payment record
      const payment = await Payment.create({
        orderId: order._id,
        orderNumber: order.orderNumber,
        userId,
        amount,
        currency: "NGN",
        reference,
        provider: "paystack",
        status: "pending",
        authorizationUrl: authorization_url,
        accessCode: access_code,
        providerResponse: response.data,
      });

      return res.status(200).json({
        success: true,
        data: {
          payment,
          authorizationUrl: authorization_url,
          accessCode: access_code,
          reference,
        },
      });
    } catch (error: any) {
      throw new AppError(
        error.response?.data?.message || "Payment initialization failed",
        500
      );
    }
  }
);

/**
 * @desc    Verify payment
 * @route   GET /api/v1/payments/verify/:reference
 * @access  Private
 */
export const verifyPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const { reference } = req.params;

    // Find payment record
    const payment = await Payment.findOne({ reference });

    if (!payment) {
      throw new AppError("Payment not found", 404);
    }

    // Verify with Paystack with retry
    try {
      const response = await axios.get(
        `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
          timeout: PAYSTACK_TIMEOUT,
        }
      );

      const { status, amount } = response.data.data;

      // Update payment status
      if (status === "success" && amount === payment.amount) {
        payment.status = "success";
        payment.paidAt = new Date();
        payment.providerResponse = response.data;
        await payment.save();

        // Update order payment status
        await Order.findByIdAndUpdate(payment.orderId, {
          paymentStatus: "paid",
        });

        res.status(200).json({
          success: true,
          data: {
            payment,
            status: "success",
            message: "Payment verified successfully",
          },
        });
      } else {
        payment.status = "failed";
        payment.providerResponse = response.data;
        await payment.save();

        res.status(400).json({
          success: false,
          data: {
            payment,
            status: "failed",
            message: "Payment verification failed",
          },
        });
      }
    } catch (error: any) {
      throw new AppError(
        error.response?.data?.message || "Payment verification failed",
        500
      );
    }
  }
);

/**
 * @desc    Handle Paystack webhook events
 * @route   POST /api/v1/payments/webhook
 * @access  Public (verified by signature)
 */
export const handlePaystackWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    // Verify webhook signature
    const hash = require('crypto')
      .createHmac('sha512', PAYSTACK_SECRET_KEY!)
      .update(JSON.stringify(req.body))
      .digest('hex');

    const signature = req.headers['x-paystack-signature'];

    if (hash !== signature) {
      throw new AppError("Invalid webhook signature", 401);
    }

    const event = req.body;
    const { event: eventType, data } = event;

    // Handle different event types
    switch (eventType) {
      case 'charge.success':
        await handleChargeSuccess(data);
        break;
      
      case 'charge.failed':
        await handleChargeFailed(data);
        break;
      
      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    // Always return 200 to acknowledge receipt
    res.status(200).json({ success: true });
  }
);

/**
 * Process a successful Paystack charge event and apply its result to the local payment and order.
 *
 * Verifies the webhook payload contains a matching payment reference and amount, marks the Payment as
 * `success` with `paidAt` and provider details, and updates the associated Order to `paymentStatus: "paid"`
 * and `status: "confirmed"`. If the payment is missing, already successful, or the amount does not match,
 * the function logs the discrepancy and returns without modifying records.
 *
 * @param data - The Paystack charge event payload (must include `reference`, `amount` in kobo, and `paid_at`)
 */
async function handleChargeSuccess(data: any) {
  const { reference, amount, paid_at } = data;

  const payment = await Payment.findOne({ reference });

  if (!payment) {
    console.error(`Payment not found for reference: ${reference}`);
    return;
  }

  // Prevent duplicate processing
  if (payment.status === 'success') {
    console.log(`Payment ${reference} already marked as successful`);
    return;
  }

  // Verify amount matches (amount from Paystack is in kobo)
  const amountInNaira = amount / 100;
  if (amountInNaira !== payment.amount) {
    console.error(`Amount mismatch for ${reference}: expected ${payment.amount}, got ${amountInNaira}`);
    return;
  }

  // Update payment
  payment.status = 'success';
  payment.paidAt = new Date(paid_at);
  payment.providerResponse = data;
  await payment.save();

  // Update order status
  await Order.findByIdAndUpdate(payment.orderId, {
    paymentStatus: 'paid',
    status: 'confirmed'
  });

  console.log(`Payment ${reference} marked as successful via webhook`);
}

/**
 * Process a Paystack "charge.failed" webhook by marking the related payment and order as failed.
 *
 * Updates the Payment identified by `data.reference` to status "failed", stores the provider payload on the payment, and sets the related Order's `paymentStatus` to "failed". If no matching Payment is found the function logs the condition and returns without throwing.
 *
 * @param data - Paystack webhook event payload; must include a `reference` that identifies the payment
 */
async function handleChargeFailed(data: any) {
  const { reference } = data;

  const payment = await Payment.findOne({ reference });

  if (!payment) {
    console.error(`Payment not found for reference: ${reference}`);
    return;
  }

  // Update payment
  payment.status = 'failed';
  payment.providerResponse = data;
  await payment.save();

  // Update order status
  await Order.findByIdAndUpdate(payment.orderId, {
    paymentStatus: 'failed'
  });

  console.log(`Payment ${reference} marked as failed via webhook`);
}