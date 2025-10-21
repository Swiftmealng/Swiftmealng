import express from "express";
import * as notificationController from "../controllers/notification.controller";
import { protect, restrictTo } from "../middleware/auth.middleware";

const router = express.Router();

// All notification routes require authentication
router.use(protect);

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 50
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, sent, delivered, failed]
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 */
router.get("/", notificationController.getNotifications);

/**
 * @swagger
 * /notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
router.patch("/:notificationId/read", notificationController.markNotificationAsRead);

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.patch("/read-all", notificationController.markAllNotificationsAsRead);

router.patch("/read-all", notificationController.markAllNotificationsAsRead);

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
router.post("/send", restrictTo("admin", "operations"), notificationController.sendNotification);

export default router;
