import { Request, Response } from "express";
import Payment from "../models/Payment";
import Order from "../models/Order";
import AppError from "../utils/AppError";
import asyncHandler from "../utils/asyncHandler";
import axios from "axios";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";
const PAYSTACK_BASE_URL = "https://api.paystack.co";

/**
 * @desc    Initialize payment
 * @route   POST /api/v1/payments
 * @access  Private
 */
export const initiatePayment = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).user._id;
    const { orderId, amount, email } = req.body;

    if (!orderId || !amount) {
      throw new AppError("Order ID and amount are required", 400);
    }

    // Verify order exists and belongs to user
    const order = await Order.findOne({ _id: orderId, customerId: userId });

    if (!order) {
      throw new AppError("Order not found or unauthorized", 404);
    }

    // Generate unique reference
    const reference = `SWM-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}`;

    // Initialize Paystack payment
    try {
      const response = await axios.post(
        `${PAYSTACK_BASE_URL}/transaction/initialize`,
        {
          email: email || (req as any).user.email,
          amount: amount * 100, // Convert to kobo
          reference,
          currency: "NGN",
          metadata: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            userId: userId.toString(),
          },
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
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

      res.status(200).json({
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

    // Verify with Paystack
    try {
      const response = await axios.get(
        `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
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
