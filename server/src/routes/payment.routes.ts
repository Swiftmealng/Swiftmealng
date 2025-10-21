import express from "express";
import * as paymentController from "../controllers/payment.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

// All payment routes require authentication
router.use(protect);

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Initialize payment
 *     tags: [Payments]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - amount
 *             properties:
 *               orderId:
 *                 type: string
 *               amount:
 *                 type: number
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment initialized successfully
 */
router.post("/", paymentController.initiatePayment);

/**
 * @swagger
 * /payments/verify/{reference}:
 *   get:
 *     summary: Verify payment
 *     tags: [Payments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment verified successfully
 */
router.get("/verify/:reference", paymentController.verifyPayment);

export default router;
