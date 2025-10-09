import express from 'express';
import * as notificationController from '../controllers/notification.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = express.Router();

// All notification routes require authentication and admin access
router.use(protect);
router.use(restrictTo('admin', 'operations'));

/**
 * @swagger
 * /notifications/send:
 *   post:
 *     summary: Trigger notification (internal)
 *     tags: [Notifications]
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
 *               - type
 *               - channel
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               type:
 *                 type: string
 *                 enum: [order_confirmation, status_update, delay_alert, delivery_confirmation]
 *                 example: delay_alert
 *               channel:
 *                 type: string
 *                 enum: [sms, email]
 *                 example: sms
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     sent:
 *                       type: boolean
 *                       example: true
 *                     orderId:
 *                       type: string
 *                     type:
 *                       type: string
 *                     channel:
 *                       type: string
 *       404:
 *         description: Order not found
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 */
router.post('/send', notificationController.sendNotification);

export default router;
